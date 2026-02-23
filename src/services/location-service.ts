import { Geolocation } from '@capacitor/geolocation'
import type { PermissionState } from '@/types/app'

export interface LocationResult {
  lat: number
  lng: number
  accuracy: number
}

export async function checkLocationPermission(): Promise<PermissionState> {
  try {
    const status = await Geolocation.checkPermissions()
    const state = status.location
    if (state === 'granted') return 'granted'
    if (state === 'denied') return 'denied'
    return 'prompt'
  } catch {
    return 'unavailable'
  }
}

export async function requestLocationPermission(): Promise<PermissionState> {
  try {
    const status = await Geolocation.requestPermissions()
    const state = status.location
    if (state === 'granted') return 'granted'
    if (state === 'denied') return 'denied'
    return 'prompt'
  } catch {
    return 'unavailable'
  }
}

export async function getCurrentLocation(): Promise<LocationResult | null> {
  try {
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    }
  } catch {
    return null
  }
}

export async function watchLocation(
  callback: (loc: LocationResult) => void,
): Promise<string> {
  return Geolocation.watchPosition(
    { enableHighAccuracy: true },
    (pos) => {
      if (pos) {
        callback({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      }
    },
  )
}

export async function clearWatch(watchId: string): Promise<void> {
  await Geolocation.clearWatch({ id: watchId })
}
