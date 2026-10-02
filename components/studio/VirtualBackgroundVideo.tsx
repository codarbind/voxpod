'use client'

import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

export type BackgroundEffectStatus = 'idle' | 'loading' | 'ready' | 'error'

export type VideoBackgroundEffect = {
  type: 'none' | 'blur' | 'image'
  source?: string
  name?: string
  objectUrl?: boolean
}

interface VirtualBackgroundVideoProps {
  stream: MediaStream | null
  enabled?: boolean
  className?: string
  videoRef?: RefObject<HTMLVideoElement | null>
  backgroundEffect?: VideoBackgroundEffect
  onProcessedStream?: (stream: MediaStream | null) => void
  onStatusChange?: (status: BackgroundEffectStatus, error?: string) => void
  retryToken?: number
}

const WASM_PATH = '/mediapipe/wasm'
const MODEL_PATH = '/models/selfie_segmenter.tflite'
const PROCESSING_WIDTH = 640

const HIDDEN_VIDEO_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  opacity: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
}

const DIAGNOSTICS = true

function describeContext(target: CanvasRenderingContext2D) {
  const transform = target.getTransform()
  return {
    globalCompositeOperation: target.globalCompositeOperation,
    globalAlpha: target.globalAlpha,
    filter: target.filter,
    transform: [transform.a, transform.b, transform.c, transform.d, transform.e, transform.f].join(','),
  }
}

function resetContextState(target: CanvasRenderingContext2D) {
  target.globalCompositeOperation = 'source-over'
  target.globalAlpha = 1
  target.filter = 'none'
  target.setTransform(1, 0, 0, 1, 0, 0)
}

export default function VirtualBackgroundVideo({
  stream,
  className,
  videoRef: externalVideoRef,
  backgroundEffect = { type: 'none' },
  onProcessedStream,
  onStatusChange,
  retryToken = 0,
}: VirtualBackgroundVideoProps) {
  const sourceVideoRef = useRef<HTMLVideoElement>(null)
  const sourceVideo = externalVideoRef ?? sourceVideoRef
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const segmenterRef = useRef<import('@mediapipe/tasks-vision').ImageSegmenter | null>(null)
  const outputStreamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)
  const backgroundRef = useRef<HTMLImageElement | null>(null)
  const maskImageDataRef = useRef<ImageData | null>(null)
  const diagRef = useRef({ lastLog: 0, personFraction: -1, maskSize: 'n/a' })
  const onProcessedStreamRef = useRef(onProcessedStream)
  const onStatusChangeRef = useRef(onStatusChange)
  const [segmenterReady, setSegmenterReady] = useState(false)
  const [segmenterStatus, setSegmenterStatus] = useState<{ status: BackgroundEffectStatus; error?: string }>({ status: 'idle' })
  const segmenterStatusRef = useRef(segmenterStatus)

  const effectType = backgroundEffect.type
  const effectSource = backgroundEffect.type === 'image' ? backgroundEffect.source : undefined
  const effectEnabled = effectType !== 'none'

  useEffect(() => { onProcessedStreamRef.current = onProcessedStream })
  useEffect(() => { onStatusChangeRef.current = onStatusChange })

  useEffect(() => { segmenterStatusRef.current = segmenterStatus }, [segmenterStatus])

  useEffect(() => {
    if (!DIAGNOSTICS) return
    const video = sourceVideo.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const readElement = (element: HTMLElement, tag: string) => {
      const style = getComputedStyle(element)
      const box = element.getBoundingClientRect()
      console.log(`[diag:stage8] ${tag}`, {
        position: style.position,
        zIndex: style.zIndex,
        opacity: style.opacity,
        visibility: style.visibility,
        display: style.display,
        overflow: style.overflow,
        clip: style.clip,
        transform: style.transform,
        width: style.width,
        height: style.height,
        box: `${Math.round(box.width)}x${Math.round(box.height)}`,
        elementAtCenter: document.elementFromPoint(
          Math.round(box.left + box.width / 2),
          Math.round(box.top + box.height / 2),
        )?.tagName,
      })
    }
    const timer = window.setTimeout(() => {
      console.log('[diag:stage8] video count in document:', document.querySelectorAll('video').length)
      console.log('[diag:stage8] canvas count in document:', document.querySelectorAll('canvas').length)
      readElement(video, 'source video')
      readElement(canvas, 'processed canvas')
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [sourceVideo])

  useEffect(() => {
    onStatusChangeRef.current?.(segmenterStatus.status, segmenterStatus.error)
  }, [segmenterStatus])

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
    if (effectType !== 'image' || !effectSource) {
      backgroundRef.current = null
      return
    }
    let cancelled = false
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => { if (!cancelled) backgroundRef.current = image }
    image.onerror = () => { if (!cancelled) backgroundRef.current = null }
    image.src = effectSource
    return () => {
      cancelled = true
      image.onload = null
      image.onerror = null
      backgroundRef.current = null
    }
  }, [effectType, effectSource])

  useEffect(() => {
    let cancelled = false
    segmenterRef.current?.close()
    segmenterRef.current = null
    setSegmenterReady(false)

    if (!stream || !effectEnabled) {
      setSegmenterStatus({ status: 'idle' })
      return
    }

    setSegmenterStatus({ status: 'loading' })

    const createSegmenter = async (delegate: 'GPU' | 'CPU') => {
      const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision')
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH)
      return ImageSegmenter.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate },
        runningMode: 'VIDEO',
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      })
    }

    void (async () => {
      try {
        let segmenter: import('@mediapipe/tasks-vision').ImageSegmenter
        try {
          segmenter = await createSegmenter('GPU')
        } catch (gpuError) {
          console.warn('[background] GPU delegate unavailable, retrying with the CPU delegate.', gpuError)
          segmenter = await createSegmenter('CPU')
        }
        if (cancelled) {
          segmenter.close()
          return
        }
        segmenterRef.current = segmenter
        setSegmenterReady(true)
        setSegmenterStatus({ status: 'ready' })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.warn('[background] Virtual background unavailable; using the normal camera feed.', error)
        if (cancelled) return
        segmenterRef.current = null
        setSegmenterReady(false)
        setSegmenterStatus({ status: 'error', error: message })
      }
    })()

    return () => {
      cancelled = true
      segmenterRef.current?.close()
      segmenterRef.current = null
    }
  }, [effectEnabled, retryToken, stream])

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
    onProcessedStreamRef.current?.(outputStream)

    let cancelled = false
    let lastTimestamp = -1
    let segmentationFailed = false

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
      }
      if (personCanvas.width !== width || personCanvas.height !== height) {
        personCanvas.width = width
        personCanvas.height = height
      }

      resetContextState(context)
      resetContextState(maskContext)
      resetContextState(personContext)

      context.clearRect(0, 0, width, height)
      maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
      personContext.clearRect(0, 0, width, height)

      const now = performance.now()
      const shouldLog = DIAGNOSTICS && now - diagRef.current.lastLog > 1000
      if (shouldLog) diagRef.current.lastLog = now
      const stateAtFrameStart = shouldLog
        ? { out: describeContext(context), person: describeContext(personContext), mask: describeContext(maskContext) }
        : null
      const pixelAfterClear = shouldLog ? Array.from(context.getImageData(0, 0, 1, 1).data) : null

      const segmenter = segmentationFailed ? null : segmenterRef.current
      const effectActive = effectEnabled && segmenterReady && segmenter !== null
      const background = effectType === 'image' ? backgroundRef.current : null

      if (effectActive && background) {
        const scale = Math.max(width / background.naturalWidth, height / background.naturalHeight)
        const drawWidth = background.naturalWidth * scale
        const drawHeight = background.naturalHeight * scale
        context.drawImage(background, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
      } else if (effectActive && effectType === 'blur') {
        context.save()
        context.filter = `blur(${Math.max(8, Math.round(width / 40))}px)`
        context.drawImage(video, 0, 0, width, height)
        context.restore()
      } else {
        context.drawImage(video, 0, 0, width, height)
      }

      if (effectActive) {
        const timestamp = Math.max(Math.round(performance.now()), lastTimestamp + 1)
        lastTimestamp = timestamp
        try {
          const result = segmenter.segmentForVideo(video, timestamp)
          const mask = result.categoryMask
          if (mask) {
            const maskWidth = mask.width
            const maskHeight = mask.height
            diagRef.current.maskSize = `${maskWidth}x${maskHeight}`
            if (maskCanvas.width !== maskWidth || maskCanvas.height !== maskHeight) {
              maskCanvas.width = maskWidth
              maskCanvas.height = maskHeight
              resetContextState(maskContext)
            }
            const values = mask.getAsUint8Array()
            const cached = maskImageDataRef.current
            const imageData =
              cached && cached.width === maskWidth && cached.height === maskHeight
                ? cached
                : maskContext.createImageData(maskWidth, maskHeight)
            if (imageData !== cached) maskImageDataRef.current = imageData
            imageData.data.fill(0)
            let personPixels = 0
            for (let index = 0; index < values.length; index += 1) {
              const isPerson = values[index] === 0
              imageData.data[index * 4 + 3] = isPerson ? 255 : 0
              if (isPerson) personPixels += 1
            }
            diagRef.current.personFraction = values.length ? personPixels / values.length : -1
            maskContext.putImageData(imageData, 0, 0)

            personContext.drawImage(video, 0, 0, width, height)
            personContext.save()
            personContext.globalCompositeOperation = 'destination-in'
            personContext.drawImage(maskCanvas, 0, 0, width, height)
            personContext.restore()

            context.drawImage(personCanvas, 0, 0, width, height)
            mask.close()
          }
          result.close()
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          console.warn('[background] Segmentation failed; falling back to the plain camera feed.', error)
          segmentationFailed = true
          setSegmenterStatus({ status: 'error', error: message })
          resetContextState(context)
          context.clearRect(0, 0, width, height)
          context.drawImage(video, 0, 0, width, height)
        }
      }

      if (shouldLog) {
        const pixelAfterDraw = Array.from(context.getImageData(0, 0, 1, 1).data)
        const personFraction = diagRef.current.personFraction
        if (personFraction >= 0 && (personFraction < 0.03 || personFraction > 0.75)) {
          console.warn('[diag:polarity] person ratio', personFraction.toFixed(3), 'is implausible - check mask polarity')
        }
        console.log('[diag:stage7]', {
          effectType,
          effectActive,
          segmenterReady,
          status: segmenterStatusRef.current.status,
          frameStart: stateAtFrameStart,
          frameEnd: {
            out: describeContext(context),
            person: describeContext(personContext),
            mask: describeContext(maskContext),
          },
          pixelAfterClear,
          pixelAfterDraw,
          cornerChanged: pixelAfterClear?.join(',') !== pixelAfterDraw.join(','),
          personFraction: Number(diagRef.current.personFraction.toFixed(3)),
          canvasSize: `${canvas.width}x${canvas.height}`,
          maskSize: diagRef.current.maskSize,
          maskCanvasSize: `${maskCanvas.width}x${maskCanvas.height}`,
          personCanvasSize: `${personCanvas.width}x${personCanvas.height}`,
          cutoutCoverage: (() => {
            const cols = 5
            const rows = 3
            const cell = { w: Math.floor(personCanvas.width / cols), h: Math.floor(personCanvas.height / rows) }
            const grid: string[] = []
            for (let r = 0; r < rows; r += 1) {
              for (let c = 0; c < cols; c += 1) {
                const px = personContext.getImageData(c * cell.w + (cell.w >> 1), r * cell.h + (cell.h >> 1), 1, 1).data[3]
                grid.push(px > 127 ? '#' : '.')
              }
            }
            return grid.join('')
          })(),
        })
      }

      frameRef.current = requestAnimationFrame(render)
    }

    frameRef.current = requestAnimationFrame(render)
    return () => {
      cancelled = true
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      outputStream?.getTracks().forEach((track) => track.stop())
      outputStreamRef.current = null
      onProcessedStreamRef.current?.(null)
    }
  }, [effectEnabled, effectType, segmenterReady, stream, sourceVideo])

  return (
    <>
      <video
        ref={sourceVideo}
        autoPlay
        playsInline
        muted
        style={HIDDEN_VIDEO_STYLE}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      <canvas ref={canvasRef} className={className} role="img" aria-label="Processed camera preview" />
    </>
  )
}