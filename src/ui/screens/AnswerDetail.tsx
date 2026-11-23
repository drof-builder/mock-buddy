import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { Answer, Rating } from '../../domain/types'
import { AudioPlayer } from '../components/AudioPlayer'
import { PageHeader } from '../components/PageHeader'
import { RatingInput } from '../components/RatingInput'
import { formatClock, formatDate } from '../format'
import { useServices } from '../services'

type Loaded = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; answer: Answer }

export function AnswerDetail() {
  const { answerId = '' } = useParams()
  const { repo } = useServices()
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState<Loaded>({ status: 'loading' })
  const [rating, setRating] = useState<Rating | undefined>()
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let live = true
    void repo.getAnswer(answerId).then((a) => {
      if (!live) return
      if (!a) {
        setLoaded({ status: 'missing' })
        return
      }
      setLoaded({ status: 'ready', answer: a })
      setRating(a.rating)
      setNote(a.note ?? '')
    })
    return () => {
      live = false
    }
  }, [repo, answerId])

  if (loaded.status === 'loading') return <main className="page muted">Loading…</main>
  if (loaded.status === 'missing') {
    return (
      <main className="page">
        <PageHeader title="Answer" backTo="/history" backLabel="History" />
        <p>Answer not found.</p>
      </main>
    )
  }

  const { answer } = loaded
  const backTo = answer.mode === 'mock' ? '/history?tab=mock' : '/history'

  async function save() {
    await repo.updateAnswer(answer.id, { rating, note: note.trim() || undefined })
    setSaved(true)
  }

  async function remove() {
    if (!window.confirm('Delete this answer?')) return
    await repo.deleteAnswer(answer.id)
    navigate(backTo)
  }

  return (
    <main className="page stack">
      <PageHeader title="Answer" backTo={backTo} backLabel="History" />
      <section className="card stack">
        <h2 className="question">{answer.questionText}</h2>
        <p className="muted">
          {formatDate(answer.createdAt)} · {formatClock(answer.durationSec)}
        </p>
        <AudioPlayer blob={answer.audio} />
        <RatingInput
          value={rating}
          onChange={(r) => {
            setRating(r)
            setSaved(false)
          }}
        />
        <label>
          Note (optional)
          <textarea
            rows={3}
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              setSaved(false)
            }}
          />
        </label>
        {saved && <p role="status">Saved.</p>}
        <div className="row">
          <button type="button" className="button button-primary grow" onClick={() => void save()}>
            Save changes
          </button>
          <button type="button" className="button button-danger" onClick={() => void remove()}>
            Delete
          </button>
        </div>
      </section>
    </main>
  )
}
