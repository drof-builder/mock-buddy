import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createRepository } from '../services/db'
import { createFakeRecorder, type FakeRecorder } from '../test/fakeRecorder'
import { createFakeStorage } from '../test/fakeStorage'
import { ServicesProvider } from './services'
import { useRecording } from './useRecording'

function setup(recorder: FakeRecorder = createFakeRecorder()) {
  const services = { recorder, repo: createRepository(`t-${crypto.randomUUID()}`), storage: createFakeStorage() }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ServicesProvider services={services}>{children}</ServicesProvider>
  )
  return { recorder, ...renderHook(() => useRecording(), { wrapper }) }
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
})
