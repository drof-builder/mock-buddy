import Dexie, { type EntityTable } from 'dexie'
import { averageRating } from '../domain/ratings'
import type { Answer, MockSession, Question, Rating, Role, Settings } from '../domain/types'

export class StorageFullError extends Error {
  constructor() {
    super('Storage full')
    this.name = 'StorageFullError'
  }
}

export interface SessionSummary {
  session: MockSession
  averageRating: number | null
}

export interface CustomQuestionInput {
  role: Role
  category: string
  text: string
}

export interface Repository {
  saveAnswer(a: Answer): Promise<void>
  updateAnswer(id: string, patch: { rating?: Rating; note?: string }): Promise<void>
  getAnswer(id: string): Promise<Answer | undefined>
  listQuickAnswers(): Promise<Answer[]>
  deleteAnswer(id: string): Promise<void>
  createSession(role: Role): Promise<MockSession>
  addAnswerToSession(sessionId: string, a: Answer): Promise<void>
  completeSession(id: string): Promise<void>
  getSession(id: string): Promise<{ session: MockSession; answers: Answer[] } | undefined>
  listSessions(): Promise<SessionSummary[]>
  deleteSession(id: string): Promise<void>
  listCustomQuestions(): Promise<Question[]>
  addCustomQuestion(input: CustomQuestionInput): Promise<Question>
  updateCustomQuestion(id: string, input: CustomQuestionInput): Promise<void>
  deleteCustomQuestion(id: string): Promise<void>
  getSettings(): Promise<Settings>
  setStarterHidden(id: string, hidden: boolean): Promise<void>
}

/** Answers are stored with raw bytes instead of a Blob: this is more reliable on Safari. */
type StoredAnswer = Omit<Answer, 'audio'> & { audio: ArrayBuffer }
type StoredQuestion = Question & { createdAt: number }
type StoredSettings = Settings & { key: 'settings' }

type MockBuddyDb = Dexie & {
  answers: EntityTable<StoredAnswer, 'id'>
  sessions: EntityTable<MockSession, 'id'>
  customQuestions: EntityTable<StoredQuestion, 'id'>
  settings: EntityTable<StoredSettings, 'key'>
}

export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(blob)
  })
}

function isQuotaError(e: unknown): boolean {
  let current: unknown = e
  while (current && typeof current === 'object') {
    if ((current as { name?: string }).name === 'QuotaExceededError') return true
    current = (current as { inner?: unknown }).inner
  }
  return false
}

async function guardQuota<T>(write: () => Promise<T>): Promise<T> {
  try {
    return await write()
  } catch (e) {
    if (isQuotaError(e)) throw new StorageFullError()
    throw e
  }
}

function fromStored(s: StoredAnswer): Answer {
  return { ...s, audio: new Blob([s.audio], { type: s.mimeType }) }
}

async function toStored(a: Answer): Promise<StoredAnswer> {
  return { ...a, audio: await blobToArrayBuffer(a.audio) }
}

function stripCreatedAt({ createdAt: _createdAt, ...q }: StoredQuestion): Question {
  return q
}

export function createRepository(dbName = 'mock-buddy'): Repository {
  const db = new Dexie(dbName) as MockBuddyDb
  db.version(1).stores({
    answers: 'id, mode, sessionId, createdAt',
    sessions: 'id, createdAt',
    customQuestions: 'id, createdAt',
    settings: 'key',
  })

  async function getSettings(): Promise<Settings> {
    const row = await db.settings.get('settings')
    return { hiddenStarterIds: row?.hiddenStarterIds ?? [] }
  }

  return {
    async saveAnswer(a) {
      const stored = await toStored(a)
      await guardQuota(() => db.answers.put(stored))
    },

    async updateAnswer(id, patch) {
      await guardQuota(() => db.answers.update(id, patch))
    },

    async getAnswer(id) {
      const s = await db.answers.get(id)
      return s && fromStored(s)
    },

    async listQuickAnswers() {
      const rows = await db.answers.where('mode').equals('quick').toArray()
      return rows.sort((a, b) => b.createdAt - a.createdAt).map(fromStored)
    },

    async deleteAnswer(id) {
      await db.transaction('rw', db.answers, db.sessions, async () => {
        const a = await db.answers.get(id)
        if (a?.sessionId) {
          const s = await db.sessions.get(a.sessionId)
          if (s) await db.sessions.update(s.id, { answerIds: s.answerIds.filter((x) => x !== id) })
        }
        await db.answers.delete(id)
      })
    },

    async createSession(role) {
      const session: MockSession = { id: crypto.randomUUID(), role, answerIds: [], createdAt: Date.now(), completed: false }
      await guardQuota(() => db.sessions.add(session))
      return session
    },

    async addAnswerToSession(sessionId, a) {
      const stored = await toStored(a)
      await guardQuota(() =>
        db.transaction('rw', db.answers, db.sessions, async () => {
          const s = await db.sessions.get(sessionId)
          if (!s) throw new Error(`Unknown session ${sessionId}`)
          await db.answers.put(stored)
          await db.sessions.update(sessionId, { answerIds: [...s.answerIds, a.id] })
        }),
      )
    },

    async completeSession(id) {
      await guardQuota(() => db.sessions.update(id, { completed: true }))
    },

    async getSession(id) {
      const session = await db.sessions.get(id)
      if (!session) return undefined
      const rows = await db.answers.bulkGet(session.answerIds)
      const answers = rows.flatMap((r) => (r ? [fromStored(r)] : []))
      return { session, answers }
    },

    async listSessions() {
      const sessions = await db.sessions.orderBy('createdAt').reverse().toArray()
      return Promise.all(
        sessions.map(async (session) => {
          const rows = await db.answers.bulkGet(session.answerIds)
          const ratings = rows.flatMap((r) => (r ? [{ rating: r.rating }] : []))
          return { session, averageRating: averageRating(ratings) }
        }),
      )
    },

    async deleteSession(id) {
      await db.transaction('rw', db.answers, db.sessions, async () => {
        await db.answers.where('sessionId').equals(id).delete()
        await db.sessions.delete(id)
      })
    },

    async listCustomQuestions() {
      const rows = await db.customQuestions.orderBy('createdAt').toArray()
      return rows.map(stripCreatedAt)
    },

    async addCustomQuestion(input) {
      const row: StoredQuestion = { id: `custom-${crypto.randomUUID()}`, ...input, source: 'custom', createdAt: Date.now() }
      await guardQuota(() => db.customQuestions.add(row))
      return stripCreatedAt(row)
    },

    async updateCustomQuestion(id, input) {
      await guardQuota(() => db.customQuestions.update(id, { ...input }))
    },

    async deleteCustomQuestion(id) {
      await db.customQuestions.delete(id)
    },

    getSettings,

    async setStarterHidden(id, hidden) {
      const current = new Set((await getSettings()).hiddenStarterIds)
      if (hidden) current.add(id)
      else current.delete(id)
      await guardQuota(() => db.settings.put({ key: 'settings', hiddenStarterIds: [...current] }))
    },
  }
}
