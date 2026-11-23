import { screen, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { createFakeRecorder } from '../../test/fakeRecorder'
import { createFakeStorage } from '../../test/fakeStorage'
import { renderWithServices } from '../../test/renderWithServices'
import { UNSUPPORTED } from '../messages'

describe('Home', () => {
  test('shows the two practice modes and the other sections', () => {
    renderWithServices('/')
    expect(screen.getByRole('link', { name: 'Quick Practice' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Mock Interview' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'History' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'My Questions' })).toBeVisible()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('warns and disables practice when recording is unsupported', () => {
    renderWithServices('/', { recorder: createFakeRecorder({ supported: false }) })
    expect(screen.getByRole('alert')).toHaveTextContent(UNSUPPORTED)
    expect(screen.queryByRole('link', { name: 'Quick Practice' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Quick Practice' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Mock Interview' })).toBeDisabled()
  })

  test('asks the browser to keep data once on start', async () => {
    const storage = createFakeStorage()
    renderWithServices('/', { storage })
    await waitFor(() => expect(storage.persistCalls).toBe(1))
  })
})
