import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const HEAVY_3D = [
  '/node_modules/three',
  '/node_modules/@react-three',
  '/node_modules/@dimforge',
  '/node_modules/rapier',
  '/node_modules/three-stdlib',
  '/node_modules/meshline',
  '/node_modules/three-mesh-bvh',
  '/node_modules/@monogrid',
  '/node_modules/@use-gesture',
  '/node_modules/@webgpu',
]

export default defineConfig({
  plugins: [react()],
  base: './',
  assetsInclude: ['**/*.glb'],
  build: {
    target: 'es2019',
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replace(/\\/g, '/')
          // Keep Vite's preload helper in its own tiny chunk so the heavy 3D
          // vendor chunk is never statically imported by the entry.
          if (path.includes('vite/preload-helper')) return 'vendor-preload'
          if (!path.includes('node_modules')) return undefined
          if (HEAVY_3D.some((entry) => path.includes(entry))) return 'vendor-3d'
          if (path.includes('/node_modules/gsap')) return 'vendor-gsap'
          if (path.includes('/node_modules/lucide-react')) return 'vendor-icons'
          if (
            path.includes('/node_modules/react-dom') ||
            path.includes('/node_modules/react/') ||
            path.includes('/node_modules/scheduler')
          ) {
            return 'vendor-react'
          }
          return undefined
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 80,
    allowedHosts: ['zmx.com', '.trycloudflare.com', '.loca.lt'],
  },
})
