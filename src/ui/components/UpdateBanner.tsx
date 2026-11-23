import { useState } from 'react'

interface Props {
  onUpdate(): void
  onLater(): void
}

/** Bottom bar shown when a new version of the app has been downloaded. */
export function UpdateBanner({ onUpdate, onLater }: Props) {
  const [updating, setUpdating] = useState(false)

  return (
    <div role="status" className="update-banner">
      <span>A new version is available.</span>
      <div className="row">
        <button
          type="button"
          className="button button-primary"
          disabled={updating}
          onClick={() => {
            if (updating) return
            setUpdating(true)
            onUpdate()
          }}
        >
          Update
        </button>
        <button type="button" className="button" onClick={onLater}>
          Later
        </button>
      </div>
    </div>
  )
}
