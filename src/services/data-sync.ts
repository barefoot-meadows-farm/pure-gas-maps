import { Preferences } from '@capacitor/preferences'
import { getDB } from '@/lib/db'
import { ALL_REGIONS, getKmlUrl } from '@/constants/regions'
import { CACHE_TTL_MS, LAST_SYNC_KEY, SYNC_CONCURRENCY } from '@/constants/cache'
import type { SyncProgress } from '@/types/app'
import type { WorkerRequest, WorkerResponse } from '@/workers/kml-parser.worker'

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
  const db = await getDB()
  const progress: SyncProgress = {
    total: ALL_REGIONS.length,
    completed: 0,
    failed: [],
    currentRegion: null,
  }

  for (let i = 0; i < ALL_REGIONS.length; i += SYNC_CONCURRENCY) {
    if (signal?.aborted) break

    const batch = ALL_REGIONS.slice(i, i + SYNC_CONCURRENCY)

    await Promise.all(
      batch.map(
        (regionCode) =>
          new Promise<void>((resolve) => {
            if (signal?.aborted) {
              resolve()
              return
            }

            const worker = new Worker(
              new URL('../workers/kml-parser.worker.ts', import.meta.url),
              { type: 'module' },
            )

            progress.currentRegion = regionCode
            onProgress({ ...progress })

            const url = getKmlUrl(regionCode)
            worker.postMessage({ regionCode, url } satisfies WorkerRequest)

            worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
              const { stations, error } = event.data
              worker.terminate()

              if (error || !stations) {
                progress.failed.push(regionCode)
              } else if (stations.length > 0) {
                try {
                  const tx = db.transaction('stations', 'readwrite')
                  // Remove stale data for this region
                  const existingKeys = await tx.store
                    .index('by-region')
                    .getAllKeys(regionCode)
                  await Promise.all(existingKeys.map((key) => tx.store.delete(key)))
                  // Insert new stations
                  await Promise.all(stations.map((s) => tx.store.put(s)))
                  await tx.done

                  await db.put('cache_meta', {
                    regionCode,
                    fetchedAt: Date.now(),
                    stationCount: stations.length,
                    version: 1,
                  })
                } catch {
                  progress.failed.push(regionCode)
                }
              }

              progress.completed++
              onProgress({ ...progress })
              resolve()
            }

            worker.onerror = () => {
              worker.terminate()
              progress.failed.push(regionCode)
              progress.completed++
              onProgress({ ...progress })
              resolve()
            }
          }),
      ),
    )
  }

  if (!signal?.aborted) {
    await Preferences.set({
      key: LAST_SYNC_KEY,
      value: Date.now().toString(),
    })
  }
}

export async function retryFailedRegions(
  failed: string[],
  onProgress: ProgressCallback,
): Promise<void> {
  const db = await getDB()
  const progress: SyncProgress = {
    total: failed.length,
    completed: 0,
    failed: [],
    currentRegion: null,
  }

  for (let i = 0; i < failed.length; i += SYNC_CONCURRENCY) {
    const batch = failed.slice(i, i + SYNC_CONCURRENCY)

    await Promise.all(
      batch.map(
        (regionCode) =>
          new Promise<void>((resolve) => {
            const worker = new Worker(
              new URL('../workers/kml-parser.worker.ts', import.meta.url),
              { type: 'module' },
            )

            progress.currentRegion = regionCode
            onProgress({ ...progress })

            const url = getKmlUrl(regionCode)
            worker.postMessage({ regionCode, url } satisfies WorkerRequest)

            worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
              const { stations, error } = event.data
              worker.terminate()

              if (!error && stations && stations.length > 0) {
                try {
                  const tx = db.transaction('stations', 'readwrite')
                  const existingKeys = await tx.store
                    .index('by-region')
                    .getAllKeys(regionCode)
                  await Promise.all(existingKeys.map((key) => tx.store.delete(key)))
                  await Promise.all(stations.map((s) => tx.store.put(s)))
                  await tx.done

                  await db.put('cache_meta', {
                    regionCode,
                    fetchedAt: Date.now(),
                    stationCount: stations.length,
                    version: 1,
                  })
                } catch {
                  progress.failed.push(regionCode)
                }
              } else {
                progress.failed.push(regionCode)
              }

              progress.completed++
              onProgress({ ...progress })
              resolve()
            }

            worker.onerror = () => {
              worker.terminate()
              progress.failed.push(regionCode)
              progress.completed++
              onProgress({ ...progress })
              resolve()
            }
          }),
      ),
    )
  }
}
