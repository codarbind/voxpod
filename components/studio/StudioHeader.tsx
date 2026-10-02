'use client'

export default function StudioHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm">
      {/* Studio name */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-white">Virtual Podcast Studio</h1>
        <p className="text-xs text-amber-400/60">Premium Audio Experience</p>
      </div>

      {/* Studio selector */}
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs text-white/50">Studio</p>
          <p className="font-medium text-white">Modern Podcast</p>
        </div>
        <div className="h-2 w-2 rounded-full bg-amber-500" />
      </div>
    </div>
  )
}
