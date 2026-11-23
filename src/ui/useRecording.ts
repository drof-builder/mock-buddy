import { useCallback, useEffect, useRef, useState } from 'react'
import { RecorderError, type RecorderErrorCode, type Recording } from '../services/recorder'
import { useServices } from './services'

export type RecordingStatus = 'idle' | 'starting' | 'recording' | 'stopping'

export interface UseRecording {
  status: RecordingStatus
  elapsedSec: number
  error: RecorderErrorCode | null
  start(): Promise<void>
  stop(): Promise<Recording | null>
  cancel(): void
  clearError(): void
}

const TICK_MS = 250

function errorCode(e: unknown): RecorderErrorCode {
  return e instanceof RecorderError ? e.code : 'failed'
}

/**
 * Drives the recorder for one screen. Elapsed time is computed from the start
 * timestamp (not by counting ticks), so it stays right when the browser
 * throttles timers in a background tab.
 */
export function useRecording(): UseRecording {
  const { recorder } = useServices()
  const [status, setStatusState] = useState<RecordingStatus>('idle')
  // The ref is read synchronously so double taps see the latest status.
  const statusRef = useRef<RecordingStatus>('idle')
  // Bumped by cancel(); a start/stop from an older attempt then stays quiet.
  const attemptRef = useRef(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState<RecorderErrorCode | null>(null)

  const setStatus = useCallback((s: RecordingStatus) => {
    statusRef.current = s
    setStatusState(s)
  }, [])

  useEffect(() => {
    if (status !== 'recording') return
    const id = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(id)
  }, [status])

  useEffect(() => {
    if (status !== 'recording') return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [status])

  useEffect(() => {
    return () => {
      if (statusRef.current !== 'idle') recorder.cancel()
    }
  }, [recorder])

  const start = useCallback(async () => {
    if (statusRef.current !== 'idle') return
    setStatus('starting')
    setError(null)
    const attempt = attemptRef.current
    try {
      await recorder.start()
      if (attempt !== attemptRef.current) return
      const t = Date.now()
      setStartedAt(t)
      setNow(t)
      setStatus('recording')
    } catch (e) {
      if (attempt !== attemptRef.current) return
      setError(errorCode(e))
      setStatus('idle')
    }
  }, [recorder, setStatus])

  const stop = useCallback(async (): Promise<Recording | null> => {
    if (statusRef.current !== 'recording') return null
    setStatus('stopping')
    const attempt = attemptRef.current
    try {
      return await recorder.stop()
    } catch (e) {
      if (attempt === attemptRef.current) setError(errorCode(e))
      return null
    } finally {
      if (attempt === attemptRef.current) {
        setStartedAt(null)
        setStatus('idle')
      }
    }
  }, [recorder, setStatus])

  const cancel = useCallback(() => {
    if (statusRef.current === 'idle') return
    attemptRef.current++
    recorder.cancel()
    setStartedAt(null)
    setStatus('idle')
  }, [recorder, setStatus])

  const clearError = useCallback(() => setError(null), [])

  const elapsedSec = startedAt === null ? 0 : Math.max(0, Math.floor((now - startedAt) / 1000))

  return { status, elapsedSec, error, start, stop, cancel, clearError }
}
