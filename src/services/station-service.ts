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

  // Detect "City, ST" (comma) or "City ST" (trailing 2-letter word) patterns
  // so that "Cleveland, TN" and "Cleveland TN" both work as combined queries.
  let cityPart = ''
  let statePart = ''
  const commaIdx = q.indexOf(',')
  if (commaIdx > 0) {
    cityPart = q.slice(0, commaIdx).trim()
    statePart = q.slice(commaIdx + 1).trim()
  } else {
    const spaceIdx = q.lastIndexOf(' ')
    if (spaceIdx > 0 && q.length - spaceIdx - 1 === 2) {
      cityPart = q.slice(0, spaceIdx).trim()
      statePart = q.slice(spaceIdx + 1).trim()
    }
  }

  const all = await db.getAll('stations')
  return all
    .filter((s) => {
      const city = s.city.toLowerCase()
      const state = s.state.toLowerCase()
      const name = s.name.toLowerCase()

      // Combined city+state query (e.g. "Cleveland, TN" or "Cleveland TN")
      if (cityPart && statePart) {
        return city.includes(cityPart) && state.startsWith(statePart)
      }

      // Single-term: name, city, exact state code, or zip prefix
      return (
        name.includes(q) ||
        city.includes(q) ||
        state === q ||
        (s.zip != null && s.zip.startsWith(q))
      )
    })
    .slice(0, limit)
}

export async function getStationById(id: string): Promise<GasStation | undefined> {
  const db = await getDB()
  return db.get('stations', id)
}
