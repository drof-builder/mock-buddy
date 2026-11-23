import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createRepository } from '../services/db'
import { createFakeRecorder, type FakeRecorder } from '../test/fakeRecorder'
import { createFakeStorage } from '../test/fakeStorage'
import { ServicesProvider } from './services'
import { useRecording } from './useRecording'

function setup(recorder: FakeRecorder = createFakeRecorder(), options?: Parameters<typeof useRecording>[0]) {
  const services = { recorder, repo: createRepository(`t-${crypto.randomUUID()}`), storage: createFakeStorage() }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ServicesProvider services={services}>{children}</ServicesProvider>
  )
  return { recorder, ...renderHook(() => useRecording(options), { wrapper }) }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useRecording', () => {
  test('counts elapsed seconds from the start time while recording', async () => {
    const { result } = setup()
    await act(() => result.current.start())
    expect(result.current.status).toBe('recording')
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.elapsedSec).toBe(3)
  })

  test('stop returns the recording and goes back to idle', async () => {
    const { result } = setup()
    await act(() => result.current.start())
    let rec: unknown = null
    await act(async () => {
      rec = await result.current.stop()
    })
    expect(rec).not.toBeNull()
    expect(result.current.status).toBe('idle')
  })

  test('two stop calls at once only stop the recorder once', async () => {
    const { result, recorder } = setup()
    await act(() => result.current.start())
    let results: unknown[] = []
    await act(async () => {
      results = await Promise.all([result.current.stop(), result.current.stop()])
    })
    expect(recorder.stopCalls).toBe(1)
    expect(results.filter((r) => r === null)).toHaveLength(1)
  })

  test('a second start while recording is ignored', async () => {
    const { result, recorder } = setup()
    await act(() => result.current.start())
    await act(() => result.current.start())
    expect(recorder.startCalls).toBe(1)
  })

  test('a blocked microphone sets the error and stays idle', async () => {
    const { result } = setup(createFakeRecorder({ startError: 'permission-denied' }))
    await act(() => result.current.start())
    expect(result.current.error).toBe('permission-denied')
    expect(result.current.status).toBe('idle')
    act(() => result.current.clearError())
    expect(result.current.error).toBeNull()
  })

  test('a failed stop sets the error and returns null', async () => {
    const { result } = setup(createFakeRecorder({ stopError: 'failed' }))
    await act(() => result.current.start())
    let rec: unknown = 'unset'
    await act(async () => {
      rec = await result.current.stop()
    })
    expect(rec).toBeNull()
    expect(result.current.error).toBe('failed')
  })

  test('unmounting while recording cancels the recorder', async () => {
    const { result, recorder, unmount } = setup()
    await act(() => result.current.start())
    unmount()
    expect(recorder.cancelCalls).toBe(1)
  })

  test('warns before leaving the page only while recording', async () => {
    const { result } = setup()
    await act(() => result.current.start())
    const during = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(during)
    expect(during.defaultPrevented).toBe(true)
    await act(async () => {
      await result.current.stop()
    })
    const after = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(after)
    expect(after.defaultPrevented).toBe(false)
  })

  test('unmounting while the microphone is still opening cancels the recorder', async () => {
    const { result, recorder, unmount } = setup(createFakeRecorder({ deferStart: true }))
    act(() => {
      void result.current.start()
    })
    expect(result.current.status).toBe('starting')
    unmount()
    expect(recorder.cancelCalls).toBe(1)
  })

  test('cancelling while the microphone is opening does not report an error', async () => {
    const { result, recorder } = setup(createFakeRecorder({ deferStart: true }))
    let starting: Promise<void> = Promise.resolve()
    act(() => {
      starting = result.current.start()
    })
    act(() => result.current.cancel())
    await act(async () => {
      recorder.finishStart()
      await starting
    })
    expect(result.current.error).toBeNull()
    expect(result.current.status).toBe('idle')
  })

  test('stops by itself at the time limit and hands over the recording once', async () => {
    const onAutoStop = vi.fn()
    const { result, recorder } = setup(createFakeRecorder(), { maxSec: 120, onAutoStop })
    await act(() => result.current.start())
    await act(async () => {
      vi.advanceTimersByTime(119_000)
    })
    expect(onAutoStop).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(300_000)
    })
    expect(recorder.stopCalls).toBe(1)
    expect(onAutoStop).toHaveBeenCalledTimes(1)
    expect(onAutoStop.mock.calls[0][0].blob.size).toBe(3)
    expect(result.current.status).toBe('idle')
  })
})
