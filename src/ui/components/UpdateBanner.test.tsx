import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { UpdateBanner } from './UpdateBanner'

describe('UpdateBanner', () => {
  test('offers the update and applies it on tap', async () => {
    const onUpdate = vi.fn()
    render(<UpdateBanner onUpdate={onUpdate} onLater={() => {}} />)
    expect(screen.getByRole('status')).toHaveTextContent('A new version is available.')
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })

  test('can be put off until later', async () => {
    const onLater = vi.fn()
    render(<UpdateBanner onUpdate={() => {}} onLater={onLater} />)
    await userEvent.click(screen.getByRole('button', { name: 'Later' }))
    expect(onLater).toHaveBeenCalledTimes(1)
  })

  test('a double tap on Update only applies it once', async () => {
    const onUpdate = vi.fn()
    render(<UpdateBanner onUpdate={onUpdate} onLater={() => {}} />)
    await userEvent.dblClick(screen.getByRole('button', { name: 'Update' }))
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })
})
