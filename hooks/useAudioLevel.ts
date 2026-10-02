'use client'

import { useEffect, useRef, useState } from 'react'

export function useAudioLevel(stream: MediaStream | null, enabled: boolean = true) {
  const [audioLevel, setAudioLevel] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (!stream || !enabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()

      analyser.fftSize = 256
      source.connect(analyser)

      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

      const updateLevel = () => {
        if (!analyserRef.current || !dataArrayRef.current) return

        analyserRef.current.getByteFrequencyData(dataArrayRef.current)

        let sum = 0
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i]
        }

        const average = sum / dataArrayRef.current.length
        const normalizedLevel = Math.min(1, average / 255)

        setAudioLevel(normalizedLevel)

        animationFrameRef.current = requestAnimationFrame(updateLevel)
      }

      updateLevel()
    } catch (err) {
      console.error('Audio analysis setup failed:', err)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [stream, enabled])

  return audioLevel
}
