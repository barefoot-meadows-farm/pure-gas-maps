import { create } from 'zustand'
import type { PermissionState } from '@/types/app'

interface LocationStore {
  lat: number | null
  lng: number | null
  accuracy: number | null
  permissionState: PermissionState
  isWatching: boolean
  watchId: string | null
  setLocation: (lat: number, lng: number, accuracy: number) => void
  setPermission: (state: PermissionState) => void
  setWatching: (v: boolean) => void
  setWatchId: (id: string | null) => void
}

export const useLocationStore = create<LocationStore>((set) => ({
  lat: null,
  lng: null,
  accuracy: null,
  permissionState: 'prompt',
  isWatching: false,
  watchId: null,
  setLocation: (lat, lng, accuracy) => set({ lat, lng, accuracy }),
  setPermission: (permissionState) => set({ permissionState }),
  setWatching: (isWatching) => set({ isWatching }),
  setWatchId: (watchId) => set({ watchId }),
}))
