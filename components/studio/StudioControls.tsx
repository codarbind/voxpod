'use client'

import { useState } from 'react'
import { Mic, MicOff, Video, VideoOff, LogOut, Maximize2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { microphones, studioScenes, type Microphone, type StudioScene } from '@/lib/microphones'
import BackgroundEffectsPanel, { type BackgroundEffect } from './BackgroundEffectsPanel'
import type { BackgroundEffectStatus } from './VirtualBackgroundVideo'

interface StudioControlsProps {
  isMicrophoneEnabled: boolean
  isCameraEnabled: boolean
  onToggleMicrophone: () => void
  onToggleCamera: () => void
  onExit: () => void
  selectedMicrophone: Microphone
  onSelectMicrophone: (microphone: Microphone) => void
  selectedScene: StudioScene
  onSelectScene: (scene: StudioScene) => void
  backgroundEffect: BackgroundEffect
  onBackgroundEffectChange: (effect: BackgroundEffect) => void
  backgroundEffectStatus?: BackgroundEffectStatus
  onRetryBackgroundEffect?: () => void
}

export default function StudioControls({ isMicrophoneEnabled, isCameraEnabled, onToggleMicrophone, onToggleCamera, onExit, selectedMicrophone, onSelectMicrophone, selectedScene, onSelectScene, backgroundEffect, onBackgroundEffectChange, backgroundEffectStatus, onRetryBackgroundEffect }: StudioControlsProps) {
  const [showEffects, setShowEffects] = useState(false)
  const toggleFullscreen = () => document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen().catch(() => undefined)
  return (
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
      <div className="relative rounded-full bg-black/70 px-2 py-3 backdrop-blur-md">
        {showEffects && <BackgroundEffectsPanel value={backgroundEffect} onChange={onBackgroundEffectChange} onClose={() => setShowEffects(false)} status={backgroundEffectStatus} onRetry={onRetryBackgroundEffect} />}
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="studio-microphone">Microphone</label>
          <select id="studio-microphone" value={selectedMicrophone.id} onChange={(event) => onSelectMicrophone(microphones.find((mic) => mic.id === event.target.value) ?? microphones[0])} className="hidden max-w-32 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none sm:block">
            {microphones.map((microphone) => <option key={microphone.id} value={microphone.id}>{microphone.name}</option>)}
          </select>
          <label className="sr-only" htmlFor="studio-scene">Studio scene</label>
          <select id="studio-scene" value={selectedScene.id} onChange={(event) => onSelectScene(studioScenes.find((scene) => scene.id === event.target.value) ?? studioScenes[0])} className="hidden max-w-32 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none lg:block">
            {studioScenes.map((scene) => <option key={scene.id} value={scene.id}>{scene.name}</option>)}
          </select>
          <Button size="sm" variant={isMicrophoneEnabled ? 'default' : 'destructive'} onClick={onToggleMicrophone} className="rounded-full" title={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'} aria-label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}>{isMicrophoneEnabled ? <Mic /> : <MicOff />}</Button>
          <Button size="sm" variant={isCameraEnabled ? 'default' : 'destructive'} onClick={onToggleCamera} className="rounded-full" title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'} aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}>{isCameraEnabled ? <Video /> : <VideoOff />}</Button>
          <Button size="sm" variant={backgroundEffect.type === 'none' ? 'outline' : 'default'} onClick={() => setShowEffects((open) => !open)} className="rounded-full" title="Background effects" aria-label="Background effects" aria-expanded={showEffects}><Sparkles /></Button>
          <div className="mx-1 h-6 w-px bg-white/20" />
          <Button size="sm" variant="outline" onClick={toggleFullscreen} className="rounded-full" title="Toggle fullscreen" aria-label="Toggle fullscreen"><Maximize2 /></Button>
          <Button size="sm" variant="destructive" onClick={onExit} className="rounded-full" title="Exit studio" aria-label="Exit studio"><LogOut /></Button>
        </div>
      </div>
      <div className="mt-3 hidden text-center text-xs text-white/50 md:block">Podcast Studio</div>
    </div>
  )
}
