/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Allow JSX to use the capacitor-google-maps custom element
declare namespace JSX {
  interface IntrinsicElements {
    'capacitor-google-maps': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >
  }
}
