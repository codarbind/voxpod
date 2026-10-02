'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseLocalMediaOptions {
  audio?: boolean
  video?: boolean
}

type PermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied'

export function useLocalMedia(options: UseLocalMediaOptions = { audio: true, video: true }) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const requestingRef = useRef(false)

  const requestPermissions = useCallback(async () => {
    if (requestingRef.current || streamRef.current) return

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionStatus('denied')
      setError('Your browser does not support camera and microphone access.')
      return
    }

    requestingRef.current = true

    try {
      setPermissionStatus('requesting')
      setError(null)

      const constraints: MediaStreamConstraints = {
        audio: options.audio ? { echoCancellation: true, noiseSuppression: true } : false,
        video: options.video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream
      setStream(mediaStream)
      setPermissionStatus('granted')
    } catch (err) {
      const errorName = err instanceof DOMException ? err.name : ''
      const errorMessage =
        errorName === 'NotFoundError'
          ? 'We could not find a camera or microphone. Connect a device and try again.'
          : errorName === 'NotAllowedError' || errorName === 'SecurityError'
            ? 'Camera and microphone access was blocked. Allow access in your browser settings and try again.'
            : 'We could not access your camera or microphone. Check your devices and try again.'
      setError(errorMessage)
      setPermissionStatus('denied')
    } finally {
      requestingRef.current = false
    }
  }, [options.audio, options.video])

  const stopStream = useCallback(() => {
    const activeStream = streamRef.current
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setStream(null)
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      void videoRef.current.play().catch(() => undefined)
    }
  }, [stream])

  const toggleCamera = async () => {
    if (!stream) return

    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      const newState = !isCameraEnabled
      videoTrack.enabled = newState
      setIsCameraEnabled(newState)
    }
  }

  const toggleMicrophone = async () => {
    if (!stream) return

    const audioTrack = stream.getAudioTracks()[0]
    if (audioTrack) {
      const newState = !isMicrophoneEnabled
      audioTrack.enabled = newState
      setIsMicrophoneEnabled(newState)
    }
  }

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  return {
    stream,
    videoRef,
    permissionStatus,
    error,
    isCameraEnabled,
    isMicrophoneEnabled,
    requestPermissions,
    toggleCamera,
    toggleMicrophone,
    stopStream,
  }
}
