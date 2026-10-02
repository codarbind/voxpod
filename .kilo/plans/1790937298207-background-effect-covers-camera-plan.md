# Background effects cover the camera feed instead of sitting behind the speaker

## Context (verified with the user)

Two independent background layers exist:

- **Stage scene** — `components/studio/StudioBackground.tsx` paints `scene.image` behind the whole stage.
- **Per-speaker effect** — `components/studio/VirtualBackgroundVideo.tsx` paints the effect only inside the camera canvas, which is constrained to `max-w-3xl` by `components/studio/Speaker.tsx:20`.

Confirmed symptom: the **camera feed** is what gets covered. The stage scene photo is not involved, so `StudioBackground.tsx` needs no change.

### Root cause

`VirtualBackgroundVideo.tsx:139-153` paints the effect image / blur across the **entire** canvas, but the person is only composited on top in the block at `VirtualBackgroundVideo.tsx:155-179`, guarded by `segmenter && segmenterReady`.

`segmenterReady` requires MediaPipe WASM + model assets fetched over the network (`VirtualBackgroundVideo.tsx:20-21`, loaded at `:76-83`) using `delegate: 'GPU'`. Any failure (offline, blocked CDN, missing WebGL2/GPU delegate) only hits `console.warn` at `VirtualBackgroundVideo.tsx:89-92`, leaving `segmenterReady === false` forever — the effect then permanently covers the camera with no person drawn over it.

Secondary suspect to verify: mask polarity at `VirtualBackgroundVideo.tsx:167` (`values[index] > 0` treated as person). If inverted, the person region is cut out and the effect is all that remains — identical symptom.

Note: `public/mediapipe/wasm/` is already staged locally but untracked and unused; the code still points at the CDN. `scripts/` is empty.

## Decisions (agreed with the user)

1. Until the segmenter is ready, and permanently if it fails, the tile shows the **plain camera feed**. The effect is never painted without a person cutout.
2. On failure the effects panel shows an inline error with a **Retry** action; the tile stays on the plain feed.
3. **Self-host** the WASM and the model under `public/`, via a reproducible copy script (no CDN dependency at runtime).
4. GPU delegate first, automatic retry with CPU delegate before reporting failure.

## Tasks (ordered)

### 1. Self-host MediaPipe assets

- Add `scripts/copy-mediapipe-assets.mjs`:
  - Copy **all** files from `node_modules/@mediapipe/tasks-vision/wasm` → `public/mediapipe/wasm` (the staged copy is missing `vision_wasm_module_internal.*`, which tasks-vision 1.0.1 may request).
  - If `public/models/selfie_segmenter.tflite` is missing, download it from the current `MODEL_PATH` URL and log a clear message if the machine is offline. Commit the resulting `.tflite` so re-runs are a no-op.
- Add `"assets:mediapipe": "node scripts/copy-mediapipe-assets.mjs"` to `package.json` scripts.
- In `VirtualBackgroundVideo.tsx`, point the constants at local assets:
  - `WASM_PATH = '/mediapipe/wasm'`
  - `MODEL_PATH = '/models/selfie_segmenter.tflite'`

### 2. Plumb effect status and retry

- Export `export type BackgroundEffectStatus = 'idle' | 'loading' | 'ready' | 'error'` from `VirtualBackgroundVideo.tsx`.
- Add optional props: `onStatusChange?: (status: BackgroundEffectStatus, error?: string) => void` and `retryToken?: number` (add `retryToken` to the segmenter effect deps so a bump re-runs initialization).
- `Speaker.tsx`: forward both props to `VirtualBackgroundVideo`.
- `PodcastStudio.tsx`: hold `backgroundEffectStatus` + `backgroundEffectRetryToken` state; reset status to `idle` (or `loading`) whenever `backgroundEffect.type` changes to a non-`none` value; expose `onRetryBackgroundEffect` that increments the token.
- `StudioControls.tsx`: accept `backgroundEffectStatus` and `onRetryBackgroundEffect` and pass them to the panel.
- `BackgroundEffectsPanel.tsx`: while `loading`, show "Starting background…" and disable the effect buttons; on `error`, show an amber-bordered message plus a Retry button (`RotateCw` from `lucide-react`, existing `Button` component, existing amber/zinc styling). No layout shift beyond the message row.

### 3. Gate the effect on segmentation readiness (the actual fix)

In the render loop of `VirtualBackgroundVideo.tsx`:

- Compute `const effectActive = backgroundEffect.type !== 'none' && segmenterReady && segmenterRef.current !== null`.
- Paint the effect image / blur **only** when `effectActive`; otherwise fall through to `context.drawImage(video, 0, 0, width, height)`.
- Wrap the segmentation block in `try / catch / finally`: close `mask` and `result` in `finally`, and on a thrown error report `onStatusChange('error')`, disable the effect for subsequent frames, and **keep the rAF loop alive** on the plain feed (today an exception would silently kill the loop and freeze the last frame).
- Keep the existing behaviour where an image effect whose `backgroundRef.current` is still `null` (not yet loaded) paints the plain video.

### 4. Harden segmenter initialization

- Keep the existing `cancelled` guard and cleanup semantics.
- Attempt `delegate: 'GPU'`; on rejection retry once with `delegate: 'CPU'`; only then report `onStatusChange('error')`.
- Emit `onStatusChange('loading')` at the start, `'ready'` on success, `'error'` on failure, and include the real error message in the existing `console.warn`.

### 5. Verify mask polarity (diagnostic, then remove)

- Temporarily log the fraction of mask pixels with `value > 0` about once per second.
- Expected for `selfie_segmenter`: `0 = background`, `1 = person`, so the person fraction should be well under `0.9`. If the log shows a fraction near `1.0` while the person is invisible, invert the test at `VirtualBackgroundVideo.tsx:167` to `values[index] === 0` and delete the temporary log.

### 6. Minor cleanup (only while in the file)

- Hoist the per-frame `maskContext.createImageData(...)` allocation into the existing canvas-size-change block so it is not reallocated every frame. Do not attempt further optimisation (frame skipping, lower mask resolution) unless profiling shows it is needed.

## Validation

- `pnpm tsc --noEmit` and `pnpm build` pass.
- `pnpm dev`, open the studio with a camera granted (e.g. `?scene=code-neon`):
  - **Blur**: plain camera immediately, then a sharp cutout over the blurred feed within a few seconds — no black flash, no full-bleed blur covering the face.
  - **Each preset image**: person in front, image behind it, cover-fitted, no letterboxing.
  - **Upload** (JPG/PNG/WebP ≤ 8 MB): same result; invalid type / oversize files still show the existing inline error; remove button clears to `none`; object URLs are still revoked on change and unmount.
  - Rapid switching blur → image → none starts no duplicate rAF loops and leaves no console errors.
- Network tab: requests go to `/mediapipe/wasm/…` and `/models/selfie_segmenter.tflite`; **no** requests to `cdn.jsdelivr.net` or `storage.googleapis.com`.
- With the browser network disabled after first load, the effect still works (self-hosted assets).
- Failure path: temporarily point `MODEL_PATH` at a missing file → panel shows the error with Retry, tile stays on the plain camera feed, no exception spam; restoring the path and clicking Retry recovers to `ready`.
- `pnpm assets:mediapipe` is idempotent and safe to re-run.

## Risks

- Adding all six WASM files grows the repo/deploy by ~23 MB; if the copy script confirms only `vision_wasm_internal.*` and `vision_wasm_nosimd_internal.*` are fetched, the script can copy just those.
- The model download in the script needs network on first run; commit `public/models/selfie_segmenter.tflite` so it is only a bootstrap step.
- tasks-vision 1.0.1 may select `vision_wasm_module_internal.*`; copy all files rather than assuming the subset.
- Mask polarity is assumed, not proven — step 5 must be completed before considering the fix verified.
- `public/mediapipe/` is currently untracked; make sure the copied assets are intentionally added to version control (check the repo's stance on committing binaries).

## Out of scope

- Applying the effect to the whole stage instead of the camera tile.
- Any change to `StudioBackground.tsx` or its decorative layers.
- The duplicate listing of `studioScenes` images as effect presets in `BackgroundEffectsPanel`.
- Optimising segmentation throughput beyond the `createImageData` hoist.