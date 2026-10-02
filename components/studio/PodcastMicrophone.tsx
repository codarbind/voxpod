'use client'

import { Microphone } from '@/lib/microphones'

interface PodcastMicrophoneProps {
  microphone: Microphone
  audioLevel: number
  muted: boolean
}

export default function PodcastMicrophone({
  microphone,
  audioLevel,
  muted,
}: PodcastMicrophoneProps) {
  const glowIntensity = audioLevel > 0.05 ? Math.min(1, audioLevel * 1.5) : 0.3
  const scaleAmount = 1 + audioLevel * 0.1

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated outer ring when speaking */}
      {audioLevel > 0.05 && !muted && (
        <>
          <div
            className="absolute inset-0 rounded-full border-2 border-amber-500/30"
            style={{
              animation: `pulse-ring 1.5s ease-out infinite`,
              opacity: audioLevel * 0.6,
            }}
          />
          <div
            className="absolute inset-0 rounded-full border border-amber-500/20"
            style={{
              animation: `pulse-ring 2s ease-out infinite`,
              animationDelay: '0.3s',
              opacity: audioLevel * 0.3,
            }}
          />
        </>
      )}

      {/* Main microphone body */}
      <div
        className="relative transition-transform duration-75 ease-out"
        style={{
          transform: `scale(${scaleAmount * microphone.scale})`,
        }}
      >
        {/* Microphone glow */}
        {!muted && (
          <div
            className="absolute -inset-8 rounded-full blur-xl transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle, rgba(251, 146, 60, ${glowIntensity * 0.4}) 0%, transparent 70%)`,
              opacity: glowIntensity,
            }}
          />
        )}

        {/* Microphone asset */}
        <img
          key={microphone.id}
          src={microphone.image}
          alt={microphone.name}
          className={`relative z-10 h-auto w-[clamp(11rem,24vw,22rem)] object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.55)] transition-[filter] duration-300 ${muted ? 'grayscale brightness-75' : ''}`}
          style={{
            transform: `translate(${microphone.offsetX}px, ${microphone.offsetY}px)`,
          }}
        />

        {/* Muted indicator */}
        {muted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <line x1="8" y1="8" x2="32" y2="32" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
