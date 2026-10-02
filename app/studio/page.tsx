import { Suspense } from 'react'
import PodcastStudio from '@/components/studio/PodcastStudio'

export default function StudioPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <Suspense fallback={<div className="h-full w-full bg-black" />}>
        <PodcastStudio />
      </Suspense>
    </main>
  )
}
