import { useCacheStore, useAppStore } from '@/store'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SafeArea } from '@/components/layout/SafeArea'
import { syncAllStations, retryFailedRegions } from '@/services/data-sync'
import type { Theme } from '@/types/app'

function formatDate(ts: number | null): string {
  if (!ts) return 'Never'
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SettingRow({
  label,
  sublabel,
  action,
}: {
  label: string
  sublabel?: string
  action?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div>
        <p style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</p>
        {sublabel && (
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{sublabel}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function SettingsScreen() {
  const { isSyncing, syncProgress, lastSyncAt, failedRegions, setIsSyncing, setSyncProgress, setFailedRegions, setLastSyncAt } =
    useCacheStore()
  const { theme, setTheme } = useAppStore()

  async function handleRefresh() {
    if (isSyncing) return
    setIsSyncing(true)
    await syncAllStations((p) => {
      setSyncProgress(p)
      if (p.completed === p.total) {
        setFailedRegions(p.failed)
        setLastSyncAt(Date.now())
      }
    })
    setIsSyncing(false)
  }

  async function handleRetryFailed() {
    if (isSyncing || failedRegions.length === 0) return
    setIsSyncing(true)
    await retryFailedRegions(failedRegions, (p) => {
      setSyncProgress(p)
    })
    setFailedRegions([])
    setIsSyncing(false)
  }

  const themes: { value: Theme; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SafeArea style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px 16px 12px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h1>
        </div>
      </SafeArea>

      <div className="scroll-area" style={{ flex: 1 }}>
        {/* Sync status */}
        {isSyncing && syncProgress && (
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-primary)',
              marginBottom: 8,
            }}
          >
            <ProgressBar
              value={syncProgress.completed / syncProgress.total}
              label={syncProgress.currentRegion ?? `Updating… ${syncProgress.completed}%`}
            />
          </div>
        )}

        {/* Data section */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            margin: '12px 16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ padding: '12px 16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, paddingBottom: 10 }}>
              Station Data
            </p>
          </div>

          <SettingRow
            label="Last Updated"
            sublabel={formatDate(lastSyncAt)}
          />

          {failedRegions.length > 0 && (
            <SettingRow
              label={`${failedRegions.length} regions unavailable`}
              sublabel="Some states/provinces couldn't be loaded"
              action={
                <button
                  onClick={handleRetryFailed}
                  disabled={isSyncing}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--warning)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    opacity: isSyncing ? 0.6 : 1,
                  }}
                >
                  Retry
                </button>
              }
            />
          )}

          <div style={{ padding: '12px 16px' }}>
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSyncing ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                color: isSyncing ? 'var(--text-tertiary)' : '#fff',
                fontSize: 15,
                fontWeight: 600,
                transition: 'background-color var(--transition-fast)',
              }}
            >
              {isSyncing ? 'Updating…' : 'Refresh All Station Data'}
            </button>
          </div>
        </div>

        {/* Appearance section */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            margin: '0 16px 12px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ padding: '12px 16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, paddingBottom: 10 }}>
              Appearance
            </p>
          </div>

          <div style={{ padding: '12px 16px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>Theme</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: theme === t.value ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: theme === t.value ? '#fff' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* About section */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            margin: '0 16px 12px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ padding: '12px 16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, paddingBottom: 10 }}>
              About
            </p>
          </div>

          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Station data provided by{' '}
              <a
                href="https://www.pure-gas.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
              >
                pure-gas.org
              </a>
              , a community-maintained database of ethanol-free gas stations in the US and Canada.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 10 }}>
              Data is licensed under{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-primary)' }}
              >
                Creative Commons Attribution 4.0
              </a>
              .
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', padding: '0 16px 24px' }}>
          Pure Gas Maps v0.1.0
        </p>
      </div>
    </div>
  )
}
