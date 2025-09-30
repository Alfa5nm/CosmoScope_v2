import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5174',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React and routing
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // 3D graphics and mapping
          'three-vendor': ['three'],
          'map-vendor': ['maplibre-gl'],
          
          // UI and utilities
          'ui-vendor': ['zustand'],
          
          // Heavy components (will be lazy loaded)
          'solar-system': ['./src/components/SolarSystem'],
          'planet-view': ['./src/components/PlanetView'],
          'map-2d': ['./src/components/Map2D']
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            if (facadeModuleId.includes('SolarSystem')) {
              return 'assets/solar-system-[hash].js'
            }
            if (facadeModuleId.includes('PlanetView')) {
              return 'assets/planet-view-[hash].js'
            }
            if (facadeModuleId.includes('Map2D')) {
              return 'assets/map-2d-[hash].js'
            }
          }
          return 'assets/[name]-[hash].js'
        }
      }
    },
    // Increase chunk size warning limit since we're intentionally creating larger chunks
    chunkSizeWarningLimit: 1000
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['three', 'maplibre-gl'],
    exclude: ['@vite/client', '@vite/env']
  }
})