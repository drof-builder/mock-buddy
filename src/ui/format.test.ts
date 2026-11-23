import { expect, test } from 'vitest'
import { categoryLabel, formatClock, sortCategories } from './format'

test('formatClock shows minutes and zero-padded seconds', () => {
  expect(formatClock(0)).toBe('0:00')
  expect(formatClock(75)).toBe('1:15')
  expect(formatClock(120)).toBe('2:00')
})

test('formatClock clamps negatives to zero', () => {
  expect(formatClock(-3)).toBe('0:00')
})

test('categoryLabel shows friendly names for starter categories', () => {
  expect(categoryLabel('basic-screening')).toBe('Basic / screening')
  expect(categoryLabel('past-experience')).toBe('Past experience (STAR)')
  expect(categoryLabel('tools-metrics')).toBe('Tools & metrics')
  expect(categoryLabel('role-play')).toBe('Role-play')
})

test('categoryLabel tidies up custom categories', () => {
  expect(categoryLabel('my-own')).toBe('My own')
  expect(categoryLabel('vpn')).toBe('Vpn')
})

test('sortCategories puts screening first, then known types, then custom ones A to Z', () => {
  expect(sortCategories(['zebra', 'soft-skills', 'apple', 'basic-screening', 'troubleshooting'])).toEqual([
    'basic-screening',
    'troubleshooting',
    'soft-skills',
    'apple',
    'zebra',
  ])
})

test('categoryLabel names the technical support topic categories', () => {
  expect(categoryLabel('networking')).toBe('Networking')
  expect(categoryLabel('windows-ad')).toBe('Windows & Active Directory')
  expect(categoryLabel('computer-basics-security')).toBe('Computer basics & security')
  expect(categoryLabel('databases-sql')).toBe('Databases & SQL')
  expect(categoryLabel('hotel-systems')).toBe('Hotel systems')
})

test('sortCategories keeps the technical support topics in reading order', () => {
  expect(
    sortCategories([
      'soft-skills',
      'hotel-systems',
      'troubleshooting',
      'databases-sql',
      'computer-basics-security',
      'windows-ad',
      'networking',
      'basic-screening',
    ]),
  ).toEqual([
    'basic-screening',
    'networking',
    'windows-ad',
    'computer-basics-security',
    'databases-sql',
    'hotel-systems',
    'troubleshooting',
    'soft-skills',
  ])
})
