import type { GasStation, FuelType } from '@/types/station'

function normalizeFuelType(raw: string): FuelType {
  const lower = raw.toLowerCase()
  if (lower.includes('premium') || lower.includes('super')) return 'E0-Premium'
  if (lower.includes('mid') || lower.includes('plus')) return 'E0-Midgrade'
  if (lower.startsWith('e0') || lower === 'ethanol-free' || lower === '') return 'E0'
  return 'E0'
}

/**
 * Parse a pure-gas.org KML XML string into GasStation objects.
 *
 * The KML format from pure-gas.org uses standard <Placemark> elements.
 * Station data is embedded in the <description> as HTML containing
 * address, phone, and fuel type lines. Coordinates come from <Point>.
 */
export function parseKML(xmlString: string, regionCode: string): GasStation[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) return []

  const placemarks = doc.querySelectorAll('Placemark')
  const stations: GasStation[] = []

  placemarks.forEach((pm) => {
    try {
      const name = pm.querySelector('name')?.textContent?.trim() ?? ''
      const coordText = pm.querySelector('coordinates')?.textContent?.trim() ?? ''
      const parts = coordText.split(',')
      if (parts.length < 2) return

      const lng = parseFloat(parts[0])
      const lat = parseFloat(parts[1])
      if (isNaN(lat) || isNaN(lng)) return

      // Description contains HTML with address, phone, fuel info
      const descRaw = pm.querySelector('description')?.textContent ?? ''

      // Strip HTML tags to get plain text lines
      const stripped = descRaw.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&')
      const lines = stripped.split('\n').map((l) => l.trim()).filter(Boolean)

      let address = ''
      let city = ''
      let state = regionCode
      let zip = ''
      let phone = ''
      let fuelType: FuelType = 'E0'
      let octane = 87

      for (const line of lines) {
        // Phone pattern: (xxx) xxx-xxxx or xxx-xxx-xxxx
        if (/^\(?\d{3}\)?[\s\-]\d{3}[\s\-]\d{4}$/.test(line)) {
          phone = line
          continue
        }
        // Octane/fuel type: "87 octane", "91-octane Valero", etc.
        const octaneMatch = line.match(/(\d{2})\s*[-]?\s*octane/i)
        if (octaneMatch) {
          octane = parseInt(octaneMatch[1], 10)
          fuelType = normalizeFuelType(line)
          continue
        }
        // Address line: starts with a number
        if (/^\d+\s+\w+/.test(line) && !address) {
          address = line
          continue
        }
        // City/state/zip: "Austin, TX 78701"
        const cityStateZip = line.match(/^(.+),\s*([A-Z]{2})\s*(\d{5})?$/)
        if (cityStateZip) {
          city = cityStateZip[1].trim()
          state = cityStateZip[2]
          zip = cityStateZip[3] ?? ''
          continue
        }
      }

      // Stable ID: regionCode + truncated coordinates
      const id = `${regionCode}-${lat.toFixed(5)}-${lng.toFixed(5)}`

      stations.push({
        id,
        name,
        address,
        city,
        state,
        zip,
        phone,
        fuelType,
        octane,
        lat,
        lng,
        regionCode,
      })
    } catch {
      // Skip malformed entries, continue parsing
    }
  })

  return stations
}
