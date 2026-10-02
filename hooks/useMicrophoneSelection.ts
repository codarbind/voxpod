'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getMicrophone, getStudioScene, type Microphone, type StudioScene } from '@/lib/microphones'

export function useMicrophoneSelection() {
  const searchParams = useSearchParams()
  const [selectedMicrophone, setSelectedMicrophone] = useState<Microphone | null>(null)
  const [selectedScene, setSelectedScene] = useState<StudioScene | null>(null)

  useEffect(() => {
    const micId = searchParams.get('mic')
    const sceneId = searchParams.get('scene')
    setSelectedMicrophone(getMicrophone(micId))
    setSelectedScene(getStudioScene(sceneId))
  }, [searchParams])

  return {
    selectedMicrophone: selectedMicrophone || getMicrophone(null),
    selectedScene: selectedScene || getStudioScene(null),
    setSelectedMicrophone,
    setSelectedScene,
  }
}
