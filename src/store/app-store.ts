import { create } from 'zustand'
import type { TabName, Theme } from '@/types/app'

interface AppStore {
  activeTab: TabName
  isInitialized: boolean
  isOnline: boolean
  theme: Theme
  setActiveTab: (tab: TabName) => void
  setInitialized: (v: boolean) => void
  setOnline: (v: boolean) => void
  setTheme: (t: Theme) => void
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: 'map',
  isInitialized: false,
  isOnline: true,
  theme: 'system',
  setActiveTab: (activeTab) => set({ activeTab }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setOnline: (isOnline) => set({ isOnline }),
  setTheme: (theme) => set({ theme }),
}))
