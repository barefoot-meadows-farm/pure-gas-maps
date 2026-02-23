import type { GasStation, FuelType } from '@/types/station'

function octaneToFuelType(octane: number): FuelType {
  if (octane >= 91) return 'E0-Premium'
  if (octane >= 89) return 'E0-Midgrade'
  return 'E0'
}

/**
 * Extract the text content of the first occurrence of <tag>...</tag> in a block.
 * Intentionally avoids DOMParser — Safari does not support it in Web Workers.
 */
function extractTag(block: string, tag: string): string {
  const open = `<${tag}`
  const close = `</${tag}>`
  const start = block.indexOf(open)
  if (start === -1) return ''
  const contentStart = block.indexOf('>', start) + 1
  const end = block.indexOf(close, contentStart)
  if (end === -1) return ''
  return block.slice(contentStart, end).trim()
}

/**
 * Decode common XML entities in plain text content.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
}

/**
 * Parse a pure-gas.org KML XML string into GasStation objects.
 *
 * Uses plain string splitting instead of DOMParser so it works inside
 * Web Workers on all platforms, including Safari/WebKit.
 *
 * The KML format uses <Placemark> elements with semicolon-delimited
 * plain text in <description>:
 *   "street, city, STATE zip?; phone?; ethanol-free BRAND octane+; GPS note"
 * Phone is also available in a dedicated <phoneNumber> element.
 */
export function parseKML(xmlString: string, regionCode: string): GasStation[] {
  const stations: GasStation[] = []

  // Split on '<Placemark' to get one block per station.
  // Skip index 0 (document header before the first Placemark).
  const placemarkParts = xmlString.split('<Placemark')

  for (let i = 1; i < placemarkParts.length; i++) {
    try {
      // Each part is: '[attrs]>...content...</Placemark>remainder'
      const endIdx = placemarkParts[i].indexOf('</Placemark>')
      const block = endIdx >= 0 ? placemarkParts[i].slice(0, endIdx) : placemarkParts[i]

      const name = decodeEntities(extractTag(block, 'name'))
      const phone = extractTag(block, 'phoneNumber')
      const coordText = extractTag(block, 'coordinates')
      const descRaw = decodeEntities(extractTag(block, 'description'))

      const coordParts = coordText.split(',')
      if (coordParts.length < 2) continue

      const lng = parseFloat(coordParts[0])
      const lat = parseFloat(coordParts[1])
      if (isNaN(lat) || isNaN(lng)) continue

      let address = ''
      let city = ''
      let state = regionCode
      let zip = ''
      let fuelType: FuelType = 'E0'
      let octane = 87
      let octanes: number[] = []

      if (descRaw) {
        const parts = descRaw.split(';').map((p) => p.trim()).filter(Boolean)

        // Segment 0: location — "street, city, STATE" or "street, city, STATE zip"
        if (parts.length > 0) {
          // Greedy: capture everything before the trailing ", XX" (state/province code)
          const locMatch = parts[0].match(/^(.*),\s*([A-Za-z]{2})\s*(\d{5})?\s*$/)
          if (locMatch) {
            state = locMatch[2].toUpperCase()
            zip = locMatch[3] ?? ''
            const beforeState = locMatch[1].trim()
            const lastComma = beforeState.lastIndexOf(',')
            if (lastComma > 0) {
              address = beforeState.slice(0, lastComma).trim()
              city = beforeState.slice(lastComma + 1).trim()
            } else {
              address = beforeState
            }
          } else {
            address = parts[0]
          }
        }

        // Remaining segments: find "ethanol-free BRAND octane+" for fuel grade.
        // Collect ALL valid octane numbers (85–110) to handle multi-grade stations
        // like "ethanol-free VALERO 87 93". Brand-name numbers (e.g. 66, 76) fall
        // outside this range and are ignored. Use the highest grade for classification.
        for (let j = 1; j < parts.length; j++) {
          if (parts[j].toLowerCase().startsWith('ethanol-free')) {
            const digits = [...parts[j].matchAll(/\b(\d{2,3})\b/g)]
            for (const m of digits) {
              const val = parseInt(m[1], 10)
              if (val >= 85 && val <= 110) octanes.push(val)
            }
            if (octanes.length > 0) {
              octane = Math.max(...octanes)
              fuelType = octaneToFuelType(octane)
            }
            break
          }
        }
      }

      const effectiveRegionCode = state || regionCode
      const id = `${effectiveRegionCode}-${lat.toFixed(5)}-${lng.toFixed(5)}`

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
        octanes: octanes.length > 0 ? octanes : [octane],
        lat,
        lng,
        regionCode: effectiveRegionCode,
      })
    } catch {
      // Skip malformed entries, continue parsing
    }
  }

  return stations
}
