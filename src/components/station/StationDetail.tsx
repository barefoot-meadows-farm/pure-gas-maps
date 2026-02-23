import type { GasStation } from '@/types/station'
import { FuelBadge } from './FuelBadge'
import { DirectionsButton } from './DirectionsButton'
import { formatPhone, formatAddress } from '@/lib/format'

interface StationDetailProps {
  station: GasStation
  distanceKm?: number
}

export function StationDetail({ station }: StationDetailProps) {
  const fullAddress = formatAddress(station.address, station.city, station.state, station.zip)
  const phone = formatPhone(station.phone)

  return (
    <div style={{ padding: '0 20px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          {station.name}
        </h2>
        <FuelBadge octane={station.octane} />
      </div>

      {/* Address */}
      {fullAddress && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 14,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>📍</span>
          <span style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {fullAddress}
          </span>
        </div>
      )}

      {/* Phone */}
      {phone && (
        <a
          href={`tel:${station.phone.replace(/\D/g, '')}`}
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 20,
            alignItems: 'center',
            color: 'var(--accent-blue)',
            textDecoration: 'none',
            fontSize: 15,
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>📞</span>
          {phone}
        </a>
      )}

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: 'var(--border-subtle)',
          marginBottom: 20,
        }}
      />

      {/* Directions */}
      <DirectionsButton station={station} />

      {/* Attribution */}
      <p
        style={{
          marginTop: 16,
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--text-tertiary)',
        }}
      >
        Data from{' '}
        <a
          href="https://www.pure-gas.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}
        >
          pure-gas.org
        </a>
        {' '}· CC Licensed
      </p>
    </div>
  )
}
