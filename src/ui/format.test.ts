import { expect, test } from 'vitest'
import { formatClock } from './format'

test('formatClock shows minutes and zero-padded seconds', () => {
  expect(formatClock(0)).toBe('0:00')
  expect(formatClock(75)).toBe('1:15')
  expect(formatClock(120)).toBe('2:00')
})

test('formatClock clamps negatives to zero', () => {
  expect(formatClock(-3)).toBe('0:00')
})
