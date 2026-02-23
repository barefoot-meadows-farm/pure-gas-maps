import type { GasStationWithDistance } from '@/types/station'
import { FuelBadge } from './FuelBadge'
import { DirectionsButton } from './DirectionsButton'
import { formatDistance, formatAddress } from '@/lib/format'
import { useMapStore, useAppStore } from '@/store'

interface StationCardProps {
  station: GasStationWithDistance
}

export function StationCard({ station }: StationCardProps) {
  const selectStation = useMapStore((s) => s.selectStation)
  const setActiveTab = useAppStore((s) => s.setActiveTab)

  function handleViewOnMap() {
    setActiveTab('map')
    selectStation(station)
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {station.name}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {formatAddress('', station.city, station.state, '')}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <FuelBadge octanes={station.octanes ?? [station.octane]} size="sm" />
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
            {formatDistance(station.distanceKm)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={handleViewOnMap}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          View on Map
        </button>
        <DirectionsButton station={station} variant="compact" />
      </div>
    </div>
  )
}
