import { useEffect, useRef } from 'react'
import { Network } from '@capacitor/network'
import { Preferences } from '@capacitor/preferences'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useAppStore, useCacheStore } from '@/store'
import { getRegionCount } from '@/lib/db'
import { isCacheStale, syncAllStations } from '@/services/data-sync'
import { LAST_SYNC_KEY } from '@/constants/cache'

export function useAppInit() {
  const setInitialized = useAppStore((s) => s.setInitialized)
  const setOnline = useAppStore((s) => s.setOnline)
  const { setIsSyncing, setSyncProgress, setHasData, setLastSyncAt, setFailedRegions } =
    useCacheStore()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let networkListener: (() => void) | null = null

    async function init() {
      // Step 1: Status bar
      try {
        await StatusBar.setStyle({ style: Style.Dark })
        await StatusBar.setBackgroundColor({ color: '#0f172a' })
      } catch {
        // Not available in browser — ignore
      }

      // Step 2: Network
      try {
        const { connected } = await Network.getStatus()
        setOnline(connected)
        const listener = await Network.addListener('networkStatusChange', ({ connected }) => {
          setOnline(connected)
        })
        networkListener = () => listener.remove()
      } catch {
        // Browser env — assume online
        setOnline(true)
      }

      // Step 3: Check existing cache
      const regionCount = await getRegionCount()
      const hasData = regionCount > 0
      setHasData(hasData)

      const { value: lastSyncValue } = await Preferences.get({ key: LAST_SYNC_KEY })
      if (lastSyncValue) setLastSyncAt(parseInt(lastSyncValue, 10))

      const stale = await isCacheStale()

      if (!hasData) {
        // First launch: show InitScreen and download everything
        try {
          await SplashScreen.hide({ fadeOutDuration: 300 })
        } catch {
          // Browser env
        }

        abortRef.current = new AbortController()
        setIsSyncing(true)

        await syncAllStations((progress) => {
          setSyncProgress(progress)
          if (progress.completed === progress.total) {
            setFailedRegions(progress.failed)
          }
        }, abortRef.current.signal)

        setIsSyncing(false)
        setHasData(true)
        setInitialized(true)
      } else {
        // Has data: show app immediately
        setInitialized(true)
        try {
          await SplashScreen.hide({ fadeOutDuration: 300 })
        } catch {
          // Browser env
        }

        if (stale) {
          // Background refresh
          abortRef.current = new AbortController()
          setIsSyncing(true)

          syncAllStations((progress) => {
            setSyncProgress(progress)
            if (progress.completed === progress.total) {
              setFailedRegions(progress.failed)
              setLastSyncAt(Date.now())
            }
          }, abortRef.current.signal).finally(() => {
            setIsSyncing(false)
          })
        }
      }
    }

    init()

    return () => {
      abortRef.current?.abort()
      networkListener?.()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
