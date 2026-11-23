import type { Answer } from './types'

export function averageRating(answers: Pick<Answer, 'rating'>[]): number | null {
  const rated = answers.flatMap((a) => (a.rating === undefined ? [] : [a.rating]))
  if (rated.length === 0) return null
  return rated.reduce((sum, r) => sum + r, 0) / rated.length
}

export function formatAverage(avg: number | null): string {
  return avg === null ? '—' : avg.toFixed(1)
}
