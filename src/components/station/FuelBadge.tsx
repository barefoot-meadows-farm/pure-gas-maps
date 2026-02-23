import { formatOctane } from '@/lib/format'

interface FuelBadgeProps {
  octane: number
  size?: 'sm' | 'md'
}

function getBadgeColors(octane: number) {
  if (octane >= 91) return { bg: 'var(--badge-91)', color: 'var(--badge-91-text)' }
  if (octane >= 89) return { bg: 'var(--badge-89)', color: 'var(--badge-89-text)' }
  return { bg: 'var(--badge-87)', color: 'var(--badge-87-text)' }
}

export function FuelBadge({ octane, size = 'md' }: FuelBadgeProps) {
  const { bg, color } = getBadgeColors(octane)
  const isSmall = size === 'sm'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color,
        fontSize: isSmall ? 11 : 13,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ opacity: 0.7, fontSize: isSmall ? 9 : 11 }}>E0</span>
      {formatOctane(octane)}
    </span>
  )
}
