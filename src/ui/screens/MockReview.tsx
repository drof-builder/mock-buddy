import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ROLE_LABELS, type Answer, type MockSession, type Rating } from '../../domain/types'
import { StorageFullError } from '../../services/db'
import { AudioPlayer } from '../components/AudioPlayer'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/PageHeader'
import { RatingInput } from '../components/RatingInput'
import { formatClock } from '../format'
import { DELETE_FAILED, SAVE_FAILED, STORAGE_FULL } from '../messages'
import { useServices } from '../services'

type Loaded =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'ready'; session: MockSession; answers: Answer[] }

interface Edit {
  rating?: Rating
  note: string
}

const HISTORY_MOCK = '/history?tab=mock'

export function MockReview() {
  const { sessionId = '' } = useParams()
  const { repo } = useServices()
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState<Loaded>({ status: 'loading' })
  const [edits, setEdits] = useState<Record<string, Edit>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    void repo.getSession(sessionId).then((found) => {
      if (!live) return
      if (!found) {
        setLoaded({ status: 'missing' })
        return
      }
      setLoaded({ status: 'ready', ...found })
      setEdits(Object.fromEntries(found.answers.map((a) => [a.id, { rating: a.rating, note: a.note ?? '' }])))
    })
    return () => {
      live = false
    }
  }, [repo, sessionId])

  if (loaded.status === 'loading') return <main className="page muted">Loading…</main>
  if (loaded.status === 'missing') {
    return (
      <main className="page">
        <PageHeader title="Review" backTo={HISTORY_MOCK} backLabel="History" />
        <p>Session not found.</p>
      </main>
    )
  }

  const { session, answers } = loaded

  function edit(id: string, change: Partial<Edit>) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }))
  }

  async function finish() {
    setBusy(true)
    setError(null)
    try {
      for (const a of answers) {
        const e = edits[a.id]
        const note = e.note.trim() || undefined
        if (e.rating !== a.rating || note !== a.note) await repo.updateAnswer(a.id, { rating: e.rating, note })
      }
      await repo.completeSession(session.id)
      navigate(HISTORY_MOCK)
    } catch (e) {
      setError(e instanceof StorageFullError ? STORAGE_FULL : SAVE_FAILED)
      setBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm('Delete this mock session and its recordings?')) return
    setBusy(true)
    setError(null)
    try {
      await repo.deleteSession(session.id)
      navigate(HISTORY_MOCK)
    } catch {
      setError(DELETE_FAILED)
      setBusy(false)
    }
  }

  return (
    <main className="page stack">
      <PageHeader title={`Review — ${ROLE_LABELS[session.role]}`} backTo={HISTORY_MOCK} backLabel="History" />
      {answers.length === 0 && <p className="muted">No answers were recorded in this session.</p>}
      {answers.map((a, i) => (
        <article key={a.id} className="card stack">
          <p className="muted">
            Question {i + 1} · {formatClock(a.durationSec)}
          </p>
          <h2 className="question">{a.questionText}</h2>
          <AudioPlayer blob={a.audio} />
          <RatingInput value={edits[a.id]?.rating} onChange={(r) => edit(a.id, { rating: r })} />
          <label>
            Note (optional)
            <textarea rows={2} value={edits[a.id]?.note ?? ''} onChange={(e) => edit(a.id, { note: e.target.value })} />
          </label>
        </article>
      ))}
      {error && <ErrorBanner message={error} />}
      <div className="row">
        <button type="button" className="button button-primary grow" disabled={busy} onClick={() => void finish()}>
          Finish
        </button>
        <button type="button" className="button button-danger" disabled={busy} onClick={() => void remove()}>
          Delete session
        </button>
      </div>
    </main>
  )
}
