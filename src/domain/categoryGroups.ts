/**
 * Categories that bundle several topics. Picking the group practises all of
 * its topics; a second "Topic" choice narrows it to one.
 */
export const CATEGORY_GROUPS: Record<string, readonly string[]> = {
  'technical-knowledge': ['networking', 'windows-ad', 'computer-basics-security', 'databases-sql'],
}

function groupOf(category: string): string | undefined {
  return Object.keys(CATEGORY_GROUPS).find((g) => CATEGORY_GROUPS[g].includes(category))
}

/** The categories to offer first: grouped topics collapse into their group. */
export function topLevelCategories(categories: string[]): string[] {
  return [...new Set(categories.map((c) => groupOf(c) ?? c))]
}

/** The topics of a group that appear in `available`, in the group's order. */
export function topicsOf(group: string, available: string[]): string[] {
  return (CATEGORY_GROUPS[group] ?? []).filter((t) => available.includes(t))
}

/** Whether a question in `questionCategory` belongs to the `selected` category ('' = any). */
export function matchesCategory(questionCategory: string, selected: string): boolean {
  if (!selected || questionCategory === selected) return true
  return CATEGORY_GROUPS[selected]?.includes(questionCategory) ?? false
}
