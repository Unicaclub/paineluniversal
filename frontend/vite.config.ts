import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
      },
      manifest: {
        name: 'Sistema Universal de Eventos - CPF Seguro',
        short_name: 'Eventos Universal',
        description: 'Sistema completo para gestão de eventos com segurança CPF',
        theme_color: '#007BFF',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          radix: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          charts: ['recharts'],
          router: ['react-router-dom'],
          forms: ['react-hook-form', '@hookform/resolvers', 'yup', 'zod'],
          ui: ['lucide-react', 'class-variance-authority', 'clsx']
        }
      }
    }
  },
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    host: '0.0.0.0',
    allowedHosts: true
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

