export type RecorderErrorCode = 'unsupported' | 'permission-denied' | 'failed'

export class RecorderError extends Error {
  code: RecorderErrorCode
  constructor(code: RecorderErrorCode, message?: string) {
    super(message ?? code)
    this.name = 'RecorderError'
    this.code = code
  }
}

export interface Recording {
  blob: Blob
  mimeType: string
  durationSec: number
}

export interface Recorder {
  isSupported(): boolean
  start(): Promise<void>
  stop(): Promise<Recording>
  cancel(): void
}

const MIME_PREFERENCE = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']

export function pickMimeType(isTypeSupported: (t: string) => boolean): string | undefined {
  return MIME_PREFERENCE.find((t) => isTypeSupported(t))
}

function isSupported(): boolean {
  return typeof MediaRecorder !== 'undefined' && typeof navigator?.mediaDevices?.getUserMedia === 'function'
}

export function createMediaRecorder(): Recorder {
  let stream: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let startedAt = 0
  let starting = false
  /** Bumped by cancel() so a start() still waiting for the mic knows to give it back. */
  let generation = 0
  let stopping: Promise<Recording> | null = null
  let rejectStop: ((e: RecorderError) => void) | null = null

  function release() {
    stream?.getTracks().forEach((t) => t.stop())
    stream = null
    recorder = null
    chunks = []
  }

  return {
    isSupported,

    async start() {
      if (!isSupported()) throw new RecorderError('unsupported')
      if (starting || recorder) throw new RecorderError('failed', 'Already recording')
      starting = true
      const myGeneration = ++generation
      try {
        let opened: MediaStream
        try {
          opened = await navigator.mediaDevices.getUserMedia({ audio: true })
        } catch (e) {
          const name = (e as { name?: string }).name
          if (name === 'NotAllowedError' || name === 'SecurityError') throw new RecorderError('permission-denied')
          throw new RecorderError('failed')
        }
        if (myGeneration !== generation) {
          opened.getTracks().forEach((t) => t.stop())
          throw new RecorderError('failed', 'Cancelled')
        }
        stream = opened
        const mimeType = pickMimeType((t) => MediaRecorder.isTypeSupported(t))
        try {
          recorder = new MediaRecorder(opened, mimeType ? { mimeType } : undefined)
          chunks = []
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data)
          }
          recorder.start()
          startedAt = Date.now()
        } catch {
          release()
          throw new RecorderError('failed')
        }
      } finally {
        starting = false
      }
    },

    stop() {
      if (stopping) return stopping
      const active = recorder
      if (!active) return Promise.reject(new RecorderError('failed'))
      stopping = new Promise<Recording>((resolve, reject) => {
        rejectStop = reject
        active.onstop = () => {
          const mimeType = active.mimeType || chunks[0]?.type || 'audio/webm'
          const blob = new Blob(chunks, { type: mimeType })
          const durationSec = Math.round((Date.now() - startedAt) / 1000)
          release()
          if (blob.size === 0) reject(new RecorderError('failed'))
          else resolve({ blob, mimeType, durationSec })
        }
        active.stop()
      }).finally(() => {
        stopping = null
        rejectStop = null
      })
      return stopping
    },

    cancel() {
      generation++
      if (recorder) {
        recorder.ondataavailable = null
        recorder.onstop = null
        if (recorder.state !== 'inactive') recorder.stop()
      }
      rejectStop?.(new RecorderError('failed', 'Cancelled'))
      release()
    },
  }
}
