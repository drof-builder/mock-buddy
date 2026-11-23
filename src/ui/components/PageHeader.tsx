import { Link } from 'react-router'

export function PageHeader({ title, backTo = '/', backLabel = 'Home' }: { title: string; backTo?: string; backLabel?: string }) {
  return (
    <header className="page-header">
      <Link className="back-link" to={backTo}>
        ‹ {backLabel}
      </Link>
      <h1>{title}</h1>
    </header>
  )
}
