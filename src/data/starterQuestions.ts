import type { Question, Role } from '../domain/types'
import raw from './questions.json'

interface RawQuestion {
  id: string
  role: Role
  category: string
  text: string
}

export const STARTER_QUESTIONS: Question[] = (raw as RawQuestion[]).map((q) => ({ ...q, source: 'starter' }))
