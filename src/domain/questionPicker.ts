import { MOCK_SET_SIZE, type Question, type Role } from './types'

const ROLE_QUESTIONS_IN_MOCK = 3

export function filterQuestions(
  all: Question[],
  opts: { role: Role; category?: string; hiddenIds?: string[] },
): Question[] {
  const hidden = new Set(opts.hiddenIds ?? [])
  return all.filter(
    (q) => q.role === opts.role && (!opts.category || q.category === opts.category) && !hidden.has(q.id),
  )
}

export function categoriesFor(all: Question[], role: Role): string[] {
  return [...new Set(all.filter((q) => q.role === role).map((q) => q.category))].sort()
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Serves questions in random order without repeats. When the pool is used up
 * it reshuffles, making sure the next question differs from the last one.
 */
export function createPicker(pool: Question[], random: () => number = Math.random): { next(): Question | null } {
  let queue: Question[] = []
  let last: Question | null = null

  return {
    next() {
      if (pool.length === 0) return null
      if (queue.length === 0) {
        queue = shuffle(pool, random)
        if (last && pool.length > 1 && queue[0].id === last.id) {
          ;[queue[0], queue[queue.length - 1]] = [queue[queue.length - 1], queue[0]]
        }
      }
      last = queue.shift()!
      return last
    },
  }
}

export function buildMockSet(
  all: Question[],
  role: Role,
  hiddenIds: string[],
  random: () => number = Math.random,
): Question[] {
  const behavioral = shuffle(filterQuestions(all, { role: 'behavioral', hiddenIds }), random)
  if (role === 'behavioral') return behavioral.slice(0, MOCK_SET_SIZE)

  const rolePool = shuffle(filterQuestions(all, { role, hiddenIds }), random)
  const roleCount = Math.min(ROLE_QUESTIONS_IN_MOCK, rolePool.length)
  const behavioralCount = Math.min(MOCK_SET_SIZE - roleCount, behavioral.length)
  // If behavioral questions run short, top up with extra role questions.
  const extraRole = Math.min(MOCK_SET_SIZE - roleCount - behavioralCount, rolePool.length - roleCount)

  return [...behavioral.slice(0, behavioralCount), ...rolePool.slice(0, roleCount + extraRole)]
}
