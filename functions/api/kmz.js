/**
 * Cloudflare Pages Function — server-side proxy for the pure-gas.org KMZ file.
 *
 * pure-gas.org does not send CORS headers, so browser fetches from a different
 * origin are blocked. This function fetches the file on the server (Workers
 * runtime) and streams it back to the client, bypassing the CORS restriction.
 *
 * Route: GET /api/kmz
 */
export async function onRequestGet() {
  const upstream = await fetch('https://www.pure-gas.org/download/pure-gas.kmz', {
    headers: {
      Accept: 'application/vnd.google-earth.kmz, application/zip, */*',
      'User-Agent': 'pure-gas-maps/1.0 (proxy)',
    },
  })

  if (!upstream.ok) {
    return new Response(`Upstream error: ${upstream.status} ${upstream.statusText}`, {
      status: upstream.status,
    })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.google-earth.kmz',
      // Cache at the edge for 1 hour — pure-gas.org updates infrequently
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
