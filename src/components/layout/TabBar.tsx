import { useAppStore, useCacheStore } from '@/store'
import type { TabName } from '@/types/app'

interface Tab {
  id: TabName
  label: string
  icon: string
  activeIcon: string
}

const TABS: Tab[] = [
  { id: 'map', label: 'Map', icon: '◎', activeIcon: '◉' },
  { id: 'list', label: 'Nearby', icon: '☰', activeIcon: '☰' },
  { id: 'settings', label: 'Settings', icon: '⚙', activeIcon: '⚙' },
]

export function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const isSyncing = useCacheStore((s) => s.isSyncing)

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--tab-bar-total)',
        paddingBottom: 'var(--safe-bottom)',
        backgroundColor: 'var(--bg-overlay)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        zIndex: 100,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'var(--tab-bar-height)',
              gap: 3,
              color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              transition: 'color var(--transition-fast)',
              position: 'relative',
            }}
            aria-label={tab.label}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>
              {isActive ? tab.activeIcon : tab.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: 0.3 }}>
              {tab.label}
            </span>
            {tab.id === 'settings' && isSyncing && (
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: '28%',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
