interface ProgressBarProps {
  value: number  // 0-1
  label?: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const pct = Math.round(value * 100)

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}
        >
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div
        style={{
          height: 6,
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-tertiary)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-primary)',
            transition: 'width 200ms ease',
          }}
        />
      </div>
    </div>
  )
}
