import { ROLE_LABELS, ROLES, type Role } from '../../domain/types'
import { categoryLabel, sortCategories } from '../format'

interface Props {
  role: Role
  category: string
  categories: string[]
  onRoleChange(role: Role): void
  onCategoryChange(category: string): void
  showCategory?: boolean
}

export function RoleCategoryPicker({ role, category, categories, onRoleChange, onCategoryChange, showCategory = true }: Props) {
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
            {sortCategories(categories).map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
