import Dexie from 'dexie'
import { describe, expect, test } from 'vitest'
import type { Answer } from '../domain/types'
import { blobToArrayBuffer, createRepository, StorageFullError, type Repository } from './db'

let lastDbName = ''
function newRepo(): Repository {
  lastDbName = `test-${crypto.randomUUID()}`
  return createRepository(lastDbName)
}

async function audioRowCount(): Promise<number> {
  const raw = new Dexie(lastDbName)
  await raw.open()
  const n = await raw.table('answerAudio').count()
  raw.close()
  return n
}

let counter = 0
function makeAnswer(overrides: Partial<Answer> = {}): Answer {
  counter++
  return {
    id: `a${counter}`,
    questionId: 'beh-001',
    questionText: 'Tell me about yourself.',
    role: 'behavioral',
    mode: 'quick',
    audio: new Blob([new Uint8Array([9])], { type: 'audio/webm' }),
    mimeType: 'audio/webm',
    durationSec: 30,
    createdAt: 1000 + counter,
    ...overrides,
  }
}

describe('answers', () => {
  test('audio bytes and type survive a round trip', async () => {
    const repo = newRepo()
    await repo.saveAnswer(
      makeAnswer({ id: 'a1', audio: new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/mp4' }), mimeType: 'audio/mp4' }),
    )
    const got = await repo.getAnswer('a1')
    expect(got!.audio.type).toBe('audio/mp4')
    expect(new Uint8Array(await blobToArrayBuffer(got!.audio))).toEqual(new Uint8Array([1, 2, 3]))
  })

  test('listQuickAnswers returns only quick answers, newest first', async () => {
    const repo = newRepo()
    await repo.saveAnswer(makeAnswer({ id: 'old', createdAt: 1 }))
    await repo.saveAnswer(makeAnswer({ id: 'new', createdAt: 2 }))
    await repo.saveAnswer(makeAnswer({ id: 'mock', mode: 'mock', sessionId: 's', createdAt: 3 }))
    expect((await repo.listQuickAnswers()).map((a) => a.id)).toEqual(['new', 'old'])
  })

  test('list rows do not carry audio, but getAnswer does', async () => {
    const repo = newRepo()
    await repo.saveAnswer(makeAnswer({ id: 'a1' }))
    const [row] = await repo.listQuickAnswers()
    expect('audio' in row).toBe(false)
    expect(row.mimeType).toBe('audio/webm')
    expect((await repo.getAnswer('a1'))!.audio.size).toBe(1)
  })

  test('deleting an answer also deletes its audio', async () => {
    const repo = newRepo()
    await repo.saveAnswer(makeAnswer({ id: 'a1' }))
    await repo.deleteAnswer('a1')
    expect(await audioRowCount()).toBe(0)
  })

  test('updateAnswer sets rating and note', async () => {
    const repo = newRepo()
    await repo.saveAnswer(makeAnswer({ id: 'a1' }))
    await repo.updateAnswer('a1', { rating: 4, note: 'too fast' })
    const got = await repo.getAnswer('a1')
    expect(got!.rating).toBe(4)
    expect(got!.note).toBe('too fast')
  })

  test('getAnswer returns undefined for an unknown id', async () => {
    expect(await newRepo().getAnswer('nope')).toBeUndefined()
  })
})

describe('mock sessions', () => {
  test('a new session is unfinished and empty', async () => {
    const s = await newRepo().createSession('tech-support')
    expect(s.completed).toBe(false)
    expect(s.answerIds).toEqual([])
    expect(s.role).toBe('tech-support')
  })

  test('answers added to a session come back in order', async () => {
    const repo = newRepo()
    const s = await repo.createSession('behavioral')
    await repo.addAnswerToSession(s.id, makeAnswer({ id: 'x', mode: 'mock', sessionId: s.id }))
    await repo.addAnswerToSession(s.id, makeAnswer({ id: 'y', mode: 'mock', sessionId: s.id }))
    const got = await repo.getSession(s.id)
    expect(got!.session.answerIds).toEqual(['x', 'y'])
    expect(got!.answers.map((a) => a.id)).toEqual(['x', 'y'])
  })

  test('completeSession marks it completed', async () => {
    const repo = newRepo()
    const s = await repo.createSession('behavioral')
    await repo.completeSession(s.id)
    expect((await repo.getSession(s.id))!.session.completed).toBe(true)
  })

  test('listSessions is newest first with an average rating', async () => {
    const repo = newRepo()
    const first = await repo.createSession('behavioral')
    await new Promise((r) => setTimeout(r, 5))
    const second = await repo.createSession('customer-service')
    await repo.addAnswerToSession(first.id, makeAnswer({ id: 'r4', mode: 'mock', sessionId: first.id, rating: 4 }))
    await repo.addAnswerToSession(first.id, makeAnswer({ id: 'r5', mode: 'mock', sessionId: first.id, rating: 5 }))
    const list = await repo.listSessions()
    expect(list.map((x) => x.session.id)).toEqual([second.id, first.id])
    expect(list[0].averageRating).toBeNull()
    expect(list[1].averageRating).toBe(4.5)
  })

  test('deleteSession removes the session and its answers', async () => {
    const repo = newRepo()
    const s = await repo.createSession('behavioral')
    await repo.addAnswerToSession(s.id, makeAnswer({ id: 'gone', mode: 'mock', sessionId: s.id }))
    await repo.deleteSession(s.id)
    expect(await repo.getSession(s.id)).toBeUndefined()
    expect(await repo.getAnswer('gone')).toBeUndefined()
  })

  test('adding the same answer twice lists it once', async () => {
    const repo = newRepo()
    const s = await repo.createSession('behavioral')
    const a = makeAnswer({ id: 'dup', mode: 'mock', sessionId: s.id, rating: 3 })
    await repo.addAnswerToSession(s.id, a)
    await repo.addAnswerToSession(s.id, a)
    const got = await repo.getSession(s.id)
    expect(got!.session.answerIds).toEqual(['dup'])
    expect(got!.answers).toHaveLength(1)
  })

  test('deleteSession also deletes the audio of its answers', async () => {
    const repo = newRepo()
    const s = await repo.createSession('behavioral')
    await repo.addAnswerToSession(s.id, makeAnswer({ id: 'm1', mode: 'mock', sessionId: s.id }))
    await repo.deleteSession(s.id)
    expect(await audioRowCount()).toBe(0)
  })

  test('deleteAnswer also removes it from its session', async () => {
    const repo = newRepo()
    const s = await repo.createSession('behavioral')
    await repo.addAnswerToSession(s.id, makeAnswer({ id: 'keep', mode: 'mock', sessionId: s.id }))
    await repo.addAnswerToSession(s.id, makeAnswer({ id: 'drop', mode: 'mock', sessionId: s.id }))
    await repo.deleteAnswer('drop')
    expect((await repo.getSession(s.id))!.session.answerIds).toEqual(['keep'])
  })
})

describe('custom questions', () => {
  test('add, update, list oldest first, delete', async () => {
    const repo = newRepo()
    const a = await repo.addCustomQuestion({ role: 'tech-support', category: 'vpn', text: 'What is split tunneling?' })
    expect(a.id.startsWith('custom-')).toBe(true)
    expect(a.source).toBe('custom')
    await new Promise((r) => setTimeout(r, 5))
    const b = await repo.addCustomQuestion({ role: 'behavioral', category: 'general', text: 'Why us?' })
    expect((await repo.listCustomQuestions()).map((q) => q.id)).toEqual([a.id, b.id])

    await repo.updateCustomQuestion(a.id, { role: 'tech-support', category: 'vpn', text: 'Explain split tunneling.' })
    expect((await repo.listCustomQuestions())[0].text).toBe('Explain split tunneling.')

    await repo.deleteCustomQuestion(a.id)
    expect((await repo.listCustomQuestions()).map((q) => q.id)).toEqual([b.id])
  })
})

describe('settings', () => {
  test('hidden starter ids default to empty and toggle without duplicates', async () => {
    const repo = newRepo()
    expect(await repo.getSettings()).toEqual({ hiddenStarterIds: [] })
    await repo.setStarterHidden('beh-001', true)
    await repo.setStarterHidden('beh-001', true)
    expect((await repo.getSettings()).hiddenStarterIds).toEqual(['beh-001'])
    await repo.setStarterHidden('beh-001', false)
    expect((await repo.getSettings()).hiddenStarterIds).toEqual([])
  })
})

describe('storage full', () => {
  test('a quota error on write becomes StorageFullError', async () => {
    const repo = newRepo()
    const original = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function () {
      throw new DOMException('quota', 'QuotaExceededError')
    }
    try {
      await expect(repo.saveAnswer(makeAnswer())).rejects.toBeInstanceOf(StorageFullError)
    } finally {
      IDBObjectStore.prototype.put = original
    }
  })
})
