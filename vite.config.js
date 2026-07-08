import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import chatHandler from './api/chat.js'

function createJsonResponse(response) {
  return {
    setHeader(name, value) {
      response.setHeader(name, value)
    },
    status(code) {
      response.statusCode = code
      return this
    },
    json(payload) {
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(payload))
    },
  }
}

function myFlowApiPlugin() {
  return {
    name: 'myflow-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', (request, response) => {
        chatHandler(request, createJsonResponse(response))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [
      react(),
      myFlowApiPlugin(),
      VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        id: '/',
        name: 'MyFlow',
        short_name: 'MyFlow',
        description: 'MyFlow begleitet Routinen, Wohlbefinden und Fortschritt im Alltag.',
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f8f6ff',
        theme_color: '#8d63ff',
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,jpg,jpeg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//, /^\/rest\//],
      },
      devOptions: {
        enabled: false,
      },
    }),
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/tests/**/*.test.{js,jsx}'],
      setupFiles: './src/setupTests.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'json-summary'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{js,jsx}'],
        exclude: [
          'src/main.jsx',
          'src/setupTests.js',
          'src/**/*.test.{js,jsx}',
          'src/tests/**',
        ],
      },
    },
  }
})
