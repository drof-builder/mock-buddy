import { RecorderError, type Recorder, type RecorderErrorCode, type Recording } from '../services/recorder'

export interface FakeRecorder extends Recorder {
  readonly startCalls: number
  readonly stopCalls: number
  readonly cancelCalls: number
  readonly recording: boolean
}

export function createFakeRecorder(
  opts: { supported?: boolean; startError?: RecorderErrorCode; stopError?: RecorderErrorCode; durationSec?: number } = {},
): FakeRecorder {
  let startCalls = 0
  let stopCalls = 0
  let cancelCalls = 0
  let recording = false

  return {
    get startCalls() {
      return startCalls
    },
    get stopCalls() {
      return stopCalls
    },
    get cancelCalls() {
      return cancelCalls
    },
    get recording() {
      return recording
    },
    isSupported: () => opts.supported ?? true,
    async start() {
      startCalls++
      if (opts.startError) throw new RecorderError(opts.startError)
      recording = true
    },
    async stop(): Promise<Recording> {
      stopCalls++
      recording = false
      if (opts.stopError) throw new RecorderError(opts.stopError)
      return {
        blob: new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' }),
        mimeType: 'audio/webm',
        durationSec: opts.durationSec ?? 5,
      }
    },
    cancel() {
      cancelCalls++
      recording = false
    },
  }
}
