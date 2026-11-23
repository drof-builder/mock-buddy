import { describe, expect, test } from 'vitest'
import { buildMockSet, categoriesFor, createPicker, filterQuestions } from './questionPicker'
import type { Question, Role } from './types'

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
  test('behavioral mock is five behavioral questions', () => {
    const set = buildMockSet(all, 'behavioral', [])
    expect(set).toHaveLength(5)
    expect(set.every((x) => x.role === 'behavioral')).toBe(true)
  })

  test('role mock is two behavioral then three role questions', () => {
    const set = buildMockSet(all, 'tech-support', [])
    expect(set.map((x) => x.role)).toEqual(['behavioral', 'behavioral', 'tech-support', 'tech-support', 'tech-support'])
  })

  test('fills from behavioral when the role pool is small', () => {
    const set = buildMockSet(all, 'customer-service', [])
    expect(set.map((x) => x.role)).toEqual(['behavioral', 'behavioral', 'behavioral', 'behavioral', 'customer-service'])
    expect(new Set(set.map((x) => x.id)).size).toBe(5)
  })

  test('uses what exists when fewer than five questions are available', () => {
    const small = [q('b1', 'behavioral', 'x'), q('t1', 'tech-support', 'y')]
    expect(buildMockSet(small, 'tech-support', [])).toHaveLength(2)
  })

  test('fills from the role pool when behavioral questions run out', () => {
    const hidden = behavioral.map((x) => x.id)
    const set = buildMockSet(all, 'tech-support', hidden)
    expect(set.map((x) => x.role)).toEqual(['tech-support', 'tech-support', 'tech-support', 'tech-support'])
  })

  test('returns an empty set when everything is hidden', () => {
    expect(buildMockSet(all, 'behavioral', behavioral.map((x) => x.id))).toEqual([])
  })
})
