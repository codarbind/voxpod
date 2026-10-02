'use client'

import PodcastMicrophone from './PodcastMicrophone'
import VirtualBackgroundVideo from './VirtualBackgroundVideo'
import type { Microphone } from '@/lib/microphones'

interface SpeakerProps {
  videoStream: MediaStream | null
  videoRef: React.RefObject<HTMLVideoElement | null>
  name: string
  audioLevel: number
  muted: boolean
  microphone: Microphone
  backgroundEffect?: { type: 'none' | 'blur' | 'image'; source?: string }
}

export default function Speaker({ videoStream, videoRef, name, audioLevel, muted, microphone, backgroundEffect }: SpeakerProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center px-4">
      <div className="relative h-full w-full max-w-3xl">
        <div className="relative h-full w-full overflow-visible">
          <VirtualBackgroundVideo
            stream={videoStream}
            videoRef={videoRef}
            backgroundEffect={backgroundEffect}
            className="h-full w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />

          <div className="absolute bottom-6 left-6 z-10">
            <div className="rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm">
              <p className="text-sm font-medium text-white">{name}</p>
              <p className="text-xs text-amber-400/70">
                {muted ? 'Muted' : audioLevel > 0.05 ? 'Speaking' : 'Listening'}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-16 left-1/2 z-20 -translate-x-1/2 transform">
          <PodcastMicrophone microphone={microphone} audioLevel={audioLevel} muted={muted} />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}
