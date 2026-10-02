import { access, copyFile, mkdir, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(import.meta.url)
const projectRoot = process.cwd()
const packageRoot = path.dirname(require.resolve('@mediapipe/tasks-vision'))
const wasmTarget = path.join(projectRoot, 'public', 'mediapipe', 'wasm')
const modelTarget = path.join(projectRoot, 'public', 'models', 'selfie_segmenter.tflite')
const modelUrl = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite'

async function copyWasm() {
  const source = path.join(packageRoot, 'wasm')
  await mkdir(wasmTarget, { recursive: true })
  const files = await readdir(source)
  for (const file of files) {
    await copyFile(path.join(source, file), path.join(wasmTarget, file))
  }
  console.log(`[mediapipe] copied ${files.length} wasm files -> public/mediapipe/wasm`)
}

async function fetchModel() {
  await mkdir(path.dirname(modelTarget), { recursive: true })
  try {
    const response = await fetch(modelUrl)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    await writeFile(modelTarget, Buffer.from(await response.arrayBuffer()))
    console.log('[mediapipe] downloaded selfie_segmenter.tflite -> public/models')
  } catch (error) {
    console.warn(`[mediapipe] could not download the model: ${error.message}`)
    console.warn('[mediapipe] download it manually into public/models/selfie_segmenter.tflite from:')
    console.warn(`[mediapipe] ${modelUrl}`)
  }
}

await copyWasm()

try {
  await access(modelTarget)
  console.log('[mediapipe] model already present, skipping download')
} catch {
  await fetchModel()
}