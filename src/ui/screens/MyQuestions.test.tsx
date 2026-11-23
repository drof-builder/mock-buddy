import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { STARTER_QUESTIONS } from '../../data/starterQuestions'
import { createRepository } from '../../services/db'
import { renderWithServices } from '../../test/renderWithServices'

afterEach(() => {
  vi.restoreAllMocks()
})

function customSection() {
  return screen.getByRole('region', { name: 'Your questions' })
}

describe('My Questions', () => {
  test('shows an empty state for custom questions', async () => {
    renderWithServices('/questions')
    expect(await screen.findByText("You haven't added any questions yet.")).toBeVisible()
  })

  test('adds a question', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/questions')
    await user.selectOptions(await screen.findByLabelText('Role'), 'Technical Support')
    await user.type(screen.getByLabelText('Category'), 'vpn')
    await user.type(screen.getByLabelText('Question'), '  What is split tunneling?  ')
    await user.click(screen.getByRole('button', { name: 'Add question' }))

    expect(await within(customSection()).findByText('What is split tunneling?')).toBeVisible()
    expect(await services.repo.listCustomQuestions()).toMatchObject([
      { role: 'tech-support', category: 'vpn', text: 'What is split tunneling?', source: 'custom' },
    ])
    expect(screen.getByLabelText('Question')).toHaveValue('')
  })

  test('rejects whitespace-only text', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/questions')
    await user.type(await screen.findByLabelText('Question'), '   ')
    await user.click(screen.getByRole('button', { name: 'Add question' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Question text is required.')
    expect(await services.repo.listCustomQuestions()).toEqual([])
  })

  test('edits a question', async () => {
    const user = userEvent.setup()
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    await repo.addCustomQuestion({ role: 'behavioral', category: 'general', text: 'Old text' })
    renderWithServices('/questions', { repo })
    await user.click(await within(customSection()).findByRole('button', { name: 'Edit' }))
    const text = screen.getByLabelText('Question')
    expect(text).toHaveValue('Old text')
    await user.clear(text)
    await user.type(text, 'New text')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await within(customSection()).findByText('New text')).toBeVisible()
    expect((await repo.listCustomQuestions())[0].text).toBe('New text')
    expect(screen.getByRole('button', { name: 'Add question' })).toBeVisible()
  })

  test('cancelling an edit leaves the question unchanged', async () => {
    const user = userEvent.setup()
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    await repo.addCustomQuestion({ role: 'behavioral', category: 'general', text: 'Keep me' })
    renderWithServices('/questions', { repo })
    await user.click(await within(customSection()).findByRole('button', { name: 'Edit' }))
    await user.type(screen.getByLabelText('Question'), ' changed')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByLabelText('Question')).toHaveValue('')
    expect((await repo.listCustomQuestions())[0].text).toBe('Keep me')
  })

  test('deletes a question after confirming', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    await repo.addCustomQuestion({ role: 'behavioral', category: 'general', text: 'Delete me' })
    renderWithServices('/questions', { repo })
    await user.click(await within(customSection()).findByRole('button', { name: 'Delete' }))
    expect(confirm).toHaveBeenCalledWith('Delete this question?')
    expect(await screen.findByText("You haven't added any questions yet.")).toBeVisible()
    expect(await repo.listCustomQuestions()).toEqual([])
  })

  test('hides and shows a starter question', async () => {
    const user = userEvent.setup()
    const { services } = renderWithServices('/questions')
    const first = STARTER_QUESTIONS[0]
    const item = (await screen.findByText(first.text)).closest('li')!
    const hide = within(item).getByRole('button', { name: 'Hide' })
    await waitFor(() => expect(hide).toBeEnabled())
    await user.click(hide)
    await user.click(await within(item).findByRole('button', { name: 'Show' }))
    expect(await within(item).findByRole('button', { name: 'Hide' })).toBeInTheDocument()
    await waitFor(async () => expect((await services.repo.getSettings()).hiddenStarterIds).toEqual([]))
  })

  test('starter toggles wait until saved settings have loaded', async () => {
    const repo = createRepository(`test-${crypto.randomUUID()}`)
    let release!: () => void
    const gate = new Promise<void>((r) => (release = r))
    const real = repo.getSettings.bind(repo)
    vi.spyOn(repo, 'getSettings').mockImplementation(async () => {
      await gate
      return real()
    })
    renderWithServices('/questions', { repo })
    const item = (await screen.findByText(STARTER_QUESTIONS[0].text)).closest('li')!
    expect(within(item).getByRole('button', { name: 'Hide' })).toBeDisabled()
    release()
    await waitFor(() => expect(within(item).getByRole('button', { name: 'Hide' })).toBeEnabled())
  })

  test('a custom question shows up in Quick Practice', async () => {
    const user = userEvent.setup()
    renderWithServices('/questions')
    await user.selectOptions(await screen.findByLabelText('Role'), 'Technical Support')
    await user.type(screen.getByLabelText('Category'), 'my-own')
    await user.type(screen.getByLabelText('Question'), 'My very own question?')
    await user.click(screen.getByRole('button', { name: 'Add question' }))
    await within(customSection()).findByText('My very own question?')

    await user.click(screen.getByRole('link', { name: /Home/ }))
    await user.click(await screen.findByRole('link', { name: 'Quick Practice' }))
    await user.selectOptions(await screen.findByLabelText('Role'), 'Technical Support')
    await user.selectOptions(screen.getByLabelText('Category'), 'my-own')
    expect(await screen.findByRole('heading', { level: 2, name: 'My very own question?' })).toBeVisible()
  })
})
