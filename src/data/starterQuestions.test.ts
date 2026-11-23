import { describe, expect, test } from 'vitest'
import { ROLES } from '../domain/types'
import { STARTER_QUESTIONS } from './starterQuestions'

describe('STARTER_QUESTIONS', () => {
  test('every id is unique', () => {
    const ids = STARTER_QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('every question has a valid role, category, text and starter source', () => {
    for (const q of STARTER_QUESTIONS) {
      expect(ROLES).toContain(q.role)
      expect(q.category.trim()).not.toBe('')
      expect(q.text.trim()).not.toBe('')
      expect(q.source).toBe('starter')
    }
  })

  test('each role has at least five questions', () => {
    for (const role of ROLES) {
      expect(STARTER_QUESTIONS.filter((q) => q.role === role).length).toBeGreaterThanOrEqual(5)
    }
  })

  test('question texts are not duplicated', () => {
    const texts = STARTER_QUESTIONS.map((q) => q.text.toLowerCase())
    expect(new Set(texts).size).toBe(texts.length)
  })
})
