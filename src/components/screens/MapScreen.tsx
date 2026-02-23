import { useRef } from 'react'
import { useGoogleMap } from '@/hooks/useGoogleMap'
import { useLocation } from '@/hooks/useLocation'
import { useStationSearch } from '@/hooks/useStationSearch'
import { useMapStore, useAppStore } from '@/store'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import { StationBottomSheet } from '@/components/station/StationBottomSheet'
import { SafeArea } from '@/components/layout/SafeArea'
import type { GasStation } from '@/types/station'

export function MapScreen() {
  const mapRef = useRef<HTMLElement>(null)
  const { panToLocation } = useGoogleMap(mapRef)
  const { lat, lng, permissionState, startWatching } = useLocation()

  const { query, setQuery, results, loading, clearSearch } = useStationSearch()
  const selectStation = useMapStore((s) => s.selectStation)
  const isMapActive = useAppStore((s) => s.activeTab === 'map')

  function handleSelectResult(station: GasStation) {
    clearSearch()
    selectStation(station)
    panToLocation(station.lat, station.lng, 14)
  }

  function handleNearMe() {
    if (permissionState !== 'granted') {
      startWatching()
      return
    }
    if (lat !== null && lng !== null) {
      panToLocation(lat, lng, 13)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        // Transparent so native map beneath WebView is visible
        background: 'transparent',
        display: isMapActive ? 'block' : 'none',
      }}
    >
      {/* Native map element — @capacitor/google-maps attaches here */}
      <capacitor-google-maps
        ref={mapRef as React.RefObject<HTMLElement>}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {/* HTML overlay layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'transparent',
        }}
      >
        {/* Search bar — top of screen */}
        <SafeArea>
          <div
            style={{
              padding: '8px 16px',
              position: 'relative',
              pointerEvents: 'all',
            }}
          >
            <SearchBar
              value={query}
              onChange={setQuery}
              onClear={clearSearch}
              loading={loading}
              floating
            />
            {results.length > 0 && (
              <SearchResults results={results} onSelect={handleSelectResult} />
            )}
          </div>
        </SafeArea>

        {/* Near Me FAB — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 16,
            pointerEvents: 'all',
          }}
        >
          <button
            onClick={handleNearMe}
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-card)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)',
              fontSize: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pop-in 300ms ease',
            }}
            aria-label="Center on my location"
          >
            📍
          </button>
        </div>
      </div>

      {/* Bottom sheet — sits above overlay */}
      <StationBottomSheet />
    </div>
  )
}
