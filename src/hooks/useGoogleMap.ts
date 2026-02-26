import { useEffect, useRef, useCallback } from 'react'
import { GoogleMap } from '@capacitor/google-maps'
import { Capacitor, registerPlugin } from '@capacitor/core'
import { useMapStore, useLocationStore, useAppStore } from '@/store'
import { getStationsInBounds } from '@/services/station-service'
import { getStationById } from '@/services/station-service'
import { DEFAULT_CENTER, DEFAULT_ZOOM, MARKER_UPDATE_DEBOUNCE_MS, MIN_ZOOM_FOR_MARKERS, LOCATION_ZOOM } from '@/constants/map'
import type { BoundingBox } from '@/lib/geo'
import type { FuelType, GasStation } from '@/types/station'

const GOOGLE_MAPS_KEY = Capacitor.getPlatform() === 'ios'
  ? import.meta.env.VITE_GOOGLE_MAPS_KEY_IOS as string
  : import.meta.env.VITE_GOOGLE_MAPS_KEY_WEB as string

export function useGoogleMap(mapRef: React.RefObject<HTMLElement>) {
  const mapInstanceRef = useRef<GoogleMap | null>(null)
  const markerIdMapRef = useRef<Map<string, string>>(new Map()) // markerId -> stationId
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastBoundsRef = useRef<BoundingBox | null>(null)
  const currentZoomRef = useRef<number>(DEFAULT_ZOOM)
  // Keep a ref so the async marker update always reads the latest filter value
  const gradeFilterRef = useRef<FuelType | null>(null)

  const { selectStation, setMarkerIdMap } = useMapStore()
  const userLat = useLocationStore((s) => s.lat)
  const userLng = useLocationStore((s) => s.lng)
  const gradeFilter = useAppStore((s) => s.gradeFilter)
  gradeFilterRef.current = gradeFilter

  const updateMarkersForBounds = useCallback(async (bounds: BoundingBox) => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear markers and bail if not zoomed in enough
    if (currentZoomRef.current < MIN_ZOOM_FOR_MARKERS) {
      const existingIds = Array.from(markerIdMapRef.current.keys())
      if (existingIds.length > 0) {
        await map.removeMarkers(existingIds)
        markerIdMapRef.current.clear()
        setMarkerIdMap(new Map())
      }
      return
    }

    lastBoundsRef.current = bounds
    const stations = await getStationsInBounds(bounds, undefined, gradeFilterRef.current)

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

  // Re-draw markers whenever the grade filter changes
  useEffect(() => {
    if (lastBoundsRef.current) {
      updateMarkersForBounds(lastBoundsRef.current)
    }
  }, [gradeFilter, updateMarkersForBounds])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    let map: GoogleMap | null = null

    async function createMap() {
      if (!mapRef.current) return

      // Register onMapReady BEFORE create() to avoid the race where native
      // render()'s DispatchQueue.main.async fires before the SDK's own listener
      // is set up (which only happens after create() resolves).
      let resolveReady!: () => void
      const mapReady = new Promise<void>((r) => { resolveReady = r })
      const nativePlugin = registerPlugin<any>('CapacitorGoogleMaps')
      const readyListener = await nativePlugin.addListener(
        'onMapReady',
        (data: { mapId: string }) => {
          if (data.mapId === 'pure-gas-map') resolveReady()
        },
      )

      map = await GoogleMap.create({
        id: 'pure-gas-map',
        element: mapRef.current,
        apiKey: GOOGLE_MAPS_KEY,
        config: {
          center: { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng },
          zoom: DEFAULT_ZOOM,
        },
      })

      await mapReady
      readyListener.remove()

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

      // Handle camera movement — capture zoom so marker loading can be gated
      await map.setOnCameraIdleListener(async ({ zoom }) => {
        currentZoomRef.current = zoom
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

      // Markers load automatically once the user zooms in past MIN_ZOOM_FOR_MARKERS
      // via the camera idle listener above — no initial load needed.
    }

    createMap()

    return () => {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current)
      map?.destroy()
    }
  }, [mapRef]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pan to user location on first fix only — don't chase every GPS accuracy update
  const hasPannedToLocationRef = useRef(false)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || userLat === null || userLng === null) return
    if (hasPannedToLocationRef.current) return

    hasPannedToLocationRef.current = true
    map.setCamera({
      coordinate: { lat: userLat, lng: userLng },
      zoom: LOCATION_ZOOM,
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
