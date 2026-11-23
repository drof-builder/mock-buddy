export function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function formatDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Display names and order for the starter question types. */
const CATEGORY_LABELS: Record<string, string> = {
  'basic-screening': 'Basic / screening',
  'past-experience': 'Past experience (STAR)',
  'work-style': 'Work style',
  'technical-knowledge': 'Technical knowledge',
  troubleshooting: 'Troubleshooting',
  situational: 'Situational',
  'role-play': 'Role-play',
  'tools-metrics': 'Tools & metrics',
  'soft-skills': 'Soft skills',
}
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS)

export function categoryLabel(category: string): string {
  const known = CATEGORY_LABELS[category]
  if (known) return known
  const words = category.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** Starter types in their natural order (screening first), then custom categories A to Z. */
export function sortCategories(categories: string[]): string[] {
  const rank = (c: string) => {
    const i = CATEGORY_ORDER.indexOf(c)
    return i === -1 ? CATEGORY_ORDER.length : i
  }
  return [...categories].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}
