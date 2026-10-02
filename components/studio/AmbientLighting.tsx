'use client'

export default function AmbientLighting() {
  return (
    <>
      {/* Main ambient light from above */}
      <div className="pointer-events-none fixed inset-0">
        {/* Subtle top gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/30 via-transparent to-transparent" />

        {/* Left warm accent */}
        <div
          className="absolute -left-96 top-1/4 h-96 w-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Right cool accent */}
        <div
          className="absolute -right-96 top-1/3 h-96 w-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
          }}
        />

        {/* Bottom warm glow */}
        <div
          className="absolute -bottom-48 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.1) 0%, transparent 70%)',
          }}
        />
      </div>
    </>
  )
}
