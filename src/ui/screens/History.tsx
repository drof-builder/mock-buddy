import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import type { AnswerSummary } from '../../domain/types'
import { formatBytes } from '../../services/storage'
import { PageHeader } from '../components/PageHeader'
import { formatClock, formatDate } from '../format'
import { INSTALL_HINT } from '../messages'
import { useServices } from '../services'

type Tab = 'practice' | 'mock'

function PracticeList() {
  const { repo } = useServices()
  const [answers, setAnswers] = useState<AnswerSummary[] | null>(null)

  useEffect(() => {
    let live = true
    void repo.listQuickAnswers().then((list) => {
      if (live) setAnswers(list)
    })
    return () => {
      live = false
    }
  }, [repo])

  if (!answers) return <p className="muted">Loading…</p>
  if (answers.length === 0) return <p className="muted">No practice answers yet. Try Quick Practice!</p>

  return (
    <ul className="list">
      {answers.map((a) => (
        <li key={a.id}>
          <Link className="list-item" to={`/history/answer/${a.id}`}>
            <span className="list-title">{a.questionText}</span>
            <span className="muted">
              {formatDate(a.createdAt)} · {formatClock(a.durationSec)} · {a.rating ? `★ ${a.rating}` : 'Unrated'}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function MockList() {
  return <p className="muted">No mock interviews yet.</p>
}

function StorageFooter() {
  const { storage } = useServices()
  const [info, setInfo] = useState<{ used: string; quota: string } | null>(null)
  const [persisted, setPersisted] = useState(true)

  useEffect(() => {
    let live = true
    void storage.estimate().then((e) => {
      if (live && e) setInfo({ used: formatBytes(e.usedBytes), quota: formatBytes(e.quotaBytes) })
    })
    void storage.persisted().then((p) => {
      if (live) setPersisted(p)
    })
    return () => {
      live = false
    }
  }, [storage])

  return (
    <footer className="stack">
      {info && (
        <p className="muted">
          Using {info.used} of {info.quota}
        </p>
      )}
      {!persisted && <p className="banner banner-info">{INSTALL_HINT}</p>}
    </footer>
  )
}

export function History() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'mock' ? 'mock' : 'practice'

  function select(t: Tab) {
    setParams(t === 'mock' ? { tab: 'mock' } : {}, { replace: true })
  }

  return (
    <main className="page stack">
      <PageHeader title="History" />
      <div role="tablist" className="tabs">
        <button type="button" role="tab" aria-selected={tab === 'practice'} className="tab" onClick={() => select('practice')}>
          Practice
        </button>
        <button type="button" role="tab" aria-selected={tab === 'mock'} className="tab" onClick={() => select('mock')}>
          Mock sessions
        </button>
      </div>
      <div role="tabpanel">{tab === 'practice' ? <PracticeList /> : <MockList />}</div>
      <StorageFooter />
    </main>
  )
}
