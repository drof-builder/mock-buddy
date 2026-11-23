import { describe, expect, test } from 'vitest'
import { matchesCategory, topicsOf, topLevelCategories } from './categoryGroups'

describe('topLevelCategories', () => {
  test('replaces technical topics with their group, once', () => {
    const top = topLevelCategories(['networking', 'databases-sql', 'hotel-systems', 'windows-ad', 'basic-screening'])
    expect([...top].sort()).toEqual(['basic-screening', 'hotel-systems', 'technical-knowledge'])
  })

  test('leaves ungrouped categories alone', () => {
    expect(topLevelCategories(['situational', 'role-play'])).toEqual(['situational', 'role-play'])
  })
})

describe('topicsOf', () => {
  test('lists the topics of a group that actually have questions', () => {
    expect(topicsOf('technical-knowledge', ['networking', 'databases-sql', 'hotel-systems'])).toEqual([
      'networking',
      'databases-sql',
    ])
  })

  test('returns nothing for a category that is not a group', () => {
    expect(topicsOf('troubleshooting', ['troubleshooting'])).toEqual([])
  })
})

describe('matchesCategory', () => {
  test('an empty selection matches everything', () => {
    expect(matchesCategory('hotel-systems', '')).toBe(true)
  })

  test('a group matches each of its topics', () => {
    for (const topic of ['networking', 'windows-ad', 'computer-basics-security', 'databases-sql']) {
      expect(matchesCategory(topic, 'technical-knowledge')).toBe(true)
    }
  })

  test('a group does not match categories outside it', () => {
    expect(matchesCategory('hotel-systems', 'technical-knowledge')).toBe(false)
    expect(matchesCategory('troubleshooting', 'technical-knowledge')).toBe(false)
  })

  test('a group also matches questions filed directly under the group name', () => {
    expect(matchesCategory('technical-knowledge', 'technical-knowledge')).toBe(true)
  })

  test('a single topic matches only itself', () => {
    expect(matchesCategory('networking', 'networking')).toBe(true)
    expect(matchesCategory('windows-ad', 'networking')).toBe(false)
  })
})
