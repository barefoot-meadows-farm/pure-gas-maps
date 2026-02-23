import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { useAppInit } from '@/hooks/useAppInit'
import { AppShell } from '@/components/layout/AppShell'
import { InitScreen } from '@/components/screens/InitScreen'
import { MapScreen } from '@/components/screens/MapScreen'
import { ListScreen } from '@/components/screens/ListScreen'
import { SettingsScreen } from '@/components/screens/SettingsScreen'

function AppContent() {
  const activeTab = useAppStore((s) => s.activeTab)

  return (
    <AppShell>
      {/* All screens are mounted but only the active one is shown.
          MapScreen uses display:none when inactive to preserve the
          native GoogleMap instance across tab switches. */}
      <div style={{ position: 'absolute', inset: 0, display: activeTab === 'map' ? 'block' : 'none' }}>
        <MapScreen />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: activeTab === 'list' ? 'block' : 'none' }}>
        <ListScreen />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: activeTab === 'settings' ? 'block' : 'none' }}>
        <SettingsScreen />
      </div>
    </AppShell>
  )
}

export function App() {
  useAppInit()

  const isInitialized = useAppStore((s) => s.isInitialized)
  const theme = useAppStore((s) => s.theme)

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light')
    } else {
      // System: follow prefers-color-scheme
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      root.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
      const handler = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  if (!isInitialized) {
    return <InitScreen />
  }

  return <AppContent />
}
