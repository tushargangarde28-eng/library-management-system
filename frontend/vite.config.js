import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react', 'react', 'react-dom', 'react-router-dom'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Use 127.0.0.1 to avoid Windows IPv6 localhost resolution delays (300ms - 1500ms per request)
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/actuator': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
