import { describe, expect, test } from 'vitest'
import { buildMockSet, categoriesFor, createPicker, filterQuestions } from './questionPicker'
import { STARTER_QUESTIONS } from '../data/starterQuestions'
import { ROLES, type Question, type Role } from './types'

function q(id: string, role: Role, category: string): Question {
  return { id, role, category, text: `Question ${id}`, source: 'starter' }
}

const behavioral = [
  q('b1', 'behavioral', 'conflict'),
  q('b2', 'behavioral', 'conflict'),
  q('b3', 'behavioral', 'intro'),
  q('b4', 'behavioral', 'teamwork'),
  q('b5', 'behavioral', 'teamwork'),
  q('b6', 'behavioral', 'intro'),
]
const techSupport = [
  q('t1', 'tech-support', 'troubleshooting'),
  q('t2', 'tech-support', 'troubleshooting'),
  q('t3', 'tech-support', 'communication'),
  q('t4', 'tech-support', 'communication'),
]
const all = [...behavioral, ...techSupport, q('c1', 'customer-service', 'empathy')]

describe('filterQuestions', () => {
  test('keeps only the chosen role', () => {
    const result = filterQuestions(all, { role: 'tech-support' })
    expect(result).toHaveLength(4)
    expect(result.every((x) => x.role === 'tech-support')).toBe(true)
  })

  test('filters by category when given', () => {
    expect(filterQuestions(all, { role: 'behavioral', category: 'conflict' }).map((x) => x.id)).toEqual(['b1', 'b2'])
  })

  test('treats an empty category as any category', () => {
    expect(filterQuestions(all, { role: 'behavioral', category: '' })).toHaveLength(6)
  })

  test('drops hidden questions', () => {
    const result = filterQuestions(all, { role: 'behavioral', hiddenIds: ['b1'] })
    expect(result.some((x) => x.id === 'b1')).toBe(false)
    expect(result).toHaveLength(5)
  })
})

describe('categoriesFor', () => {
  test('returns unique categories for a role, sorted', () => {
    expect(categoriesFor(all, 'behavioral')).toEqual(['conflict', 'intro', 'teamwork'])
  })
})

describe('createPicker', () => {
  const pool3 = behavioral.slice(0, 3)

  test('does not repeat a question until the pool is used up', () => {
    const p = createPicker(pool3)
    const ids = [p.next()!, p.next()!, p.next()!].map((x) => x.id)
    expect(new Set(ids).size).toBe(3)
  })

  test('never serves the same question twice in a row across resets', () => {
    const p = createPicker(pool3)
    let last = p.next()!.id
    for (let i = 0; i < 150; i++) {
      const id = p.next()!.id
      expect(id).not.toBe(last)
      last = id
    }
  })

  test('returns null for an empty pool', () => {
    expect(createPicker([]).next()).toBeNull()
  })

  test('keeps returning the only question in a one-question pool', () => {
    const p = createPicker([behavioral[0]])
    expect(p.next()?.id).toBe('b1')
    expect(p.next()?.id).toBe('b1')
  })
})

describe('buildMockSet', () => {
  function many(prefix: string, role: Role, n: number): Question[] {
    return Array.from({ length: n }, (_, k) => q(`${prefix}${k + 1}`, role, 'any'))
  }
  const beh = many('b', 'behavioral', 20)
  const ts = many('t', 'tech-support', 20)
  const big = [...beh, ...ts, ...many('c', 'customer-service', 3)]
  const roles = (set: Question[]) => set.map((x) => x.role)

  test('a behavioral mock is ten behavioral questions', () => {
    const set = buildMockSet(big, 'behavioral', [])
    expect(set).toHaveLength(10)
    expect(set.every((x) => x.role === 'behavioral')).toBe(true)
  })

  test('a role mock is four behavioral then six role questions', () => {
    expect(roles(buildMockSet(big, 'tech-support', []))).toEqual([
      ...Array(4).fill('behavioral'),
      ...Array(6).fill('tech-support'),
    ])
  })

  test('never repeats a question', () => {
    const set = buildMockSet(big, 'tech-support', [])
    expect(new Set(set.map((x) => x.id)).size).toBe(10)
  })

  test('fills from behavioral when the role pool is small', () => {
    expect(roles(buildMockSet(big, 'customer-service', []))).toEqual([
      ...Array(7).fill('behavioral'),
      ...Array(3).fill('customer-service'),
    ])
  })

  test('fills from the role pool when behavioral questions run out', () => {
    const hidden = beh.slice(2).map((x) => x.id)
    expect(roles(buildMockSet(big, 'tech-support', hidden))).toEqual([
      ...Array(2).fill('behavioral'),
      ...Array(8).fill('tech-support'),
    ])
  })

  test('uses what exists when fewer than ten questions are available', () => {
    const small = [q('b1', 'behavioral', 'x'), q('t1', 'tech-support', 'y')]
    expect(buildMockSet(small, 'tech-support', [])).toHaveLength(2)
  })

  test('returns an empty set when everything is hidden', () => {
    expect(buildMockSet(big, 'behavioral', beh.map((x) => x.id))).toEqual([])
  })

  test('the real starter questions give a full ten-question mock for every role', () => {
    for (const role of ROLES) expect(buildMockSet(STARTER_QUESTIONS, role, [])).toHaveLength(10)
  })
})
