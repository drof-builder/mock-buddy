import type { Rating } from '../../domain/types'

const RATINGS: Rating[] = [1, 2, 3, 4, 5]

export function RatingInput({ value, onChange }: { value?: Rating; onChange(r: Rating): void }) {
  return (
    <div className="rating" role="group" aria-label="Rating">
      {RATINGS.map((r) => (
        <button
          key={r}
          type="button"
          className={`rating-star${value !== undefined && r <= value ? ' rating-star-on' : ''}`}
          aria-label={`Rate ${r} out of 5`}
          aria-pressed={value === r}
          onClick={() => onChange(r)}
        >
          ★
        </button>
      ))}
    </div>
  )
}
