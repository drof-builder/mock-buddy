import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { Answer, Rating, Role } from '../../domain/types'
import { createRepository, type Repository } from '../../services/db'
import { renderWithServices } from '../../test/renderWithServices'

function mockAnswer(sessionId: string, text: string, rating?: Rating): Answer {
  return {
    id: crypto.randomUUID(),
    questionId: 'q',
    questionText: text,
    role: 'behavioral',
    mode: 'mock',
    sessionId,
    audio: new Blob([new Uint8Array([1])], { type: 'audio/webm' }),
    mimeType: 'audio/webm',
    durationSec: 60,
    ...(rating ? { rating } : {}),
    createdAt: Date.now(),
  }
}

async function seedSession(
  repo: Repository,
  role: Role,
  answers: { text: string; rating?: Rating }[],
  completed = false,
) {
  const session = await repo.createSession(role)
  for (const a of answers) await repo.addAnswerToSession(session.id, mockAnswer(session.id, a.text, a.rating))
  if (completed) await repo.completeSession(session.id)
  return session
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Mock Review', () => {
  test('rating answers and finishing saves them and marks the session complete', async () => {
    const user = userEvent.setup()
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    const s = await seedSession(repo, 'tech-support', [{ text: 'First question' }, { text: 'Second question' }])
    const { container } = renderWithServices(`/mock/${s.id}/review`, { repo })

    expect(await screen.findByRole('heading', { level: 1, name: 'Review — Technical Support' })).toBeVisible()
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(2)
    expect(container.querySelectorAll('audio')).toHaveLength(2)

    await user.click(within(cards[0]).getByRole('button', { name: 'Rate 5 out of 5' }))
    await user.type(within(cards[1]).getByLabelText('Note (optional)'), 'ramble less')
    await user.click(screen.getByRole('button', { name: 'Finish' }))

    expect(await screen.findByRole('tab', { name: 'Mock sessions' })).toHaveAttribute('aria-selected', 'true')
    const saved = (await repo.getSession(s.id))!
    expect(saved.session.completed).toBe(true)
    expect(saved.answers[0].rating).toBe(5)
    expect(saved.answers[1].note).toBe('ramble less')
  })

  test('ratings are optional', async () => {
    const user = userEvent.setup()
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    const s = await seedSession(repo, 'behavioral', [{ text: 'Only question' }])
    renderWithServices(`/mock/${s.id}/review`, { repo })
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
    await screen.findByRole('tab', { name: 'Mock sessions' })
    expect((await repo.getSession(s.id))!.session.completed).toBe(true)
  })

  test('deleting the session after confirming removes it and its answers', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    const s = await seedSession(repo, 'behavioral', [{ text: 'Q' }])
    const answerId = (await repo.getSession(s.id))!.session.answerIds[0]
    renderWithServices(`/mock/${s.id}/review`, { repo })
    await user.click(await screen.findByRole('button', { name: 'Delete session' }))
    expect(confirm).toHaveBeenCalledWith('Delete this mock session and its recordings?')
    expect(await screen.findByText('No mock interviews yet.')).toBeVisible()
    expect(await repo.getSession(s.id)).toBeUndefined()
    expect(await repo.getAnswer(answerId)).toBeUndefined()
  })

  test('says when the session does not exist', async () => {
    renderWithServices('/mock/nope/review')
    expect(await screen.findByText('Session not found.')).toBeVisible()
  })
})

describe('History — mock tab', () => {
  test('shows an empty state', async () => {
    renderWithServices('/history?tab=mock')
    expect(await screen.findByText('No mock interviews yet.')).toBeVisible()
  })

  test('lists sessions with role, average rating and an unfinished badge', async () => {
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    const done = await seedSession(repo, 'customer-service', [{ text: 'a', rating: 4 }, { text: 'b', rating: 5 }], true)
    await new Promise((r) => setTimeout(r, 5))
    const open = await seedSession(repo, 'behavioral', [{ text: 'c' }])
    renderWithServices('/history?tab=mock', { repo })

    const items = await screen.findAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Behavioral')
    expect(items[0]).toHaveTextContent('Avg —')
    expect(items[0]).toHaveTextContent('Unfinished')
    expect(within(items[0]).getByRole('link')).toHaveAttribute('href', `/mock/${open.id}/review`)
    expect(items[1]).toHaveTextContent('Customer Service')
    expect(items[1]).toHaveTextContent('Avg 4.5')
    expect(items[1]).not.toHaveTextContent('Unfinished')
    expect(within(items[1]).getByRole('link')).toHaveAttribute('href', `/mock/${done.id}/review`)
  })
})
