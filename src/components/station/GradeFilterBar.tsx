import { useAppStore } from '@/store'
import type { FuelType } from '@/types/station'

interface Chip {
  label: string
  value: FuelType | null
  /** Active background colour */
  activeBg: string
  activeColor: string
}

const CHIPS: Chip[] = [
  { label: 'All',     value: null,          activeBg: 'var(--accent-primary)', activeColor: '#fff' },
  { label: '87 Reg',  value: 'E0',          activeBg: 'var(--badge-87)',        activeColor: 'var(--badge-87-text)' },
  { label: '89 Mid',  value: 'E0-Midgrade', activeBg: 'var(--badge-89)',        activeColor: 'var(--badge-89-text)' },
  { label: '91+ Prem',value: 'E0-Premium',  activeBg: 'var(--badge-91)',        activeColor: 'var(--badge-91-text)' },
]

export function GradeFilterBar() {
  const gradeFilter = useAppStore((s) => s.gradeFilter)
  const setGradeFilter = useAppStore((s) => s.setGradeFilter)

  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        // Hide scrollbar on all browsers
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingBottom: 2, // prevent clipping box-shadow on chips
      }}
    >
      {CHIPS.map((chip) => {
        const isActive = gradeFilter === chip.value
        return (
          <button
            key={String(chip.value)}
            onClick={() => setGradeFilter(chip.value)}
            style={{
              flexShrink: 0,
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              border: isActive ? 'none' : '1px solid var(--border-color)',
              backgroundColor: isActive ? chip.activeBg : 'var(--bg-card)',
              color: isActive ? chip.activeColor : 'var(--text-secondary)',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
              transition: 'background-color 150ms, color 150ms',
            }}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
