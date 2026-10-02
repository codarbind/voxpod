'use client'

import { useRef, useState } from 'react'
import { AlertTriangle, Check, ImagePlus, Loader2, RotateCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { studioScenes } from '@/lib/microphones'
import type { BackgroundEffectStatus } from './VirtualBackgroundVideo'

export type BackgroundEffect =
  | { type: 'none' }
  | { type: 'blur' }
  | { type: 'image'; source: string; name: string; objectUrl?: boolean }

interface BackgroundEffectsPanelProps {
  value: BackgroundEffect
  onChange: (effect: BackgroundEffect) => void
  onClose: () => void
  status?: BackgroundEffectStatus
  onRetry?: () => void
}

const presetBackgrounds = studioScenes.map((scene) => ({
  id: scene.id,
  name: scene.name,
  source: scene.image,
}))

export default function BackgroundEffectsPanel({ value, onChange, onClose, status = 'idle', onRetry }: BackgroundEffectsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const isLoading = value.type !== 'none' && status === 'loading'
  const effectFailed = value.type !== 'none' && status === 'error'

  const handleUpload = (file: File | undefined) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('That image is larger than 8 MB. Choose a smaller file.')
      return
    }
    setError(null)
    onChange({ type: 'image', source: URL.createObjectURL(file), name: file.name, objectUrl: true })
  }

  return (
    <div className="absolute bottom-full right-0 mb-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-zinc-950/95 p-4 text-white shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Background effects</h2>
          <p className="mt-1 text-xs text-white/50">Your camera stays natural while the background changes.</p>
        </div>
        <button type="button" onClick={onClose} className="text-xs text-white/50 hover:text-white" aria-label="Close background effects">Close</button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <EffectButton label="None" selected={value.type === 'none'} disabled={isLoading} onClick={() => onChange({ type: 'none' })}>
          <div className="h-16 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900" />
        </EffectButton>
        <EffectButton label="Blur" selected={value.type === 'blur'} disabled={isLoading} onClick={() => onChange({ type: 'blur' })}>
          <div className="h-16 rounded-lg bg-[radial-gradient(circle_at_30%_30%,#d6a66a,#45362c_45%,#161616)] blur-[2px]" />
        </EffectButton>
        {presetBackgrounds.filter((preset) => preset.source).map((preset) => (
          <EffectButton key={preset.id} label={preset.name} selected={value.type === 'image' && value.source === preset.source} disabled={isLoading} onClick={() => onChange({ type: 'image', source: preset.source, name: preset.name })}>
            <img src={preset.source} alt="" className="h-16 w-full rounded-lg object-cover" />
          </EffectButton>
        ))}
      </div>

      {value.type === 'image' && value.objectUrl && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/5 p-2">
          <img src={value.source} alt="Uploaded background preview" className="size-10 rounded object-cover" />
          <span className="min-w-0 flex-1 truncate text-xs">{value.name}</span>
          <Button variant="ghost" size="icon" onClick={() => onChange({ type: 'none' })} aria-label="Remove uploaded background"><Trash2 /></Button>
        </div>
      )}

      {isLoading && (
        <p className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/70" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Starting background effect — your camera shows through until it is ready.
        </p>
      )}

      {effectFailed && (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-2" role="alert">
          <p className="flex items-start gap-2 text-xs text-red-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>The background effect could not start, so your camera is shown unchanged.</span>
          </p>
          {onRetry && (
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={onRetry}>
              <RotateCw data-icon="inline-start" /> Retry
            </Button>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isLoading}>
          <ImagePlus data-icon="inline-start" /> Upload background
        </Button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { handleUpload(event.target.files?.[0]); event.currentTarget.value = '' }} />
      </div>
      {error && <p className="mt-2 text-xs text-red-300" role="alert">{error}</p>}
    </div>
  )
}

function EffectButton({ label, selected, disabled = false, onClick, children }: { label: string; selected: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={selected} aria-busy={disabled} className={`group rounded-xl text-left outline-none ring-amber-300 focus-visible:ring-2 disabled:cursor-wait disabled:opacity-60 ${selected ? 'text-amber-300' : 'text-white/70'}`}>
      <div className={`relative rounded-lg p-0.5 ${selected ? 'bg-amber-300' : 'bg-white/10 group-hover:bg-white/30'}`}>
        {children}
        {selected && <span className="absolute right-1 top-1 rounded-full bg-amber-300 p-0.5 text-black"><Check /></span>}
      </div>
      <span className="mt-1 block truncate text-[11px]">{label}</span>
    </button>
  )
}
