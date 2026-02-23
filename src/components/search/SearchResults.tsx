import type { GasStation } from '@/types/station'

interface SearchResultsProps {
  results: GasStation[]
  onSelect: (station: GasStation) => void
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (results.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 4,
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        zIndex: 200,
        maxHeight: 280,
        overflowY: 'auto',
      }}
    >
      {results.map((station) => (
        <button
          key={station.id}
          onClick={() => onSelect(station)}
          style={{
            width: '100%',
            padding: '12px 16px',
            textAlign: 'left',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            {station.name}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {station.city}, {station.state} · {station.octane} oct
          </span>
        </button>
      ))}
    </div>
  )
}
