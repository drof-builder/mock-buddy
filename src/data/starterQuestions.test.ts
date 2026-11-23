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

  test('each role uses exactly its question-type categories', () => {
    const expected: Record<string, string[]> = {
      behavioral: ['basic-screening', 'past-experience', 'work-style'],
      'tech-support': [
        'basic-screening',
        'computer-basics-security',
        'databases-sql',
        'hotel-systems',
        'networking',
        'soft-skills',
        'troubleshooting',
        'windows-ad',
      ],
      'customer-service': ['basic-screening', 'role-play', 'situational', 'soft-skills', 'tools-metrics'],
    }
    for (const role of ROLES) {
      const cats = [...new Set(STARTER_QUESTIONS.filter((q) => q.role === role).map((q) => q.category))].sort()
      expect(cats).toEqual(expected[role])
    }
  })

  test('every category has at least six questions', () => {
    const counts = new Map<string, number>()
    for (const q of STARTER_QUESTIONS) {
      const key = `${q.role}/${q.category}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    for (const [key, n] of counts) expect([key, n >= 6]).toEqual([key, true])
  })

  test('role-play questions are marked as role-plays', () => {
    for (const q of STARTER_QUESTIONS.filter((x) => x.category === 'role-play')) {
      expect(q.text.startsWith('Role-play:')).toBe(true)
    }
  })

  // Retired on purpose: assumed real support-job experience (replaced by ts-067 for beginners).
  const RETIRED = ['ts-018']

  test('questions that existed before keep their ids, except retired ones', () => {
    const ids = new Set(STARTER_QUESTIONS.map((q) => q.id))
    for (let i = 1; i <= 25; i++) {
      const n = String(i).padStart(3, '0')
      for (const prefix of ['beh', 'ts', 'cs']) {
        const id = `${prefix}-${n}`
        if (!RETIRED.includes(id)) expect(ids.has(id)).toBe(true)
      }
    }
    for (const id of RETIRED) expect(ids.has(id)).toBe(false)
  })

  test('technical support questions do not assume a past support job', () => {
    const texts = STARTER_QUESTIONS.filter((q) => q.role === 'tech-support').map((q) => q.text)
    expect(texts).toContain(
      'Have you used any ticketing or helpdesk tools, such as Zendesk or Jira? If not, how would you get up to speed on one?',
    )
    expect(texts).toContain('How long would you work on an issue before escalating it?')
    expect(texts).toContain(
      'Tell me about the hardest technical problem you have solved, at school, at home, or in a project.',
    )
  })
})
