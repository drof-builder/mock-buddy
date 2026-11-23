import { ROLE_LABELS, ROLES, type Role } from '../../domain/types'

interface Props {
  role: Role
  category: string
  categories: string[]
  onRoleChange(role: Role): void
  onCategoryChange(category: string): void
  showCategory?: boolean
}

function labelFor(category: string): string {
  const words = category.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
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
            {categories.map((c) => (
              <option key={c} value={c}>
                {labelFor(c)}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
