import { useNearbyStations } from '@/hooks/useNearbyStations'
import { useStationSearch } from '@/hooks/useStationSearch'
import { useLocationStore } from '@/store'
import { StationCard } from '@/components/station/StationCard'
import { SearchBar } from '@/components/search/SearchBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SafeArea } from '@/components/layout/SafeArea'
import type { GasStationWithDistance } from '@/types/station'

export function ListScreen() {
  const { stations: nearbyStations, loading: nearbyLoading } = useNearbyStations()
  const { query, setQuery, results: searchResults, loading: searchLoading, clearSearch } =
    useStationSearch()
  const permissionState = useLocationStore((s) => s.permissionState)

  const isSearching = query.trim().length >= 2
  const displayStations: GasStationWithDistance[] = isSearching
    ? searchResults.map((s) => ({ ...s, distanceKm: 0 }))
    : nearbyStations

  const loading = isSearching ? searchLoading : nearbyLoading

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <SafeArea style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ padding: '12px 16px 12px' }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 10,
            }}
          >
            {isSearching ? 'Search Results' : 'Nearby Stations'}
          </h1>
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={clearSearch}
            loading={searchLoading}
          />
        </div>
      </SafeArea>

      {/* Content */}
      <div
        className="scroll-area"
        style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <LoadingSpinner size={32} />
          </div>
        )}

        {!loading && permissionState === 'denied' && !isSearching && (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <p style={{ fontSize: 32, marginBottom: 12 }}>📍</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              Location access needed
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Enable location in Settings to find stations near you. Or use search above.
            </p>
          </div>
        )}

        {!loading && displayStations.length === 0 && (isSearching || permissionState === 'granted') && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
              {isSearching ? 'No stations found' : 'No stations nearby'}
            </p>
          </div>
        )}

        {displayStations.map((station) => (
          <StationCard key={station.id} station={station} />
        ))}

        {/* Bottom padding for scroll */}
        <div style={{ height: 8 }} />
      </div>
    </div>
  )
}
