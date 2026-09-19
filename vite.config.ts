import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // @ts-ignore — allow all preview hosts (E2B proxy: *.e2b.app)
    allowedHosts: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL'
    },
    hmr: { clientPort: 443 }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
})
