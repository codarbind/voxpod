'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalMedia } from '@/hooks/useLocalMedia'
import { useAudioLevel } from '@/hooks/useAudioLevel'
import { useMicrophoneSelection } from '@/hooks/useMicrophoneSelection'
import StudioBackground from './StudioBackground'
import AmbientLighting from './AmbientLighting'
import Speaker from './Speaker'
import StudioControls from './StudioControls'
import StudioHeader from './StudioHeader'
import PermissionRequest from './PermissionRequest'
import type { BackgroundEffectStatus } from './VirtualBackgroundVideo'
import type { BackgroundEffect } from './BackgroundEffectsPanel'

export default function PodcastStudio() {
  const router = useRouter()
  const { stream, videoRef, permissionStatus, error, isCameraEnabled, isMicrophoneEnabled, requestPermissions, toggleCamera, toggleMicrophone, stopStream } = useLocalMedia()
  const { selectedMicrophone, selectedScene, setSelectedMicrophone, setSelectedScene } = useMicrophoneSelection()
  const [backgroundEffect, setBackgroundEffect] = useState<BackgroundEffect>({ type: 'none' })
  const [backgroundEffectStatus, setBackgroundEffectStatus] = useState<BackgroundEffectStatus>('idle')
  const [backgroundEffectRetryToken, setBackgroundEffectRetryToken] = useState(0)
  const audioLevel = useAudioLevel(stream, isMicrophoneEnabled)

  useEffect(() => { requestPermissions() }, [requestPermissions])
  useEffect(() => () => { if (backgroundEffect.type === 'image' && backgroundEffect.objectUrl) URL.revokeObjectURL(backgroundEffect.source) }, [backgroundEffect])

  const handleBackgroundEffectStatusChange = useCallback((status: BackgroundEffectStatus) => { setBackgroundEffectStatus(status) }, [])
  const handleRetryBackgroundEffect = useCallback(() => setBackgroundEffectRetryToken((token) => token + 1), [])

  const handleExit = () => { stopStream(); router.push('/') }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <StudioBackground scene={selectedScene} />
      <AmbientLighting />
      <StudioHeader />
      <div className="relative z-20 flex h-full w-full flex-col items-center justify-center px-4 pb-32 pt-24">
        {stream && permissionStatus === 'granted' && <div className="h-full w-full"><Speaker videoStream={stream} videoRef={videoRef} name="You" audioLevel={audioLevel} muted={!isMicrophoneEnabled} microphone={selectedMicrophone} backgroundEffect={backgroundEffect} onBackgroundEffectStatusChange={handleBackgroundEffectStatusChange} backgroundEffectRetryToken={backgroundEffectRetryToken} /></div>}
      </div>
      {stream && permissionStatus === 'granted' && <StudioControls isMicrophoneEnabled={isMicrophoneEnabled} isCameraEnabled={isCameraEnabled} onToggleMicrophone={toggleMicrophone} onToggleCamera={toggleCamera} onExit={handleExit} selectedMicrophone={selectedMicrophone} onSelectMicrophone={setSelectedMicrophone} selectedScene={selectedScene} onSelectScene={setSelectedScene} backgroundEffect={backgroundEffect} onBackgroundEffectChange={setBackgroundEffect} backgroundEffectStatus={backgroundEffectStatus} onRetryBackgroundEffect={handleRetryBackgroundEffect} />}
      <PermissionRequest onRequestPermissions={requestPermissions} permissionStatus={permissionStatus} error={error} />
    </div>
  )
}
