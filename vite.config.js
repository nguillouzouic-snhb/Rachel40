import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Les 40 ans de Rachel',
        short_name: 'Rachel 40',
        description: 'Livre d\'or interactif — les 40 ans de Rachel, vus par chacun.',
        theme_color: '#f5f0e8',
        background_color: '#f5f0e8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // On ne precache PAS les assets dynamiques (audio, photos)
        // On laisse le SW en "network first" pour les API calls
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'rachel40-static',
              expiration: { maxEntries: 100, maxAgeSeconds: 3600 }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true, // accessible sur le réseau local (important pour les tests multi-téléphones)
    port: 5173
  }
})