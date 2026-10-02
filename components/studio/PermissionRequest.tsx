'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Camera, Mic } from 'lucide-react'

interface PermissionRequestProps {
  onRequestPermissions: () => void
  permissionStatus: 'idle' | 'requesting' | 'granted' | 'denied'
  error: string | null
}

export default function PermissionRequest({
  onRequestPermissions,
  permissionStatus,
  error,
}: PermissionRequestProps) {
  const [dismissedError, setDismissedError] = useState(false)

  if (permissionStatus === 'granted') {
    return null
  }

  const isLoading = permissionStatus === 'requesting'
  const isDenied = permissionStatus === 'denied' && error && !dismissedError
  const friendlyError = error?.toLowerCase().includes('not found')
    ? 'We could not find a camera or microphone. Connect a device and try again.'
    : error?.toLowerCase().includes('not allowed')
      ? 'Camera and microphone access is blocked. Allow access in your browser settings and try again.'
      : 'Camera and microphone access is required for the studio experience.'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-slate-900 p-8 shadow-2xl">
        {isDenied ? (
          <>
            {/* Error state */}
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-500/20 p-4">
                <AlertCircle className="size-8 text-red-400" />
              </div>
            </div>

            <h2 className="mb-2 text-center text-2xl font-bold text-white">Permission Denied</h2>

            <p className="mb-4 text-center text-white/70">
              {friendlyError}
            </p>

            <p className="mb-6 text-center text-sm text-white/50">
              Please check your browser settings and try again.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setDismissedError(false)
                  onRequestPermissions()
                }}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                Retry
              </Button>

              <Button
                onClick={() => setDismissedError(true)}
                variant="outline"
                className="w-full"
              >
                Dismiss
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Initial permission request */}
            <div className="mb-8 flex justify-center gap-4">
              <div className="rounded-lg bg-blue-500/20 p-4">
                <Camera className="size-8 text-blue-400" />
              </div>
              <div className="rounded-lg bg-amber-500/20 p-4">
                <Mic className="size-8 text-amber-400" />
              </div>
            </div>

            <h2 className="mb-2 text-center text-2xl font-bold text-white">
              Welcome to the Studio
            </h2>

            <p className="mb-6 text-center text-white/70">
              Camera and microphone access required to begin your podcast experience.
            </p>

            <Button
              onClick={onRequestPermissions}
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              {isLoading ? 'Requesting access...' : 'Grant Access'}
            </Button>

            <p className="mt-4 text-center text-xs text-white/50">
              Your privacy is important. No data is recorded or transmitted.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
