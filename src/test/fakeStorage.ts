import type { StorageService } from '../services/storage'

export interface FakeStorage extends StorageService {
  readonly persistCalls: number
}

export function createFakeStorage(
  opts: { persisted?: boolean; usedBytes?: number; quotaBytes?: number } = {},
): FakeStorage {
  let persistCalls = 0
  return {
    get persistCalls() {
      return persistCalls
    },
    async estimate() {
      return { usedBytes: opts.usedBytes ?? 1024 ** 2, quotaBytes: opts.quotaBytes ?? 1024 ** 3 }
    },
    async persist() {
      persistCalls++
      return opts.persisted ?? true
    },
    async persisted() {
      return opts.persisted ?? true
    },
  }
}
