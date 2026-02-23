import type { GasStation } from '../types/station'
import { parseKML } from '../lib/kml-parser'
import { unzipSync } from 'fflate'

export interface WorkerRequest {
  url: string
}

export type WorkerResponse =
  | { type: 'progress'; phase: string; pct: number }
  | { type: 'result'; stations: GasStation[]; duration: number }
  | { type: 'error'; error: string }

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { url } = event.data
  const start = Date.now()

  try {
    // Phase 1: Download the KMZ
    const progressMsg: WorkerResponse = { type: 'progress', phase: 'Downloading station data…', pct: 0 }
    self.postMessage(progressMsg)

    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.google-earth.kmz, application/zip, */*' },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    const buffer = await response.arrayBuffer()

    // Phase 2: Decompress KMZ (it's a ZIP archive)
    const decompressMsg: WorkerResponse = { type: 'progress', phase: 'Decompressing…', pct: 0.5 }
    self.postMessage(decompressMsg)

    const unzipped = unzipSync(new Uint8Array(buffer))

    // Find the KML file inside the archive (usually 'doc.kml')
    const kmlKey = Object.keys(unzipped).find((k) => k.endsWith('.kml')) ?? 'doc.kml'
    const kmlBytes = unzipped[kmlKey]
    if (!kmlBytes) throw new Error('No KML file found in KMZ archive')

    const kmlText = new TextDecoder().decode(kmlBytes)

    // Phase 3: Parse all station placemarks
    const parseMsg: WorkerResponse = { type: 'progress', phase: 'Parsing stations…', pct: 0.7 }
    self.postMessage(parseMsg)

    const stations = parseKML(kmlText, '')

    const resultMsg: WorkerResponse = {
      type: 'result',
      stations,
      duration: Date.now() - start,
    }
    self.postMessage(resultMsg)
  } catch (err) {
    const errorMsg: WorkerResponse = {
      type: 'error',
      error: err instanceof Error ? err.message : String(err),
    }
    self.postMessage(errorMsg)
  }
}
