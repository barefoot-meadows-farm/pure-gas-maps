/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_KEY_IOS: string
  readonly VITE_GOOGLE_MAPS_KEY_WEB: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Allow JSX to use the capacitor-google-map custom element
declare namespace JSX {
  interface IntrinsicElements {
    'capacitor-google-map': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >
  }
}
