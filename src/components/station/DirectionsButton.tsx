import { Capacitor } from '@capacitor/core'
import type { GasStation } from '@/types/station'

interface DirectionsButtonProps {
  station: GasStation
  variant?: 'primary' | 'compact'
}

function getDirectionsUrl(lat: number, lng: number, name: string): string {
  const encoded = encodeURIComponent(name)
  if (Capacitor.getPlatform() === 'ios') {
    return `maps://?daddr=${lat},${lng}&q=${encoded}`
  }
  // Android: geo: opens the user's preferred maps app
  return `geo:${lat},${lng}?q=${lat},${lng}(${encoded})`
}

export function DirectionsButton({ station, variant = 'primary' }: DirectionsButtonProps) {
  function handlePress() {
    const url = getDirectionsUrl(station.lat, station.lng, station.name)
    window.open(url, '_system')
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handlePress}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--accent-blue-light)',
          color: 'var(--accent-blue)',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        ↗ Directions
      </button>
    )
  }

  return (
    <button
      onClick={handlePress}
      style={{
        width: '100%',
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--accent-primary)',
        color: '#fff',
        fontSize: 16,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <span>↗</span>
      Get Directions
    </button>
  )
}
