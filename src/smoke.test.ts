import { expect, test } from 'vitest'

test('indexedDB is available in tests', () => {
  expect(typeof indexedDB.open).toBe('function')
})
