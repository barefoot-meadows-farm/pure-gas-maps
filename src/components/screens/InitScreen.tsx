import { useCacheStore } from '@/store'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SafeArea } from '@/components/layout/SafeArea'

export function InitScreen() {
  const syncProgress = useCacheStore((s) => s.syncProgress)

  const progress = syncProgress
    ? syncProgress.completed / syncProgress.total
    : 0

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SafeArea style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 40px' }}>
        {/* Logo area */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            marginBottom: 32,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          ⛽
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Pure Gas
        </h1>

        <p
          style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: 48,
            lineHeight: 1.5,
          }}
        >
          Finding ethanol-free stations near you
        </p>

        {/* Progress */}
        <div style={{ width: '100%' }}>
          <ProgressBar
            value={progress}
            label={
              syncProgress
                ? `Loading stations… ${syncProgress.completed} of ${syncProgress.total}`
                : 'Preparing…'
            }
          />

          {syncProgress?.currentRegion && (
            <p
              style={{
                marginTop: 8,
                textAlign: 'center',
                fontSize: 12,
                color: 'var(--text-tertiary)',
              }}
            >
              {syncProgress.currentRegion}
            </p>
          )}
        </div>

        <p
          style={{
            marginTop: 48,
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            lineHeight: 1.5,
          }}
        >
          Downloading station data for all 50 states.{'\n'}
          This only happens once.
        </p>
      </SafeArea>
    </div>
  )
}
