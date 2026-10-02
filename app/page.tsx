'use client'

import Link from 'next/link'
import { ArrowRight, Check, Headphones, Mic2, Play, Radio, Sparkles } from 'lucide-react'
import { useState } from 'react'

const microphones = [
  {
    id: 'boom',
    name: 'The Broadcast',
    detail: 'Boom arm · intimate',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/leftarm-removebg-preview-1ELTi9godnuPdOUfvtwfZgXSqGotB2.png',
    accent: 'from-amber-200/20 to-orange-500/5',
  },
  {
    id: 'desktop',
    name: 'The Classic',
    detail: 'Desktop · focused',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/podcast-mic-on-isolated-transparent-background-png_1_-removebg-preview-cWumVUoJ4De6S3RX1ZYnmQLRqxBDtI.png',
    accent: 'from-slate-200/15 to-slate-500/5',
  },
  {
    id: 'shure',
    name: 'The Interview',
    detail: 'Dynamic · direct',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Podcast-Mic-PNG-File-removebg-preview-BrHNQGGCBoZx1ecWT1SPVhXsunTiBL.png',
    accent: 'from-zinc-200/15 to-zinc-700/5',
  },
  {
    id: 'white',
    name: 'The Velvet',
    detail: 'Vintage · warm',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/podcast-microphone-transparent-background-png-removebg-preview-qHFlWpv50sAj9bY9Fg1jTj4gq0qgq5.png',
    accent: 'from-orange-100/20 to-amber-500/5',
  },
]

export default function Page() {
  const [selectedMic, setSelectedMic] = useState('boom')
  const selected = microphones.find((mic) => mic.id === selectedMic) ?? microphones[0]

  return (
    <main className="min-h-screen overflow-hidden bg-[#0c0b0a] text-stone-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(186,102,39,0.18),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(93,47,23,0.16),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between py-6 lg:py-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Room tone home">
            <span className="flex size-9 items-center justify-center rounded-xl border border-orange-300/25 bg-orange-200/10 text-orange-200">
              <Radio className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-[0.28em] text-stone-200 uppercase">Room tone</span>
          </Link>
          <div className="hidden items-center gap-6 text-xs tracking-[0.16em] text-stone-500 uppercase sm:flex">
            <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-400" /> Studio ready</span>
            <Link href="/studio" className="text-stone-300 transition-colors hover:text-orange-200">Enter studio</Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 pb-12 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-4 lg:pb-16 lg:pt-4">
          <div className="relative z-10 max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-200/15 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium tracking-[0.2em] text-orange-200/80 uppercase">
              <Sparkles className="size-3" /> Your room is ready
            </div>
            <h1 className="max-w-2xl text-5xl leading-[0.98] font-medium tracking-[-0.055em] text-stone-100 sm:text-7xl lg:text-[5.65rem]">
              Make space for a <span className="text-orange-200">better conversation.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-stone-400 sm:text-lg">
              A virtual podcast studio that puts you in the room. Choose your microphone, find your light, and let the conversation take center stage.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/studio?mic=${selectedMic}`}
                className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-orange-200 px-6 text-sm font-semibold text-[#24150d] transition-all hover:bg-orange-100 hover:shadow-[0_0_32px_rgba(251,191,36,0.18)]"
              >
                Enter {selected.name}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#microphones" className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm text-stone-400 transition-colors hover:text-stone-100">
                <Play className="size-3 fill-current" /> Preview the room
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-xs text-stone-500">
              <span className="flex items-center gap-2"><Check className="size-3 text-orange-200" /> Live camera & audio</span>
              <span className="flex items-center gap-2"><Check className="size-3 text-orange-200" /> No account required</span>
            </div>
          </div>

          <div id="microphones" className="relative min-h-[420px] lg:min-h-[570px]">
            <div className="absolute inset-x-4 top-10 bottom-0 rounded-[3rem] border border-white/[0.06] bg-gradient-to-b from-[#27201a]/80 to-[#120f0d] shadow-2xl shadow-black/50 sm:inset-x-12" />
            <div className="absolute inset-x-12 top-24 h-px bg-gradient-to-r from-transparent via-orange-200/25 to-transparent" />
            <div className="absolute right-8 top-10 size-20 rounded-full bg-orange-300/10 blur-2xl sm:right-24" />
            <div className="absolute left-8 top-32 size-3 rounded-full bg-orange-200 shadow-[0_0_30px_8px_rgba(253,186,116,0.25)] sm:left-20" />
            <div className="absolute right-16 top-44 size-2 rounded-full bg-orange-200/70 shadow-[0_0_24px_7px_rgba(253,186,116,0.2)] sm:right-32" />
            <div className="absolute bottom-0 left-1/2 h-28 w-[75%] -translate-x-1/2 rounded-[50%] bg-black/80 blur-xl" />
            <div className="absolute left-1/2 top-1/2 flex w-[92%] -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <div className={`absolute -inset-8 rounded-full bg-gradient-to-br ${selected.accent} blur-3xl`} />
              <img key={selected.id} src={selected.image} alt={selected.name} className="relative max-h-[300px] w-full object-contain drop-shadow-[0_28px_22px_rgba(0,0,0,0.75)] transition-all duration-500 sm:max-h-[380px]" />
              <div className="relative mt-2 text-center">
                <p className="text-[10px] tracking-[0.28em] text-orange-200/60 uppercase">Selected microphone</p>
                <p className="mt-2 text-xl font-medium text-stone-100">{selected.name}</p>
                <p className="mt-1 text-xs text-stone-500">{selected.detail}</p>
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#181411]/90 p-2 shadow-xl backdrop-blur-md" role="radiogroup" aria-label="Choose a microphone">
              {microphones.map((mic) => (
                <button
                  key={mic.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedMic === mic.id}
                  aria-label={`Choose ${mic.name}`}
                  onClick={() => setSelectedMic(mic.id)}
                  className={`relative flex size-14 items-center justify-center overflow-hidden rounded-xl border transition-all sm:size-16 ${selectedMic === mic.id ? 'border-orange-200/70 bg-orange-200/10 shadow-[0_0_18px_rgba(251,146,60,0.15)]' : 'border-white/[0.06] bg-white/[0.025] opacity-55 hover:opacity-100'}`}
                >
                  <img src={mic.image} alt="" className="size-full object-contain p-1" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/[0.07] py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2"><Headphones className="size-3.5" /> Built for voices worth hearing.</span>
          <span className="flex items-center gap-2"><Mic2 className="size-3.5" /> Modern Podcast Studio</span>
        </footer>
      </div>
    </main>
  )
}
