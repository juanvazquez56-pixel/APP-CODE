import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'NK BOX',
        short_name: 'NK BOX',
        description: 'NK BOX — Escuela de Boxeo en Querétaro. Horarios, planes y más.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/LOGONKBOX-icono.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/LOGONKBOX-icono.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/LOGONKBOX-icono.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg}'],
      },
    }),
  ],
})
