import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/',
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase'
              }
              if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) {
                return 'vendor-react'
              }
              if (id.includes('framer-motion')) {
                return 'vendor-motion'
              }
              return 'vendor' // everything else in node_modules
            }
          },
        },
      },
    },
  }
})