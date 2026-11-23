import { formatClock } from '../format'

export function Timer({ seconds }: { seconds: number }) {
  return (
    <div role="timer" className="timer" aria-live="off">
      {formatClock(seconds)}
    </div>
  )
}
