export type TabName = 'map' | 'list' | 'settings'

export type Theme = 'light' | 'dark' | 'system'

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unavailable'

export interface BottomSheetState {
  isOpen: boolean
  snapIndex: 0 | 1
}

export interface SyncProgress {
  total: number
  completed: number
  failed: string[]
  currentRegion: string | null
}
