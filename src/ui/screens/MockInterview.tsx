import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { buildMockSet } from '../../domain/questionPicker'
import { MOCK_ANSWER_SECONDS, type Question, type Role } from '../../domain/types'
import { StorageFullError } from '../../services/db'
import type { Recording } from '../../services/recorder'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/PageHeader'
import { RoleCategoryPicker } from '../components/RoleCategoryPicker'
import { Timer } from '../components/Timer'
import { NO_MATCH, recorderErrorMessage, SAVE_FAILED, STORAGE_FULL } from '../messages'
import { useServices } from '../services'
import { useQuestionBank } from '../useQuestionBank'
import { useRecording } from '../useRecording'

interface Running {
  sessionId: string
  questions: Question[]
  index: number
}

export function MockInterview() {
  const { repo } = useServices()
  const navigate = useNavigate()
  const bank = useQuestionBank()
  const rec = useRecording({ maxSec: MOCK_ANSWER_SECONDS, onAutoStop: (take) => void saveTake(take) })

  const [role, setRole] = useState<Role>('behavioral')
  const [noMatch, setNoMatch] = useState(false)
  const [running, setRunning] = useState<Running | null>(null)
  const [pendingTake, setPendingTake] = useState<Recording | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const savingRef = useRef(false)

  async function startMock() {
    const questions = buildMockSet(bank.all, role, bank.hiddenIds)
    if (questions.length === 0) {
      setNoMatch(true)
      return
    }
    const session = await repo.createSession(role)
    setRunning({ sessionId: session.id, questions, index: 0 })
  }

  async function saveTake(take: Recording) {
    if (!running || savingRef.current) return
    savingRef.current = true
    setSaveError(null)
    const question = running.questions[running.index]
    try {
      await repo.addAnswerToSession(running.sessionId, {
        id: crypto.randomUUID(),
        questionId: question.id,
        questionText: question.text,
        role: question.role,
        mode: 'mock',
        sessionId: running.sessionId,
        audio: take.blob,
        mimeType: take.mimeType,
        durationSec: take.durationSec,
        createdAt: Date.now(),
      })
      setPendingTake(null)
      if (running.index + 1 < running.questions.length) {
        setRunning({ ...running, index: running.index + 1 })
      } else {
        navigate(`/mock/${running.sessionId}/review`)
      }
    } catch (e) {
      setPendingTake(take)
      setSaveError(e instanceof StorageFullError ? STORAGE_FULL : SAVE_FAILED)
    } finally {
      savingRef.current = false
    }
  }

  async function stopAnswer() {
    const take = await rec.stop()
    if (take) await saveTake(take)
  }

  if (!running) {
    return (
      <main className="page stack">
        <PageHeader title="Mock Interview" />
        <p className="muted">
          Five questions in a row, up to 2 minutes each. You'll review and rate them at the end.
        </p>
        <RoleCategoryPicker
          role={role}
          category=""
          categories={[]}
          onRoleChange={(r) => {
            setRole(r)
            setNoMatch(false)
          }}
          onCategoryChange={() => {}}
          showCategory={false}
        />
        {noMatch && <p className="banner banner-info">{NO_MATCH}</p>}
        <button
          type="button"
          className="button button-primary"
          disabled={bank.loading}
          onClick={() => void startMock()}
        >
          Start mock
        </button>
      </main>
    )
  }

  const question = running.questions[running.index]
  const busy = rec.status !== 'idle'

  return (
    <main className="page stack">
      <PageHeader title="Mock Interview" />
      <p className="muted">
        Question {running.index + 1} of {running.questions.length}
      </p>
      <section className="card stack">
        <h2 className="question">{question.text}</h2>

        {rec.error && (
          <ErrorBanner message={recorderErrorMessage(rec.error)} actionLabel="Try again" onAction={rec.clearError} />
        )}

        {saveError && pendingTake && (
          <ErrorBanner message={saveError} actionLabel="Retry save" onAction={() => void saveTake(pendingTake)} />
        )}

        {!busy && !pendingTake && (
          <button type="button" className="button button-primary" onClick={() => void rec.start()}>
            Start answer
          </button>
        )}

        {busy && (
          <>
            <Timer seconds={Math.max(0, MOCK_ANSWER_SECONDS - rec.elapsedSec)} />
            <button
              type="button"
              className="button button-primary"
              disabled={rec.status !== 'recording'}
              onClick={() => void stopAnswer()}
            >
              Stop
            </button>
          </>
        )}
      </section>
    </main>
  )
}
