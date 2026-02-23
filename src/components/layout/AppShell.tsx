import type { ReactNode } from 'react'
import { TabBar } from './TabBar'
import { useNetwork } from '@/hooks/useNetwork'
import { OfflineBanner } from '@/components/ui/OfflineBanner'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { isOnline } = useNetwork()

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
    >
      {!isOnline && <OfflineBanner />}

      <main
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: 'var(--tab-bar-total)',
        }}
      >
        {children}
      </main>

      <TabBar />
    </div>
  )
}
