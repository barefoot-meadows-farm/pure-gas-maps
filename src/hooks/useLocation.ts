import { useEffect, useCallback } from 'react'
import { useLocationStore } from '@/store'
import {
  checkLocationPermission,
  requestLocationPermission,
  watchLocation,
  clearWatch,
} from '@/services/location-service'

export function useLocation() {
  const { lat, lng, accuracy, permissionState, isWatching, watchId, setLocation, setPermission, setWatching, setWatchId } =
    useLocationStore()

  const startWatching = useCallback(async () => {
    if (isWatching) return

    const permission = await checkLocationPermission()
    if (permission === 'prompt') {
      const result = await requestLocationPermission()
      setPermission(result)
      if (result !== 'granted') return
    } else {
      setPermission(permission)
      if (permission !== 'granted') return
    }

    setWatching(true)
    const id = await watchLocation((loc) => {
      setLocation(loc.lat, loc.lng, loc.accuracy)
    })
    setWatchId(id)
  }, [isWatching, setLocation, setPermission, setWatching, setWatchId])

  useEffect(() => {
    startWatching()
    return () => {
      if (watchId) {
        clearWatch(watchId).catch(() => null)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { lat, lng, accuracy, permissionState, isWatching, startWatching }
}
