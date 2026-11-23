import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { STARTER_QUESTIONS } from '../../data/starterQuestions'
import { createRepository, StorageFullError } from '../../services/db'
import { createFakeRecorder } from '../../test/fakeRecorder'
import { renderWithServices } from '../../test/renderWithServices'
import { NO_MATCH, PERMISSION_DENIED, STORAGE_FULL } from '../messages'

const behavioralTexts = STARTER_QUESTIONS.filter((q) => q.role === 'behavioral').map((q) => q.text)

async function shownQuestion(): Promise<string> {
  return (await screen.findByRole('heading', { level: 2 })).textContent ?? ''
}

async function recordOnce(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Record' }))
  await user.click(await screen.findByRole('button', { name: 'Stop' }))
  await screen.findByRole('button', { name: 'Save & Next' })
}

describe('Quick Practice', () => {
  test('shows a behavioral question by default', async () => {
    renderWithServices('/practice')
    expect(behavioralTexts).toContain(await shownQuestion())
  })

  test('record, stop, then rating is required before saving', async () => {
    const user = userEvent.setup()
    const { container } = renderWithServices('/practice')
    await shownQuestion()
    await recordOnce(user)
    expect(container.querySelector('audio')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Save & Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Done' })).toBeDisabled()
  })

  test('Save & Next saves the rated answer and shows another question', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/practice')
    const asked = await shownQuestion()
    await recordOnce(user)
    await user.click(screen.getByRole('button', { name: 'Rate 4 out of 5' }))
    await user.type(screen.getByLabelText('Note (optional)'), '  slow down  ')
    await user.click(screen.getByRole('button', { name: 'Save & Next' }))

    await screen.findByRole('button', { name: 'Record' })
    const saved = await services.repo.listQuickAnswers()
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({ rating: 4, note: 'slow down', questionText: asked, mode: 'quick', role: 'behavioral' })
    expect(await shownQuestion()).not.toBe(asked)
  })

  test('Done saves and goes back home', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/practice')
    await shownQuestion()
    await recordOnce(user)
    await user.click(screen.getByRole('button', { name: 'Rate 3 out of 5' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(await screen.findByRole('link', { name: 'Quick Practice' })).toBeVisible()
    expect(await services.repo.listQuickAnswers()).toHaveLength(1)
  })

  test('an empty note is not stored', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/practice')
    await shownQuestion()
    await recordOnce(user)
    await user.click(screen.getByRole('button', { name: 'Rate 3 out of 5' }))
    await user.type(screen.getByLabelText('Note (optional)'), '   ')
    await user.click(screen.getByRole('button', { name: 'Save & Next' }))
    await screen.findByRole('button', { name: 'Record' })
    expect((await services.repo.listQuickAnswers())[0].note).toBeUndefined()
  })

  test('Skip shows a different question without saving', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/practice')
    const first = await shownQuestion()
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(await shownQuestion()).not.toBe(first)
    expect(await services.repo.listQuickAnswers()).toHaveLength(0)
  })

  test('Re-record goes back to the same question without saving', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/practice')
    const asked = await shownQuestion()
    await recordOnce(user)
    await user.click(screen.getByRole('button', { name: 'Re-record' }))
    expect(await screen.findByRole('button', { name: 'Record' })).toBeVisible()
    expect(await shownQuestion()).toBe(asked)
    expect(await services.repo.listQuickAnswers()).toHaveLength(0)
  })

  test('double-tapping Save & Next saves only one answer', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/practice')
    await shownQuestion()
    await recordOnce(user)
    await user.click(screen.getByRole('button', { name: 'Rate 5 out of 5' }))
    await user.dblClick(screen.getByRole('button', { name: 'Save & Next' }))
    await screen.findByRole('button', { name: 'Record' })
    expect(await services.repo.listQuickAnswers()).toHaveLength(1)
  })

  test('switching role shows a question for that role', async () => {
    const user = userEvent.setup()
    renderWithServices('/practice')
    await shownQuestion()
    await user.selectOptions(screen.getByLabelText('Role'), 'Customer Service')
    const csTexts = STARTER_QUESTIONS.filter((q) => q.role === 'customer-service').map((q) => q.text)
    await waitFor(async () => expect(csTexts).toContain(await shownQuestion()))
  })

  test('a category with every question hidden shows the no-match message', async () => {
    const user = userEvent.setup()
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    for (const q of STARTER_QUESTIONS.filter((x) => x.category === 'intro')) await repo.setStarterHidden(q.id, true)
    renderWithServices('/practice', { repo })
    await shownQuestion()
    await user.selectOptions(screen.getByLabelText('Category'), 'intro')
    expect(await screen.findByText(NO_MATCH)).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Record' })).toBeNull()
  })

  test('a blocked microphone explains how to fix it', async () => {
    const user = userEvent.setup()
    renderWithServices('/practice', { recorder: createFakeRecorder({ startError: 'permission-denied' }) })
    await shownQuestion()
    await user.click(screen.getByRole('button', { name: 'Record' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(PERMISSION_DENIED)
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('full storage keeps the take so it can still be played', async () => {
    const user = userEvent.setup()
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    vi.spyOn(repo, 'saveAnswer').mockRejectedValue(new StorageFullError())
    const { container } = renderWithServices('/practice', { repo })
    await shownQuestion()
    await recordOnce(user)
    await user.click(screen.getByRole('button', { name: 'Rate 2 out of 5' }))
    await user.click(screen.getByRole('button', { name: 'Save & Next' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(STORAGE_FULL)
    expect(container.querySelector('audio')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Save & Next' })).toBeEnabled()
  })
})
