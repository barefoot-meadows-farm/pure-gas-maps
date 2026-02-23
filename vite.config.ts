import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },

  worker: {
    format: 'es',
  },

  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/kmz-proxy': {
        target: 'https://www.pure-gas.org',
        changeOrigin: true,
        rewrite: (path) => path.replace('/kmz-proxy', ''),
      },
    },
  },
})
