import type { GasStation } from '../types/station'
import { parseKML } from '../lib/kml-parser'

export interface WorkerRequest {
  regionCode: string
  url: string
}

export interface WorkerResponse {
  regionCode: string
  stations?: GasStation[]
  error?: string
  duration: number
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { regionCode, url } = event.data
  const start = Date.now()

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.google-earth.kml+xml, application/xml, text/xml' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const xmlText = await response.text()
    const stations = parseKML(xmlText, regionCode)

    const result: WorkerResponse = {
      regionCode,
      stations,
      duration: Date.now() - start,
    }
    self.postMessage(result)
  } catch (err) {
    const result: WorkerResponse = {
      regionCode,
      error: err instanceof Error ? err.message : String(err),
      duration: Date.now() - start,
    }
    self.postMessage(result)
  }
}
