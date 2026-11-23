import { useEffect, useMemo, useState } from 'react'
import { STARTER_QUESTIONS } from '../../data/starterQuestions'
import { validateCustomQuestion } from '../../domain/customQuestion'
import { categoriesFor } from '../../domain/questionPicker'
import { ROLE_LABELS, ROLES, type Question, type Role } from '../../domain/types'
import { StorageFullError } from '../../services/db'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/PageHeader'
import { DELETE_FAILED, SAVE_FAILED, STORAGE_FULL } from '../messages'
import { useServices } from '../services'

interface Draft {
  role: Role
  category: string
  text: string
}

const EMPTY_DRAFT: Draft = { role: 'behavioral', category: '', text: '' }

export function MyQuestions() {
  const { repo } = useServices()
  const [custom, setCustom] = useState<Question[] | null>(null)
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let live = true
    void Promise.all([repo.listCustomQuestions(), repo.getSettings()]).then(([list, settings]) => {
      if (!live) return
      setCustom(list)
      setHidden(new Set(settings.hiddenStarterIds))
    })
    return () => {
      live = false
    }
  }, [repo])

  const categories = useMemo(
    () => categoriesFor([...STARTER_QUESTIONS, ...(custom ?? [])], draft.role),
    [custom, draft.role],
  )

  function resetForm() {
    setDraft(EMPTY_DRAFT)
    setEditingId(null)
    setError(null)
  }

  async function submit() {
    const result = validateCustomQuestion(draft)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setBusy(true)
    setError(null)
    try {
      if (editingId) {
        await repo.updateCustomQuestion(editingId, result.value)
        setCustom((list) => (list ?? []).map((q) => (q.id === editingId ? { ...q, ...result.value } : q)))
      } else {
        const added = await repo.addCustomQuestion(result.value)
        setCustom((list) => [...(list ?? []), added])
      }
      resetForm()
    } catch (e) {
      setError(e instanceof StorageFullError ? STORAGE_FULL : SAVE_FAILED)
    } finally {
      setBusy(false)
    }
  }

  function startEdit(q: Question) {
    setEditingId(q.id)
    setDraft({ role: q.role, category: q.category, text: q.text })
    setError(null)
  }

  async function remove(q: Question) {
    if (!window.confirm('Delete this question?')) return
    try {
      await repo.deleteCustomQuestion(q.id)
      setCustom((list) => (list ?? []).filter((x) => x.id !== q.id))
      if (editingId === q.id) resetForm()
    } catch {
      setError(DELETE_FAILED)
    }
  }

  async function toggleHidden(id: string) {
    const hide = !hidden.has(id)
    try {
      await repo.setStarterHidden(id, hide)
      setHidden((prev) => {
        const next = new Set(prev)
        if (hide) next.add(id)
        else next.delete(id)
        return next
      })
    } catch {
      setError(SAVE_FAILED)
    }
  }

  return (
    <main className="page stack">
      <PageHeader title="My Questions" />

      <form
        className="card stack"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <label>
          Role
          <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <input
            list="category-options"
            value={draft.category}
            placeholder="general"
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          Question
          <textarea rows={3} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
        </label>
        {error && <ErrorBanner message={error} />}
        <div className="row">
          <button type="submit" className="button button-primary grow" disabled={busy}>
            {editingId ? 'Save' : 'Add question'}
          </button>
          {editingId && (
            <button type="button" className="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="stack" aria-label="Your questions">
        <h2>Your questions</h2>
        {custom === null ? (
          <p className="muted">Loading…</p>
        ) : custom.length === 0 ? (
          <p className="muted">You haven't added any questions yet.</p>
        ) : (
          <ul className="list">
            {custom.map((q) => (
              <li key={q.id} className="list-item">
                <span className="list-title">{q.text}</span>
                <span className="muted">
                  {ROLE_LABELS[q.role]} · {q.category}
                </span>
                <div className="row">
                  <button type="button" className="button" onClick={() => startEdit(q)}>
                    Edit
                  </button>
                  <button type="button" className="button button-danger" onClick={() => void remove(q)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="stack" aria-label="Starter questions">
        <h2>Starter questions</h2>
        <p className="muted">Hide the ones you don't want to practice.</p>
        {ROLES.map((role) => (
          <details key={role} className="card">
            <summary className="list-title">{ROLE_LABELS[role]}</summary>
            <ul className="list starter-list">
              {STARTER_QUESTIONS.filter((q) => q.role === role).map((q) => {
                const isHidden = hidden.has(q.id)
                return (
                  <li key={q.id} className={`starter-item${isHidden ? ' starter-hidden' : ''}`}>
                    <span>{q.text}</span>
                    <button type="button" className="button" onClick={() => void toggleHidden(q.id)}>
                      {isHidden ? 'Show' : 'Hide'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </details>
        ))}
      </section>
    </main>
  )
}
