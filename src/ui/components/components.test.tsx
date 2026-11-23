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
        categories={['basic-screening', 'past-experience']}
        onRoleChange={onRoleChange}
        onCategoryChange={onCategoryChange}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText('Role'), 'Technical Support')
    expect(onRoleChange).toHaveBeenCalledWith('tech-support')
    expect(screen.getByLabelText('Category')).toHaveDisplayValue('Any category')
    expect(screen.getByRole('option', { name: 'Past experience (STAR)' })).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Past experience (STAR)')
    expect(onCategoryChange).toHaveBeenCalledWith('past-experience')
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

describe('RoleCategoryPicker — topics', () => {
  const techCategories = ['basic-screening', 'networking', 'windows-ad', 'databases-sql', 'hotel-systems']

  function renderPicker(category: string, topic = '', onTopicChange = vi.fn(), onCategoryChange = vi.fn()) {
    render(
      <RoleCategoryPicker
        role="tech-support"
        category={category}
        topic={topic}
        categories={techCategories}
        onRoleChange={() => {}}
        onCategoryChange={onCategoryChange}
        onTopicChange={onTopicChange}
      />,
    )
    return { onTopicChange, onCategoryChange }
  }

  test('the category list shows the group instead of its topics', () => {
    renderPicker('')
    const select = screen.getByLabelText('Category') as HTMLSelectElement
    const options = Array.from(select.options).map((o) => o.textContent)
    expect(options).toEqual(['Any category', 'Basic / screening', 'Technical knowledge', 'Hotel systems'])
  })

  test('picking the group shows a Topic dropdown with its topics', () => {
    renderPicker('technical-knowledge')
    const topic = screen.getByLabelText('Topic')
    expect(topic).toHaveDisplayValue('All technical knowledge')
    expect(Array.from((topic as HTMLSelectElement).options).map((o) => o.textContent)).toEqual([
      'All technical knowledge',
      'Networking',
      'Windows & Active Directory',
      'Databases & SQL',
    ])
  })

  test('choosing a topic reports it', async () => {
    const { onTopicChange } = renderPicker('technical-knowledge')
    await userEvent.selectOptions(screen.getByLabelText('Topic'), 'databases-sql')
    expect(onTopicChange).toHaveBeenCalledWith('databases-sql')
  })

  test('no Topic dropdown for a category without topics', () => {
    renderPicker('hotel-systems')
    expect(screen.queryByLabelText('Topic')).toBeNull()
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
