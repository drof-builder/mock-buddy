import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { STARTER_QUESTIONS } from '../../data/starterQuestions'
import { createRepository, StorageFullError, type Repository } from '../../services/db'
import { createFakeRecorder } from '../../test/fakeRecorder'
import { renderWithServices } from '../../test/renderWithServices'
import { NO_MATCH, PERMISSION_DENIED, STORAGE_FULL } from '../messages'

// Only intervals and the clock are faked; IndexedDB and Testing Library keep real timeouts.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

async function sessionAnswers(repo: Repository) {
  const [summary] = await repo.listSessions()
  return summary ? (await repo.getSession(summary.session.id))!.answers : []
}

async function startMock(user: ReturnType<typeof userEvent.setup>, roleLabel = 'Technical Support') {
  await user.selectOptions(await screen.findByLabelText('Role'), roleLabel)
  await user.click(screen.getByRole('button', { name: 'Start mock' }))
  await screen.findByText('Question 1 of 5')
}

async function answerOne(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Start answer' }))
  await user.click(await screen.findByRole('button', { name: 'Stop' }))
}

describe('Mock Interview', () => {
  test('stopping saves the answer unrated and moves to the next question', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/mock')
    await startMock(user)
    await answerOne(user)
    expect(await screen.findByText('Question 2 of 5')).toBeVisible()
    const answers = await sessionAnswers(services.repo)
    expect(answers).toHaveLength(1)
    expect(answers[0]).toMatchObject({ mode: 'mock', role: 'behavioral' })
    expect(answers[0].rating).toBeUndefined()
  })

  test('counts down from 2:00', async () => {
    const user = userEvent.setup()
    renderWithServices('/mock')
    await startMock(user)
    await user.click(screen.getByRole('button', { name: 'Start answer' }))
    expect(await screen.findByRole('timer')).toHaveTextContent('2:00')
    await act(async () => {
      vi.advanceTimersByTime(30_000)
    })
    expect(screen.getByRole('timer')).toHaveTextContent('1:30')
  })

  test('auto-stops at 0:00 and saves exactly one answer', async () => {
    const user = userEvent.setup()
    const recorder = createFakeRecorder()
    const { services } = renderWithServices('/mock', { recorder })
    await startMock(user)
    await user.click(screen.getByRole('button', { name: 'Start answer' }))
    await screen.findByRole('timer')
    await act(async () => {
      vi.advanceTimersByTime(120_000)
    })
    expect(await screen.findByText('Question 2 of 5')).toBeVisible()
    expect(recorder.stopCalls).toBe(1)
    expect(await sessionAnswers(services.repo)).toHaveLength(1)
  })

  test('a big time jump (backgrounded tab) still saves only one answer', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/mock')
    await startMock(user)
    await user.click(screen.getByRole('button', { name: 'Start answer' }))
    await screen.findByRole('timer')
    await act(async () => {
      vi.advanceTimersByTime(300_000)
    })
    expect(await screen.findByText('Question 2 of 5')).toBeVisible()
    expect(await sessionAnswers(services.repo)).toHaveLength(1)
  })

  test('tapping Stop in the same moment as auto-stop saves one answer', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/mock')
    await startMock(user)
    await user.click(screen.getByRole('button', { name: 'Start answer' }))
    const stop = await screen.findByRole('button', { name: 'Stop' })
    await act(async () => {
      vi.advanceTimersByTime(120_000)
      stop.click()
    })
    expect(await screen.findByText('Question 2 of 5')).toBeVisible()
    expect(await sessionAnswers(services.repo)).toHaveLength(1)
  })

  test('after the fifth answer it opens the review', async () => {
    const user = userEvent.setup()
    renderWithServices('/mock')
    await startMock(user)
    for (let i = 1; i <= 5; i++) {
      await screen.findByText(`Question ${i} of 5`)
      await answerOne(user)
    }
    expect(await screen.findByRole('heading', { level: 1, name: /Review/ })).toBeVisible()
  })

  test('a session left halfway stays unfinished', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/mock')
    await startMock(user)
    await answerOne(user)
    await screen.findByText('Question 2 of 5')
    await answerOne(user)
    await screen.findByText('Question 3 of 5')
    const [summary] = await services.repo.listSessions()
    expect(summary.session.completed).toBe(false)
    expect(summary.session.answerIds).toHaveLength(2)
  })

  test('with every question hidden it shows the no-match message and creates no session', async () => {
    const user = userEvent.setup()
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    for (const q of STARTER_QUESTIONS.filter((x) => x.role === 'behavioral')) await repo.setStarterHidden(q.id, true)
    renderWithServices('/mock', { repo })
    await user.selectOptions(await screen.findByLabelText('Role'), 'Behavioral')
    await user.click(screen.getByRole('button', { name: 'Start mock' }))
    expect(await screen.findByText(NO_MATCH)).toBeVisible()
    expect(await repo.listSessions()).toEqual([])
  })

  test('a blocked microphone shows the fix and stays on the question', async () => {
    const user = userEvent.setup()
    renderWithServices('/mock', { recorder: createFakeRecorder({ startError: 'permission-denied' }) })
    await startMock(user)
    await user.click(screen.getByRole('button', { name: 'Start answer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(PERMISSION_DENIED)
    expect(screen.getByText('Question 1 of 5')).toBeVisible()
  })

  test('full storage keeps the take and offers to retry the save', async () => {
    const user = userEvent.setup()
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    const spy = vi.spyOn(repo, 'addAnswerToSession').mockRejectedValueOnce(new StorageFullError())
    renderWithServices('/mock', { repo })
    await startMock(user)
    await answerOne(user)
    expect(await screen.findByRole('alert')).toHaveTextContent(STORAGE_FULL)
    await user.click(screen.getByRole('button', { name: 'Retry save' }))
    expect(await screen.findByText('Question 2 of 5')).toBeVisible()
    expect(spy).toHaveBeenCalledTimes(2)
    expect(await sessionAnswers(repo)).toHaveLength(1)
  })
})
