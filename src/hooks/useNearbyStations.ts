import { useState, useEffect, useRef } from 'react'
import { useLocationStore, useAppStore } from '@/store'
import { getNearbyStations } from '@/services/station-service'
import { NEARBY_RADIUS_KM } from '@/constants/map'
import type { GasStationWithDistance, FuelType } from '@/types/station'

export function useNearbyStations(limit = 50) {
  const lat = useLocationStore((s) => s.lat)
  const lng = useLocationStore((s) => s.lng)
  const gradeFilter = useAppStore((s) => s.gradeFilter)

  const [stations, setStations] = useState<GasStationWithDistance[]>([])
  const [loading, setLoading] = useState(false)

  // Track previous fetch state; re-fetch if location moved OR filter changed
  const prevRef = useRef<{ lat: number; lng: number; gradeFilter: FuelType | null } | null>(null)

  useEffect(() => {
    if (lat === null || lng === null) return

    // Only skip if location hasn't moved AND the filter is unchanged
    const prev = prevRef.current
    if (prev) {
      const distMoved = Math.hypot(lat - prev.lat, lng - prev.lng) * 111
      if (distMoved < 0.5 && prev.gradeFilter === gradeFilter) return
    }
    prevRef.current = { lat, lng, gradeFilter }

    let cancelled = false
    setLoading(true)

    getNearbyStations(lat, lng, NEARBY_RADIUS_KM, limit, gradeFilter)
      .then((results) => {
        if (!cancelled) setStations(results)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [lat, lng, limit, gradeFilter])

  return { stations, loading }
}
