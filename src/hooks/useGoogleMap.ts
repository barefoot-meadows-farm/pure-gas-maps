import { useEffect, useRef, useCallback } from 'react'
import { GoogleMap } from '@capacitor/google-maps'
import { useMapStore, useLocationStore } from '@/store'
import { getStationsInBounds } from '@/services/station-service'
import { getStationById } from '@/services/station-service'
import { DEFAULT_CENTER, DEFAULT_ZOOM, MARKER_UPDATE_DEBOUNCE_MS } from '@/constants/map'
import type { BoundingBox } from '@/lib/geo'
import type { GasStation } from '@/types/station'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string

export function useGoogleMap(mapRef: React.RefObject<HTMLElement>) {
  const mapInstanceRef = useRef<GoogleMap | null>(null)
  const markerIdMapRef = useRef<Map<string, string>>(new Map()) // markerId -> stationId
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { selectStation, setMarkerIdMap } = useMapStore()
  const userLat = useLocationStore((s) => s.lat)
  const userLng = useLocationStore((s) => s.lng)

  const updateMarkersForBounds = useCallback(async (bounds: BoundingBox) => {
    const map = mapInstanceRef.current
    if (!map) return

    const stations = await getStationsInBounds(bounds)

    // Remove all existing markers
    const existingIds = Array.from(markerIdMapRef.current.keys())
    if (existingIds.length > 0) {
      await map.removeMarkers(existingIds)
    }
    markerIdMapRef.current.clear()

    if (stations.length === 0) return

    // Add new markers in batch
    const markerOptions = stations.map((s: GasStation) => ({
      coordinate: { lat: s.lat, lng: s.lng },
      title: s.name,
      snippet: `${(s.octanes ?? [s.octane]).join('/')} octane · ${s.city}`,
    }))

    const addedIds = await map.addMarkers(markerOptions)

    // Build markerId -> stationId mapping
    const newMap = new Map<string, string>()
    addedIds.forEach((markerId: string, index: number) => {
      newMap.set(markerId, stations[index].id)
    })
    markerIdMapRef.current = newMap
    setMarkerIdMap(new Map(newMap))
  }, [setMarkerIdMap])

  const scheduleMarkerUpdate = useCallback((bounds: BoundingBox) => {
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current)
    updateTimerRef.current = setTimeout(() => {
      updateMarkersForBounds(bounds)
    }, MARKER_UPDATE_DEBOUNCE_MS)
  }, [updateMarkersForBounds])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    let map: GoogleMap | null = null

    async function createMap() {
      if (!mapRef.current) return

      map = await GoogleMap.create({
        id: 'pure-gas-map',
        element: mapRef.current,
        apiKey: GOOGLE_MAPS_KEY,
        config: {
          center: { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng },
          zoom: DEFAULT_ZOOM,
        },
      })

      await map.enableClustering(3)
      await map.enableCurrentLocation(true)

      mapInstanceRef.current = map

      // Handle marker taps
      await map.setOnMarkerClickListener(async ({ markerId }) => {
        const stationId = markerIdMapRef.current.get(markerId)
        if (!stationId) return
        const station = await getStationById(stationId)
        if (station) selectStation(station)
      })

      // Handle camera movement
      await map.setOnCameraIdleListener(async () => {
        const bounds = await map!.getMapBounds()
        scheduleMarkerUpdate({
          north: bounds.northeast.lat,
          south: bounds.southwest.lat,
          east: bounds.northeast.lng,
          west: bounds.southwest.lng,
        })
      })

      // Close bottom sheet when tapping map background
      await map.setOnMapClickListener(() => {
        useMapStore.getState().setBottomSheetOpen(false)
      })

      // Initial marker load at default view
      const initialBounds: BoundingBox = {
        north: DEFAULT_CENTER.lat + 5,
        south: DEFAULT_CENTER.lat - 5,
        east: DEFAULT_CENTER.lng + 8,
        west: DEFAULT_CENTER.lng - 8,
      }
      await updateMarkersForBounds(initialBounds)
    }

    createMap()

    return () => {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current)
      map?.destroy()
    }
  }, [mapRef]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pan to user location when it becomes available
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || userLat === null || userLng === null) return

    map.setCamera({
      coordinate: { lat: userLat, lng: userLng },
      zoom: 12,
      animate: true,
    })
  }, [userLat, userLng])

  const panToLocation = useCallback(async (lat: number, lng: number, zoom = 13) => {
    await mapInstanceRef.current?.setCamera({
      coordinate: { lat, lng },
      zoom,
      animate: true,
    })
  }, [])

  return { panToLocation, mapInstance: mapInstanceRef }
}
