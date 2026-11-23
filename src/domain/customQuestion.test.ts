import { describe, expect, test } from 'vitest'
import { validateCustomQuestion } from './customQuestion'

describe('validateCustomQuestion', () => {
  test('trims text and defaults an empty category to general', () => {
    expect(validateCustomQuestion({ role: 'behavioral', category: '  ', text: '  Why us?  ' })).toEqual({
      ok: true,
      value: { role: 'behavioral', category: 'general', text: 'Why us?' },
    })
  })

  test('trims the category', () => {
    const r = validateCustomQuestion({ role: 'tech-support', category: ' vpn ', text: 'What is split tunneling?' })
    expect(r).toEqual({ ok: true, value: { role: 'tech-support', category: 'vpn', text: 'What is split tunneling?' } })
  })

  test('rejects empty text', () => {
    expect(validateCustomQuestion({ role: 'behavioral', category: 'x', text: '   ' })).toEqual({
      ok: false,
      error: 'Question text is required.',
    })
  })

  test('rejects text over 500 characters', () => {
    expect(validateCustomQuestion({ role: 'behavioral', category: 'x', text: 'a'.repeat(501) })).toEqual({
      ok: false,
      error: 'Keep questions under 500 characters.',
    })
    expect(validateCustomQuestion({ role: 'behavioral', category: 'x', text: 'a'.repeat(500) }).ok).toBe(true)
  })
})
