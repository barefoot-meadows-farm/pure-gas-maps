import { create } from 'zustand'
import type { GasStation } from '@/types/station'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/constants/map'

interface MapViewport {
  lat: number
  lng: number
  zoom: number
}

interface MapStore {
  viewport: MapViewport
  selectedStation: GasStation | null
  isBottomSheetOpen: boolean
  bottomSheetSnapIndex: 0 | 1
  markerIdMap: Map<string, string> // markerId -> stationId
  setViewport: (v: MapViewport) => void
  selectStation: (s: GasStation | null) => void
  setBottomSheetOpen: (open: boolean) => void
  setBottomSheetSnap: (index: 0 | 1) => void
  setMarkerIdMap: (map: Map<string, string>) => void
}

export const useMapStore = create<MapStore>((set) => ({
  viewport: {
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    zoom: DEFAULT_ZOOM,
  },
  selectedStation: null,
  isBottomSheetOpen: false,
  bottomSheetSnapIndex: 0,
  markerIdMap: new Map(),
  setViewport: (viewport) => set({ viewport }),
  selectStation: (selectedStation) =>
    set({
      selectedStation,
      isBottomSheetOpen: selectedStation !== null,
      bottomSheetSnapIndex: 0,
    }),
  setBottomSheetOpen: (isBottomSheetOpen) =>
    set({
      isBottomSheetOpen,
      ...(isBottomSheetOpen === false && { selectedStation: null }),
    }),
  setBottomSheetSnap: (bottomSheetSnapIndex) => set({ bottomSheetSnapIndex }),
  setMarkerIdMap: (markerIdMap) => set({ markerIdMap }),
}))
