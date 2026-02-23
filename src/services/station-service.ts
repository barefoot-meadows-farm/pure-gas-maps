import { getDB } from '@/lib/db'
import { haversineDistance } from '@/lib/geo'
import type { GasStation, GasStationWithDistance } from '@/types/station'
import type { BoundingBox } from '@/lib/geo'
import { VIEWPORT_MAX_STATIONS } from '@/constants/map'

export async function getStationsInBounds(
  bounds: BoundingBox,
  limit = VIEWPORT_MAX_STATIONS,
): Promise<GasStation[]> {
  const db = await getDB()
  const range = IDBKeyRange.bound(bounds.south, bounds.north)
  const candidates = await db.getAllFromIndex('stations', 'by-lat', range)
  return candidates
    .filter((s) => s.lng >= bounds.west && s.lng <= bounds.east)
    .slice(0, limit)
}

export async function getNearbyStations(
  lat: number,
  lng: number,
  radiusKm: number,
  limit = 100,
): Promise<GasStationWithDistance[]> {
  const delta = radiusKm / 111
  const bounds: BoundingBox = {
    north: lat + delta,
    south: lat - delta,
    east: lng + delta * 1.5,
    west: lng - delta * 1.5,
  }

  const candidates = await getStationsInBounds(bounds, 2000)

  return candidates
    .map((s) => ({
      ...s,
      distanceKm: haversineDistance(lat, lng, s.lat, s.lng),
    }))
    .filter((s) => s.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}

export async function searchStations(
  query: string,
  limit = 30,
): Promise<GasStation[]> {
  const db = await getDB()
  const q = query.toLowerCase().trim()
  if (!q || q.length < 2) return []

  const all = await db.getAll('stations')
  return all
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase() === q ||
        (s.zip && s.zip.startsWith(q)),
    )
    .slice(0, limit)
}

export async function getStationById(id: string): Promise<GasStation | undefined> {
  const db = await getDB()
  return db.get('stations', id)
}
