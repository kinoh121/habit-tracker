import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/habit-tracker/',
      manifest: {
        name: 'Habit Tracker',
        short_name: 'Habits',
        description: 'ハビットトラッカー',
        start_url: '/habit-tracker/',
        scope: '/habit-tracker/',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#0d0d0d',
        theme_color: '#0d0d0d',
        icons: [
          {
            src: '/habit-tracker/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/habit-tracker/index.html',
        navigateFallbackDenylist: [/^\/habit-tracker\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.firebaseapp\.com\/.*/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/identitytoolkit\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  base: '/habit-tracker/',
})
