import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { DB_NAME, DB_VERSION } from '@/constants/cache'
import type { GasStation } from '@/types/station'

interface CacheMeta {
  regionCode: string
  fetchedAt: number
  stationCount: number
  version: number
}

interface PureGasDB extends DBSchema {
  stations: {
    key: string
    value: GasStation
    indexes: {
      'by-region': string
      'by-state': string
      'by-lat': number
    }
  }
  cache_meta: {
    key: string
    value: CacheMeta
  }
}

let dbInstance: IDBPDatabase<PureGasDB> | null = null

export async function getDB(): Promise<IDBPDatabase<PureGasDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<PureGasDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const stationStore = db.createObjectStore('stations', { keyPath: 'id' })
        stationStore.createIndex('by-region', 'regionCode')
        stationStore.createIndex('by-state', 'state')
        stationStore.createIndex('by-lat', 'lat')
        db.createObjectStore('cache_meta', { keyPath: 'regionCode' })
      }
      if (oldVersion >= 1 && oldVersion < 2) {
        // v2: wipe stale data so the new parser re-syncs with correct state/octane fields
        db.deleteObjectStore('stations')
        db.deleteObjectStore('cache_meta')
        const stationStore = db.createObjectStore('stations', { keyPath: 'id' })
        stationStore.createIndex('by-region', 'regionCode')
        stationStore.createIndex('by-state', 'state')
        stationStore.createIndex('by-lat', 'lat')
        db.createObjectStore('cache_meta', { keyPath: 'regionCode' })
      }
      if (oldVersion >= 2 && oldVersion < 3) {
        // v3: re-sync to fix octane values incorrectly parsed from brand names (e.g. PHILLIPS 66 → 66)
        db.deleteObjectStore('stations')
        db.deleteObjectStore('cache_meta')
        const stationStore = db.createObjectStore('stations', { keyPath: 'id' })
        stationStore.createIndex('by-region', 'regionCode')
        stationStore.createIndex('by-state', 'state')
        stationStore.createIndex('by-lat', 'lat')
        db.createObjectStore('cache_meta', { keyPath: 'regionCode' })
      }
      if (oldVersion >= 3 && oldVersion < 4) {
        // v4: re-sync to add octanes[] array field for multi-grade stations (e.g. "87 93")
        db.deleteObjectStore('stations')
        db.deleteObjectStore('cache_meta')
        const stationStore = db.createObjectStore('stations', { keyPath: 'id' })
        stationStore.createIndex('by-region', 'regionCode')
        stationStore.createIndex('by-state', 'state')
        stationStore.createIndex('by-lat', 'lat')
        db.createObjectStore('cache_meta', { keyPath: 'regionCode' })
      }
    },
  })
  return dbInstance
}

export async function getRegionCount(): Promise<number> {
  const db = await getDB()
  return db.count('cache_meta')
}

export async function getTotalStationCount(): Promise<number> {
  const db = await getDB()
  return db.count('stations')
}
