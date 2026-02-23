export type FuelType = 'E0' | 'E0-Premium' | 'E0-Super' | 'E0-Midgrade' | 'Unknown'

export interface GasStation {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  fuelType: FuelType
  octane: number
  lat: number
  lng: number
  regionCode: string
}

export type GasStationWithDistance = GasStation & { distanceKm: number }
