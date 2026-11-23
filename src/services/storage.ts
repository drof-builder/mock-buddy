export interface StorageService {
  estimate(): Promise<{ usedBytes: number; quotaBytes: number } | null>
  persist(): Promise<boolean>
  persisted(): Promise<boolean>
}

export const browserStorage: StorageService = {
  async estimate() {
    if (!navigator.storage?.estimate) return null
    const { usage, quota } = await navigator.storage.estimate()
    if (usage === undefined || quota === undefined) return null
    return { usedBytes: usage, quotaBytes: quota }
  },
  async persist() {
    return navigator.storage?.persist ? navigator.storage.persist() : false
  },
  async persisted() {
    return navigator.storage?.persisted ? navigator.storage.persisted() : false
  },
}

const UNITS = ['KB', 'MB', 'GB', 'TB']

export function formatBytes(n: number): string {
  if (n < 1024) return `${Math.round(n)} B`
  let value = n / 1024
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(1)} ${UNITS[unit]}`
}
