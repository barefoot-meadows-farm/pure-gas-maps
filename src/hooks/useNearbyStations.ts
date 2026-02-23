import { useState, useEffect, useRef } from 'react'
import { useLocationStore } from '@/store'
import { getNearbyStations } from '@/services/station-service'
import { NEARBY_RADIUS_KM } from '@/constants/map'
import type { GasStationWithDistance } from '@/types/station'

export function useNearbyStations(limit = 50) {
  const lat = useLocationStore((s) => s.lat)
  const lng = useLocationStore((s) => s.lng)
  const [stations, setStations] = useState<GasStationWithDistance[]>([])
  const [loading, setLoading] = useState(false)
  const prevCoords = useRef<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (lat === null || lng === null) return

    // Only refetch if moved more than ~0.5km
    const prev = prevCoords.current
    if (prev) {
      const distMoved = Math.hypot(lat - prev.lat, lng - prev.lng) * 111
      if (distMoved < 0.5) return
    }
    prevCoords.current = { lat, lng }

    let cancelled = false
    setLoading(true)

    getNearbyStations(lat, lng, NEARBY_RADIUS_KM, limit)
      .then((results) => {
        if (!cancelled) setStations(results)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [lat, lng, limit])

  return { stations, loading }
}
