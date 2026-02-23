import { Preferences } from '@capacitor/preferences'
import { getDB } from '@/lib/db'
import { getKmzUrl } from '@/constants/regions'
import { CACHE_TTL_MS, LAST_SYNC_KEY } from '@/constants/cache'
import type { SyncProgress } from '@/types/app'
import type { WorkerResponse } from '@/workers/kml-parser.worker'

export type ProgressCallback = (progress: SyncProgress) => void

export async function isCacheStale(): Promise<boolean> {
  const { value } = await Preferences.get({ key: LAST_SYNC_KEY })
  if (!value) return true
  return Date.now() - parseInt(value, 10) > CACHE_TTL_MS
}

export async function syncAllStations(
  onProgress: ProgressCallback,
  signal?: AbortSignal,
): Promise<void> {
  const url = getKmzUrl()

  const worker = new Worker(
    new URL('../workers/kml-parser.worker.ts', import.meta.url),
    { type: 'module' },
  )

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      worker.terminate()
      reject(new Error('Aborted'))
      return
    }

    signal?.addEventListener('abort', () => {
      worker.terminate()
      reject(new Error('Aborted'))
    })

    worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data

      if (msg.type === 'progress') {
        // Map worker pct (0–1) to the first 85% of overall progress
        const completed = Math.round(msg.pct * 85)
        onProgress({
          total: 100,
          completed,
          failed: [],
          currentRegion: msg.phase,
        })
        return
      }

      if (msg.type === 'error') {
        worker.terminate()
        onProgress({ total: 100, completed: 100, failed: ['kmz'], currentRegion: null })
        reject(new Error(msg.error))
        return
      }

      if (msg.type === 'result') {
        worker.terminate()

        if (signal?.aborted) {
          reject(new Error('Aborted'))
          return
        }

        onProgress({ total: 100, completed: 90, failed: [], currentRegion: 'Saving to database…' })

        try {
          const db = await getDB()

          // Clear existing data and re-insert everything in one transaction.
          // All requests are fired synchronously (no intermediate awaits) to
          // prevent the transaction auto-committing between IDB operations.
          const tx = db.transaction(['stations', 'cache_meta'], 'readwrite')
          const stationsStore = tx.objectStore('stations')
          const metaStore = tx.objectStore('cache_meta')

          stationsStore.clear()
          metaStore.clear()
          msg.stations.forEach((s) => stationsStore.put(s))
          metaStore.put({
            regionCode: 'ALL',
            fetchedAt: Date.now(),
            stationCount: msg.stations.length,
            version: 1,
          })

          await tx.done

          await Preferences.set({ key: LAST_SYNC_KEY, value: Date.now().toString() })
        } catch (err) {
          reject(err)
          return
        }

        onProgress({ total: 100, completed: 100, failed: [], currentRegion: null })
        resolve()
      }
    }

    worker.onerror = (err) => {
      worker.terminate()
      onProgress({ total: 100, completed: 100, failed: ['kmz'], currentRegion: null })
      reject(err)
    }

    worker.postMessage({ url })
  })
}

/** With a single KMZ source there are no per-region failures — just re-run the full sync. */
export async function retryFailedRegions(
  _failed: string[],
  onProgress: ProgressCallback,
): Promise<void> {
  return syncAllStations(onProgress)
}
