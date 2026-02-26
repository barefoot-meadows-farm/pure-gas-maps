export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
]

export const CA_PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
]

export const ALL_REGIONS = [...US_STATES, ...CA_PROVINCES]

/** Single KMZ file containing all US + Canada ethanol-free stations */
export function getKmzUrl(): string {
  // In dev, the Vite server proxy handles /kmz-proxy → pure-gas.org (see vite.config.ts).
  // In production web, the Cloudflare Pages Function at functions/api/kmz.js proxies
  // the request server-side, avoiding the CORS block from pure-gas.org.
  // On native (Capacitor iOS/Android), the app runs at capacitor://localhost so relative
  // paths don't hit the Cloudflare Function — use the absolute deployed URL instead.
  if (import.meta.env.DEV) return '/kmz-proxy/download/pure-gas.kmz'
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  return `${base}/api/kmz`
}
