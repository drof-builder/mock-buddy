import { describe, expect, test } from 'vitest'
import { formatBytes } from './storage'

describe('formatBytes', () => {
  test('formats sizes with base-1024 units', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(12.3 * 1024 ** 2)).toBe('12.3 MB')
    expect(formatBytes(2 * 1024 ** 3)).toBe('2.0 GB')
  })
})
