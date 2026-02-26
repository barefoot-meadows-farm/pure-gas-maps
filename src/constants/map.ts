// Geographic center of the contiguous United States
export const DEFAULT_CENTER = {
  lat: 39.8283,
  lng: -98.5795,
}

export const DEFAULT_ZOOM = 4

export const NEARBY_RADIUS_KM = 80
export const VIEWPORT_MAX_STATIONS = 500
export const MARKER_UPDATE_DEBOUNCE_MS = 200

// Minimum zoom level before markers are loaded — avoids fetching thousands of
// stations when the user is zoomed out to a country/state view.
export const MIN_ZOOM_FOR_MARKERS = 10

// Zoom level used when panning to the user's GPS location on first fix.
export const LOCATION_ZOOM = 14
