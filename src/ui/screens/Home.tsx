import { Link } from 'react-router'
import { UNSUPPORTED } from '../messages'
import { useServices } from '../services'

export function Home() {
  const { recorder } = useServices()
  const supported = recorder.isSupported()

  return (
    <main className="page">
      <h1>mock-buddy</h1>
      <p className="muted">Practice interview answers out loud.</p>
      {!supported && (
        <div role="alert" className="banner banner-error">
          {UNSUPPORTED}
        </div>
      )}
      <nav className="stack">
        {supported ? (
          <>
            <Link className="button button-primary" to="/practice">
              Quick Practice
            </Link>
            <Link className="button button-primary" to="/mock">
              Mock Interview
            </Link>
          </>
        ) : (
          <>
            <button className="button button-primary" disabled>
              Quick Practice
            </button>
            <button className="button button-primary" disabled>
              Mock Interview
            </button>
          </>
        )}
        <Link className="button" to="/history">
          History
        </Link>
        <Link className="button" to="/questions">
          My Questions
        </Link>
      </nav>
    </main>
  )
}
