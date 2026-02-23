import { kmToMiles } from './geo'

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

export function formatDistance(km: number): string {
  const miles = kmToMiles(km)
  if (miles < 0.1) return '< 0.1 mi'
  if (miles < 10) return `${miles.toFixed(1)} mi`
  return `${Math.round(miles)} mi`
}

export function formatOctane(octane: number): string {
  if (octane >= 91) return `${octane} Premium`
  if (octane >= 89) return `${octane} Mid`
  return `${octane} Regular`
}

export function formatAddress(address: string, city: string, state: string, zip: string): string {
  const parts = [address, city, state && zip ? `${state} ${zip}` : state || zip].filter(Boolean)
  return parts.join(', ')
}
