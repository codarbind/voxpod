'use client'

import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

export type VideoBackgroundEffect =
  | { type: 'none' }
  | { type: 'blur' }
  | { type: 'image'; source: string; name?: string; objectUrl?: boolean }

interface VirtualBackgroundVideoProps {
  stream: MediaStream | null
  enabled?: boolean
  className?: string
  videoRef?: RefObject<HTMLVideoElement | null>
  backgroundEffect?: { type: 'none' | 'blur' | 'image'; source?: string; name?: string; objectUrl?: boolean }
  onProcessedStream?: (stream: MediaStream | null) => void
}

const WASM_PATH = '/mediapipe'
const MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite'
const PROCESSING_WIDTH = 640

export default function VirtualBackgroundVideo({
  stream,
  className,
  videoRef: externalVideoRef,
  backgroundEffect = { type: 'none' },
  onProcessedStream,
}: VirtualBackgroundVideoProps) {
  const sourceVideoRef = useRef<HTMLVideoElement>(null)
  const sourceVideo = externalVideoRef ?? sourceVideoRef
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const segmenterRef = useRef<import('@mediapipe/tasks-vision').ImageSegmenter | null>(null)
  const outputStreamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)
  const backgroundRef = useRef<HTMLImageElement | null>(null)
  const [segmenterReady, setSegmenterReady] = useState(false)

  useEffect(() => {
    const video = sourceVideo.current
    if (!video) return
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.srcObject = stream
    if (stream) void video.play().catch(() => undefined)
    return () => {
      video.pause()
      video.srcObject = null
    }
  }, [sourceVideo, stream])

  useEffect(() => {
    if (backgroundEffect.type !== 'image' || !backgroundEffect.source) {
      backgroundRef.current = null
      return
    }
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => { backgroundRef.current = image }
    image.src = backgroundEffect.source
    return () => { image.onload = null; backgroundRef.current = null }
  }, [backgroundEffect])

  useEffect(() => {
    let cancelled = false
    segmenterRef.current?.close()
    segmenterRef.current = null
    setSegmenterReady(false)

    if (!stream || backgroundEffect.type === 'none') return

    void (async () => {
      try {
        const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision')
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH)
        const segmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
          runningMode: 'VIDEO',
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        })
        if (cancelled) segmenter.close()
        else {
          segmenterRef.current = segmenter
          setSegmenterReady(true)
        }
      } catch (error) {
        console.warn('[v0] Virtual background unavailable; using the normal camera feed.', error)
        if (!cancelled) setSegmenterReady(false)
      }
    })()

    return () => {
      cancelled = true
      segmenterRef.current?.close()
      segmenterRef.current = null
    }
  }, [backgroundEffect.type, stream])

  useEffect(() => {
    const video = sourceVideo.current
    const canvas = canvasRef.current
    if (!video || !canvas || !stream) return

    const context = canvas.getContext('2d', { alpha: false })
    const maskCanvas = document.createElement('canvas')
    const maskContext = maskCanvas.getContext('2d')
    const personCanvas = document.createElement('canvas')
    const personContext = personCanvas.getContext('2d')
    if (!context || !maskContext || !personContext) return

    const outputStream = canvas.captureStream?.(30) ?? null
    outputStreamRef.current = outputStream
    onProcessedStream?.(outputStream)
    let cancelled = false
    let lastTimestamp = -1

    const render = () => {
      if (cancelled) return
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) {
        frameRef.current = requestAnimationFrame(render)
        return
      }

      const ratio = video.videoHeight / video.videoWidth
      const width = Math.min(video.videoWidth, PROCESSING_WIDTH)
      const height = Math.round(width * ratio)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        maskCanvas.width = width
        maskCanvas.height = height
        personCanvas.width = width
        personCanvas.height = height
      }

      context.clearRect(0, 0, width, height)
      const background = backgroundEffect.type === 'image' ? backgroundRef.current : null
      if (background) {
        const scale = Math.max(width / background.naturalWidth, height / background.naturalHeight)
        const drawWidth = background.naturalWidth * scale
        const drawHeight = background.naturalHeight * scale
        context.drawImage(background, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
      } else if (backgroundEffect.type === 'blur') {
        context.save()
        context.filter = `blur(${Math.max(8, Math.round(width / 40))}px)`
        context.drawImage(video, 0, 0, width, height)
        context.restore()
      } else {
        context.drawImage(video, 0, 0, width, height)
      }

      const segmenter = segmenterRef.current
      if (backgroundEffect.type !== 'none' && segmenter && segmenterReady) {
        const timestamp = Math.max(Math.round(performance.now()), lastTimestamp + 1)
        lastTimestamp = timestamp
        const result = segmenter.segmentForVideo(video, timestamp)
        const mask = result.categoryMask
        if (mask) {
          const maskWidth = mask.width
          const maskHeight = mask.height
          const values = mask.getAsUint8Array()
          const imageData = maskContext.createImageData(maskWidth, maskHeight)
          for (let index = 0; index < values.length; index += 1) {
            imageData.data[index * 4 + 3] = values[index] > 0 ? 255 : 0
          }
          maskContext.putImageData(imageData, 0, 0)
          personContext.clearRect(0, 0, width, height)
          personContext.drawImage(video, 0, 0, width, height)
          personContext.globalCompositeOperation = 'destination-in'
          personContext.drawImage(maskCanvas, 0, 0, width, height)
          personContext.globalCompositeOperation = 'source-over'
          context.drawImage(personCanvas, 0, 0, width, height)
          mask.close()
        }
        result.close()
      }

      frameRef.current = requestAnimationFrame(render)
    }

    frameRef.current = requestAnimationFrame(render)
    return () => {
      cancelled = true
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      outputStream?.getTracks().forEach((track) => track.stop())
      outputStreamRef.current = null
      onProcessedStream?.(null)
    }
  }, [backgroundEffect, onProcessedStream, segmenterReady, stream, sourceVideo])

  return (
    <>
      <video
        ref={sourceVideo}
        autoPlay
        playsInline
        muted
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-0"
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block size-full object-cover ${className ?? ''}`}
        aria-label="Processed camera preview"
      />
    </>
  )
}

// noop
