import { topicsOf, topLevelCategories } from '../../domain/categoryGroups'
import { ROLE_LABELS, ROLES, type Role } from '../../domain/types'
import { categoryLabel, sortCategories } from '../format'

interface Props {
  role: Role
  category: string
  categories: string[]
  onRoleChange(role: Role): void
  onCategoryChange(category: string): void
  /** Narrower choice inside a category group ('' = the whole group). */
  topic?: string
  onTopicChange?(topic: string): void
  showCategory?: boolean
}

export function RoleCategoryPicker({
  role,
  category,
  categories,
  onRoleChange,
  onCategoryChange,
  topic = '',
  onTopicChange,
  showCategory = true,
}: Props) {
  const topics = category ? topicsOf(category, categories) : []

  return (
    <div className="stack">
      <label>
        Role
        <select value={role} onChange={(e) => onRoleChange(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </label>
      {showCategory && (
        <label>
          Category
          <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
            <option value="">Any category</option>
            {sortCategories(topLevelCategories(categories)).map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </select>
        </label>
      )}
      {showCategory && topics.length > 0 && onTopicChange && (
        <label>
          Topic
          <select value={topic} onChange={(e) => onTopicChange(e.target.value)}>
            <option value="">All {categoryLabel(category).toLowerCase()}</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {categoryLabel(t)}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
