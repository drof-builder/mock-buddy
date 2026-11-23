export type Role = 'behavioral' | 'tech-support' | 'customer-service'

export const ROLES: readonly Role[] = ['behavioral', 'tech-support', 'customer-service']

export const ROLE_LABELS: Record<Role, string> = {
  behavioral: 'Behavioral',
  'tech-support': 'Technical Support',
  'customer-service': 'Customer Service',
}

export type Rating = 1 | 2 | 3 | 4 | 5

export interface Question {
  id: string
  role: Role
  category: string
  text: string
  source: 'starter' | 'custom'
}

export interface Answer {
  id: string
  questionId: string
  /** Snapshot of the question text at record time, so history never changes. */
  questionText: string
  role: Role
  mode: 'quick' | 'mock'
  sessionId?: string
  audio: Blob
  mimeType: string
  durationSec: number
  rating?: Rating
  note?: string
  createdAt: number
}

export interface MockSession {
  id: string
  role: Role
  answerIds: string[]
  createdAt: number
  completed: boolean
}

export interface Settings {
  hiddenStarterIds: string[]
}

export const MOCK_SET_SIZE = 5
export const MOCK_ANSWER_SECONDS = 120
