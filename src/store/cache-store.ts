import { create } from 'zustand'
import type { SyncProgress } from '@/types/app'

interface CacheStore {
  isSyncing: boolean
  syncProgress: SyncProgress | null
  lastSyncAt: number | null
  hasData: boolean
  failedRegions: string[]
  setIsSyncing: (v: boolean) => void
  setSyncProgress: (p: SyncProgress) => void
  setLastSyncAt: (ts: number) => void
  setHasData: (v: boolean) => void
  setFailedRegions: (regions: string[]) => void
}

export const useCacheStore = create<CacheStore>((set) => ({
  isSyncing: false,
  syncProgress: null,
  lastSyncAt: null,
  hasData: false,
  failedRegions: [],
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setSyncProgress: (syncProgress) => set({ syncProgress }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  setHasData: (hasData) => set({ hasData }),
  setFailedRegions: (failedRegions) => set({ failedRegions }),
}))
