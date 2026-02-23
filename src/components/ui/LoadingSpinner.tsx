interface LoadingSpinnerProps {
  size?: number
  color?: string
}

export function LoadingSpinner({ size = 24, color = 'var(--accent-primary)' }: LoadingSpinnerProps) {
  return (
    <div
      className="animate-spin"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid transparent`,
        borderTopColor: color,
        borderRightColor: color,
        flexShrink: 0,
      }}
    />
  )
}
