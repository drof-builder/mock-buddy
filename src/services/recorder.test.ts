import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createMediaRecorder, pickMimeType, RecorderError } from './recorder'

class FakeTrack {
  stopped = false
  stop() {
    this.stopped = true
  }
}

class FakeStream {
  tracks = [new FakeTrack(), new FakeTrack()]
  getTracks() {
    return this.tracks
  }
}

const instances: FakeMediaRecorder[] = []
let nextChunk: Blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' })

class FakeMediaRecorder {
  static isTypeSupported = (t: string) => t === 'audio/webm;codecs=opus'
  mimeType: string
  state = 'inactive'
  ondataavailable: ((e: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  stream: FakeStream
  constructor(stream: FakeStream, opts?: { mimeType?: string }) {
    this.stream = stream
    this.mimeType = opts?.mimeType ?? 'audio/webm'
    instances.push(this)
  }
  start() {
    this.state = 'recording'
  }
  stop() {
    this.state = 'inactive'
    // Real browsers fire these events asynchronously.
    setTimeout(() => {
      this.ondataavailable?.({ data: nextChunk })
      this.onstop?.()
    }, 0)
  }
}

let stream: FakeStream

beforeEach(() => {
  stream = new FakeStream()
  nextChunk = new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' })
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) } })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('pickMimeType', () => {
  test('prefers opus webm, then mp4, then webm', () => {
    expect(pickMimeType((t) => t === 'audio/mp4')).toBe('audio/mp4')
    expect(pickMimeType((t) => t.startsWith('audio/webm'))).toBe('audio/webm;codecs=opus')
    expect(pickMimeType((t) => t === 'audio/webm')).toBe('audio/webm')
  })

  test('returns undefined when nothing is supported', () => {
    expect(pickMimeType(() => false)).toBeUndefined()
  })
})

describe('createMediaRecorder', () => {
  test('is supported when MediaRecorder and getUserMedia exist', () => {
    expect(createMediaRecorder().isSupported()).toBe(true)
  })

  test('is not supported without MediaRecorder', () => {
    vi.stubGlobal('MediaRecorder', undefined)
    expect(createMediaRecorder().isSupported()).toBe(false)
  })

  test('is not supported without getUserMedia', () => {
    vi.stubGlobal('navigator', {})
    expect(createMediaRecorder().isSupported()).toBe(false)
  })

  test('start when unsupported fails with code unsupported', async () => {
    vi.stubGlobal('MediaRecorder', undefined)
    await expect(createMediaRecorder().start()).rejects.toMatchObject({ code: 'unsupported' })
  })

  test('a blocked microphone fails with code permission-denied', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(new DOMException('no', 'NotAllowedError')) },
    })
    const err = await createMediaRecorder()
      .start()
      .catch((e: unknown) => e)
    expect(err).toBeInstanceOf(RecorderError)
    expect((err as RecorderError).code).toBe('permission-denied')
  })

  test('other microphone errors fail with code failed', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(new DOMException('x', 'NotFoundError')) },
    })
    await expect(createMediaRecorder().start()).rejects.toMatchObject({ code: 'failed' })
  })

  test('stop returns the recording with the chosen mime type', async () => {
    const r = createMediaRecorder()
    await r.start()
    expect(instances[instances.length - 1].mimeType).toBe('audio/webm;codecs=opus')
    const rec = await r.stop()
    expect(rec.blob.size).toBe(3)
    expect(rec.mimeType).toBe('audio/webm;codecs=opus')
    expect(rec.durationSec).toBeGreaterThanOrEqual(0)
  })

  test('an empty recording fails with code failed', async () => {
    nextChunk = new Blob([])
    const r = createMediaRecorder()
    await r.start()
    await expect(r.stop()).rejects.toMatchObject({ code: 'failed' })
  })

  test('stop releases the microphone', async () => {
    const r = createMediaRecorder()
    await r.start()
    await r.stop()
    expect(stream.tracks.every((t) => t.stopped)).toBe(true)
  })

  test('cancel releases the microphone', async () => {
    const r = createMediaRecorder()
    await r.start()
    r.cancel()
    expect(stream.tracks.every((t) => t.stopped)).toBe(true)
  })

  test('stop without start fails with code failed', async () => {
    await expect(createMediaRecorder().stop()).rejects.toMatchObject({ code: 'failed' })
  })

  test('cancel while the microphone is still opening releases it once it opens', async () => {
    let resolveMic!: (s: FakeStream) => void
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: () => new Promise<FakeStream>((res) => (resolveMic = res)) },
    })
    const before = instances.length
    const r = createMediaRecorder()
    const starting = r.start()
    r.cancel()
    resolveMic(stream)
    await expect(starting).rejects.toBeInstanceOf(RecorderError)
    expect(stream.tracks.every((t) => t.stopped)).toBe(true)
    expect(instances.length).toBe(before)
  })

  test('a second start while one is active is rejected and keeps the first stream', async () => {
    const r = createMediaRecorder()
    await r.start()
    await expect(r.start()).rejects.toMatchObject({ code: 'failed' })
    expect(stream.tracks.some((t) => t.stopped)).toBe(false)
    const rec = await r.stop()
    expect(rec.blob.size).toBe(3)
  })

  test('two overlapping stop calls both get the same recording', async () => {
    const r = createMediaRecorder()
    await r.start()
    const [a, b] = await Promise.all([r.stop(), r.stop()])
    expect(a).toBe(b)
  })

  test('cancel during a pending stop settles that stop', async () => {
    const r = createMediaRecorder()
    await r.start()
    const stopping = r.stop()
    r.cancel()
    await expect(stopping).rejects.toBeInstanceOf(RecorderError)
    expect(stream.tracks.every((t) => t.stopped)).toBe(true)
  })
})
