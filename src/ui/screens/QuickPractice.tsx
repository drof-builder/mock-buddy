import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { categoriesFor, createPicker, filterQuestions } from '../../domain/questionPicker'
import type { Question, Rating, Role } from '../../domain/types'
import { StorageFullError } from '../../services/db'
import type { Recording } from '../../services/recorder'
import { AudioPlayer } from '../components/AudioPlayer'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/PageHeader'
import { RatingInput } from '../components/RatingInput'
import { RoleCategoryPicker } from '../components/RoleCategoryPicker'
import { Timer } from '../components/Timer'
import { NO_MATCH, recorderErrorMessage, SAVE_FAILED, STORAGE_FULL } from '../messages'
import { useServices } from '../services'
import { useQuestionBank } from '../useQuestionBank'
import { useRecording } from '../useRecording'

export function QuickPractice() {
  const { repo } = useServices()
  const navigate = useNavigate()
  const bank = useQuestionBank()
  const rec = useRecording()

  const [role, setRole] = useState<Role>('behavioral')
  const [category, setCategory] = useState('')
  const [topic, setTopic] = useState('')

  // A new picker (and first question) whenever the filters or the bank change.
  const { picker, first } = useMemo(() => {
    const p = createPicker(filterQuestions(bank.all, { role, category: topic || category, hiddenIds: bank.hiddenIds }))
    return { picker: p, first: p.next() }
  }, [bank.all, bank.hiddenIds, role, category, topic])
  const [advanced, setAdvanced] = useState<{ picker: unknown; question: Question | null } | null>(null)
  const question = advanced?.picker === picker ? advanced.question : first

  const [take, setTake] = useState<Recording | null>(null)
  const [rating, setRating] = useState<Rating | undefined>()
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function resetTake() {
    setTake(null)
    setRating(undefined)
    setNote('')
    setSaveError(null)
  }

  function nextQuestion() {
    setAdvanced({ picker, question: picker.next() })
    resetTake()
  }

  function changeRole(r: Role) {
    setRole(r)
    setCategory('')
    setTopic('')
    resetTake()
  }

  function changeCategory(c: string) {
    setCategory(c)
    setTopic('')
    resetTake()
  }

  async function stop() {
    const r = await rec.stop()
    if (r) setTake(r)
  }

  async function save(then: 'next' | 'done') {
    if (!take || !question || rating === undefined || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setSaveError(null)
    try {
      const trimmed = note.trim()
      await repo.saveAnswer({
        id: crypto.randomUUID(),
        questionId: question.id,
        questionText: question.text,
        role: question.role,
        mode: 'quick',
        audio: take.blob,
        mimeType: take.mimeType,
        durationSec: take.durationSec,
        rating,
        ...(trimmed ? { note: trimmed } : {}),
        createdAt: Date.now(),
      })
      if (then === 'done') navigate('/')
      else nextQuestion()
    } catch (e) {
      setSaveError(e instanceof StorageFullError ? STORAGE_FULL : SAVE_FAILED)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const busy = rec.status !== 'idle'

  return (
    <main className="page stack">
      <PageHeader title="Quick Practice" />

      {!take && !busy && (
        <RoleCategoryPicker
          role={role}
          category={category}
          categories={categoriesFor(bank.all, role)}
          onRoleChange={changeRole}
          onCategoryChange={changeCategory}
          topic={topic}
          onTopicChange={(t) => {
            setTopic(t)
            resetTake()
          }}
        />
      )}

      {bank.loading ? (
        <p className="muted">Loading…</p>
      ) : !question ? (
        <p className="banner banner-info">{NO_MATCH}</p>
      ) : (
        <section className="card stack">
          <h2 className="question">{question.text}</h2>

          {rec.error && (
            <ErrorBanner message={recorderErrorMessage(rec.error)} actionLabel="Try again" onAction={rec.clearError} />
          )}

          {!take && !busy && (
            <div className="row">
              <button type="button" className="button button-primary grow" onClick={() => void rec.start()}>
                Record
              </button>
              <button type="button" className="button" onClick={nextQuestion}>
                Skip
              </button>
            </div>
          )}

          {busy && (
            <>
              <Timer seconds={rec.elapsedSec} />
              <button
                type="button"
                className="button button-primary"
                disabled={rec.status !== 'recording'}
                onClick={() => void stop()}
              >
                Stop
              </button>
            </>
          )}

          {take && (
            <>
              <AudioPlayer blob={take.blob} />
              <RatingInput value={rating} onChange={setRating} />
              <label>
                Note (optional)
                <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              {saveError && <ErrorBanner message={saveError} />}
              <div className="row">
                <button
                  type="button"
                  className="button button-primary grow"
                  disabled={rating === undefined || saving}
                  onClick={() => void save('next')}
                >
                  Save & Next
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={rating === undefined || saving}
                  onClick={() => void save('done')}
                >
                  Done
                </button>
              </div>
              <button type="button" className="button" disabled={saving} onClick={resetTake}>
                Re-record
              </button>
            </>
          )}
        </section>
      )}
    </main>
  )
}
