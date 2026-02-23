import { create } from 'zustand'
import type { TabName, Theme } from '@/types/app'
import type { FuelType } from '@/types/station'

interface AppStore {
  activeTab: TabName
  isInitialized: boolean
  isOnline: boolean
  theme: Theme
  gradeFilter: FuelType | null
  setActiveTab: (tab: TabName) => void
  setInitialized: (v: boolean) => void
  setOnline: (v: boolean) => void
  setTheme: (t: Theme) => void
  setGradeFilter: (filter: FuelType | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: 'map',
  isInitialized: false,
  isOnline: true,
  theme: 'system',
  gradeFilter: null,
  setActiveTab: (activeTab) => set({ activeTab }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setOnline: (isOnline) => set({ isOnline }),
  setTheme: (theme) => set({ theme }),
  setGradeFilter: (gradeFilter) => set({ gradeFilter }),
}))
