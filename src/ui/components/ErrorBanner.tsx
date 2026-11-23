interface Props {
  message: string
  actionLabel?: string
  onAction?(): void
}

export function ErrorBanner({ message, actionLabel, onAction }: Props) {
  return (
    <div role="alert" className="banner banner-error">
      <p className="banner-text">{message}</p>
      {actionLabel && onAction && (
        <button type="button" className="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
