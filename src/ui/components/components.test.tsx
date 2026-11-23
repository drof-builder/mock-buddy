import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { AudioPlayer } from './AudioPlayer'
import { ErrorBanner } from './ErrorBanner'
import { RatingInput } from './RatingInput'
import { RoleCategoryPicker } from './RoleCategoryPicker'
import { Timer } from './Timer'

describe('Timer', () => {
  test('shows the clock as a timer', () => {
    render(<Timer seconds={75} />)
    expect(screen.getByRole('timer')).toHaveTextContent('1:15')
  })
})

describe('AudioPlayer', () => {
  let urls = 0
  beforeEach(() => {
    urls = 0
    URL.createObjectURL = vi.fn(() => `blob:${++urls}`)
    URL.revokeObjectURL = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('plays the blob and revokes its URL on unmount', () => {
    const { container, unmount } = render(<AudioPlayer blob={new Blob(['x'])} />)
    expect(container.querySelector('audio')).toHaveAttribute('src', 'blob:1')
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:1')
  })

  test('revokes the old URL when the blob changes', () => {
    const { rerender, container } = render(<AudioPlayer blob={new Blob(['a'])} />)
    rerender(<AudioPlayer blob={new Blob(['b'])} />)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:1')
    expect(container.querySelector('audio')).toHaveAttribute('src', 'blob:2')
  })
})

describe('RatingInput', () => {
  test('reports the chosen rating and marks the current one', async () => {
    const onChange = vi.fn()
    render(<RatingInput value={4} onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Rate 4 out of 5' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Rate 2 out of 5' })).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(screen.getByRole('button', { name: 'Rate 2 out of 5' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })
})

describe('RoleCategoryPicker', () => {
  test('changes role and category', async () => {
    const onRoleChange = vi.fn()
    const onCategoryChange = vi.fn()
    render(
      <RoleCategoryPicker
        role="behavioral"
        category=""
        categories={['conflict', 'intro']}
        onRoleChange={onRoleChange}
        onCategoryChange={onCategoryChange}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText('Role'), 'Technical Support')
    expect(onRoleChange).toHaveBeenCalledWith('tech-support')
    expect(screen.getByLabelText('Category')).toHaveDisplayValue('Any category')
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'conflict')
    expect(onCategoryChange).toHaveBeenCalledWith('conflict')
  })

  test('can hide the category picker', () => {
    render(
      <RoleCategoryPicker
        role="behavioral"
        category=""
        categories={[]}
        onRoleChange={() => {}}
        onCategoryChange={() => {}}
        showCategory={false}
      />,
    )
    expect(screen.queryByLabelText('Category')).toBeNull()
  })
})

describe('ErrorBanner', () => {
  test('shows the message and an optional action', async () => {
    const onAction = vi.fn()
    render(<ErrorBanner message="Oops" actionLabel="Try again" onAction={onAction} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Oops')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onAction).toHaveBeenCalled()
  })
})
