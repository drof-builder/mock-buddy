import { describe, expect, test } from 'vitest'
import { averageRating, formatAverage } from './ratings'

describe('averageRating', () => {
  test('averages rated answers and ignores unrated ones', () => {
    expect(averageRating([{ rating: 4 }, { rating: 5 }, {}])).toBe(4.5)
  })

  test('returns null when nothing is rated', () => {
    expect(averageRating([{}, {}])).toBeNull()
    expect(averageRating([])).toBeNull()
  })
})

describe('formatAverage', () => {
  test('shows a dash when there is no average', () => {
    expect(formatAverage(null)).toBe('—')
  })

  test('shows one decimal place', () => {
    expect(formatAverage(4.5)).toBe('4.5')
    expect(formatAverage(4)).toBe('4.0')
    expect(formatAverage(10 / 3)).toBe('3.3')
  })
})
