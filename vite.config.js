import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // `npm run dev` doesn't run Netlify functions, so forward them to the live site to get
  // real dashboard content, Twitch status, clips and Discord stats.
  // Only GETs are forwarded by default so local testing can't save content, start checkouts
  // or post forms on production. FUNCTIONS_PROXY=off disables it; FUNCTIONS_PROXY_WRITE=1 allows writes.
  const functionsTarget = env.FUNCTIONS_PROXY || 'https://gdesports.netlify.app'
  const allowWrites = env.FUNCTIONS_PROXY_WRITE === '1'
  const proxy =
    functionsTarget === 'off'
      ? undefined
      : {
          '/.netlify/functions': {
            target: functionsTarget,
            changeOrigin: true,
            bypass(req, res) {
              if (req.method === 'GET' || allowWrites) return
              res.statusCode = 403
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Writes to production are disabled in local dev (set FUNCTIONS_PROXY_WRITE=1 to allow).' }))
              // A string result plus an ended response tells Vite the request is handled.
              return req.url
            },
          },
        }

  return {
    server: { proxy },
    plugins: [
      react(),
      ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 80 },
        jpg: { quality: 80 },
        webp: { quality: 80 },
        avif: { quality: 80 },
      }),
      visualizer({
        open: env.ANALYZE === '1', // `ANALYZE=1 npm run build` opens the treemap
        gzipSize: true,    // shows gzipped sizes, not just raw
        filename: 'dist/stats.html', // where the report gets saved
      }),
    ],
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