const EARTH_RADIUS_KM = 6371

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function kmToMiles(km: number): number {
  return km * 0.621371
}

export interface BoundingBox {
  north: number
  south: number
  east: number
  west: number
}

export function radiusToBounds(lat: number, lng: number, radiusKm: number): BoundingBox {
  const latDelta = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI)
  const lngDelta = latDelta / Math.cos((lat * Math.PI) / 180)
  return {
    north: lat + latDelta,
    south: lat - latDelta,
    east: lng + lngDelta,
    west: lng - lngDelta,
  }
}
