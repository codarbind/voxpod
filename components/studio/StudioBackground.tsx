'use client'

import type { StudioScene } from '@/lib/microphones'

interface StudioBackgroundProps {
  scene: StudioScene
}

export default function StudioBackground({ scene }: StudioBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      {scene.image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${scene.image})` }}
          aria-label={`${scene.name} studio background`}
          role="img"
        />
      )} 
      {/* Acoustic panel texture background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.1),
              rgba(0, 0, 0, 0.1) 2px,
              transparent 2px,
              transparent 4px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.08),
              rgba(0, 0, 0, 0.08) 2px,
              transparent 2px,
              transparent 4px
            )
          `,
          backgroundSize: '100% 4px, 4px 100%',
        }}
      />

      {/* Acoustic panels - Left */}
      <div className="absolute left-0 top-0 h-full w-1/6 bg-gradient-to-r from-slate-900 to-slate-950/50" />

      {/* Acoustic panels - Right */}
      <div className="absolute right-0 top-0 h-full w-1/6 bg-gradient-to-l from-slate-900 to-slate-950/50" />

      {/* Top panel */}
      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-slate-900/50 via-slate-950/20 to-transparent" />

      {/* Depth layers */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />

      {/* Subtle floor vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Desk plane creates the grounded podcast composition */}
      <div className="absolute bottom-0 left-1/2 h-[22%] w-[92%] -translate-x-1/2 rounded-t-[50%] border-t border-amber-900/40 bg-gradient-to-b from-amber-950/80 via-stone-950 to-black shadow-[0_-24px_60px_rgba(120,53,15,0.18)]" />
      <div className="absolute bottom-[18%] left-1/2 h-px w-[70%] -translate-x-1/2 bg-amber-500/15 blur-sm" />

      {/* Soft center spotlight */}
      <div
        className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse 1200px 800px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  )
}
