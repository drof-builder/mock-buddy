import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { Answer } from '../../domain/types'
import { createRepository, type Repository } from '../../services/db'
import { createFakeStorage } from '../../test/fakeStorage'
import { renderWithServices } from '../../test/renderWithServices'
import { INSTALL_HINT } from '../messages'

function answer(overrides: Partial<Answer>): Answer {
  return {
    id: crypto.randomUUID(),
    questionId: 'beh-001',
    questionText: 'Tell me about yourself.',
    role: 'behavioral',
    mode: 'quick',
    audio: new Blob([new Uint8Array([1])], { type: 'audio/webm' }),
    mimeType: 'audio/webm',
    durationSec: 75,
    createdAt: Date.now(),
    ...overrides,
  }
}

async function seededRepo(...answers: Answer[]): Promise<Repository> {
  const repo = createRepository(`test-${crypto.randomUUID()}`)
  for (const a of answers) await repo.saveAnswer(a)
  return repo
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('History — practice tab', () => {
  test('shows an empty state', async () => {
    renderWithServices('/history')
    expect(await screen.findByText('No practice answers yet. Try Quick Practice!')).toBeVisible()
  })

  test('lists answers newest first with rating, duration and a link to each', async () => {
    const repo = await seededRepo(
      answer({ id: 'old', questionText: 'Older question', rating: 4, createdAt: 1000 }),
      answer({ id: 'new', questionText: 'Newer question', createdAt: 2000 }),
    )
    renderWithServices('/history', { repo })
    const items = await screen.findAllByRole('listitem')
    expect(items.map((li) => within(li).getByRole('link').textContent)).toEqual([
      expect.stringContaining('Newer question'),
      expect.stringContaining('Older question'),
    ])
    expect(items[0]).toHaveTextContent('Unrated')
    expect(items[0]).toHaveTextContent('1:15')
    expect(items[1]).toHaveTextContent('★ 4')
    expect(within(items[0]).getByRole('link')).toHaveAttribute('href', '/history/answer/new')
  })

  test('shows storage used and the install hint when storage is not persistent', async () => {
    renderWithServices('/history', { storage: createFakeStorage({ persisted: false }) })
    expect(await screen.findByText('Using 1.0 MB of 1.0 GB')).toBeVisible()
    expect(await screen.findByText(INSTALL_HINT)).toBeVisible()
  })

  test('hides the install hint when storage is persistent', async () => {
    renderWithServices('/history', { storage: createFakeStorage({ persisted: true }) })
    await screen.findByText('Using 1.0 MB of 1.0 GB')
    expect(screen.queryByText(INSTALL_HINT)).toBeNull()
  })

  test('the mock tab can be opened from the URL', async () => {
    renderWithServices('/history?tab=mock')
    expect(await screen.findByRole('tab', { name: 'Mock sessions' })).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Answer detail', () => {
  test('edits rating and note', async () => {
    const user = userEvent.setup()
    const repo = await seededRepo(answer({ id: 'a1', rating: 4 }))
    const { container } = renderWithServices('/history/answer/a1', { repo })
    expect(await screen.findByRole('heading', { name: 'Tell me about yourself.' })).toBeVisible()
    expect(container.querySelector('audio')).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'Rate 2 out of 5' }))
    await user.type(screen.getByLabelText('Note (optional)'), 'more examples')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('Saved.')).toBeVisible()
    expect(await repo.getAnswer('a1')).toMatchObject({ rating: 2, note: 'more examples' })
  })

  test('deletes after confirming and returns to History', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repo = await seededRepo(answer({ id: 'a1' }))
    renderWithServices('/history/answer/a1', { repo })
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('No practice answers yet. Try Quick Practice!')).toBeVisible()
    expect(await repo.getAnswer('a1')).toBeUndefined()
  })

  test('keeps the answer when delete is not confirmed', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const repo = await seededRepo(answer({ id: 'a1' }))
    renderWithServices('/history/answer/a1', { repo })
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(await repo.getAnswer('a1')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible()
  })

  test('says when the answer does not exist', async () => {
    renderWithServices('/history/answer/nope')
    expect(await screen.findByText('Answer not found.')).toBeVisible()
  })
})
