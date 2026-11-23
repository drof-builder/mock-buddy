import type { Role } from './types'

export interface CustomQuestionDraft {
  role: Role
  category: string
  text: string
}

export const MAX_QUESTION_LENGTH = 500
const DEFAULT_CATEGORY = 'general'

export function validateCustomQuestion(
  input: CustomQuestionDraft,
): { ok: true; value: CustomQuestionDraft } | { ok: false; error: string } {
  const text = input.text.trim()
  if (!text) return { ok: false, error: 'Question text is required.' }
  if (text.length > MAX_QUESTION_LENGTH) return { ok: false, error: 'Keep questions under 500 characters.' }
  return { ok: true, value: { role: input.role, category: input.category.trim() || DEFAULT_CATEGORY, text } }
}
