import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/analytics': { target: 'http://localhost:8000', changeOrigin: true },
      '/cities':    { target: 'http://localhost:8000', changeOrigin: true },
      '/geo':       { target: 'http://localhost:8000', changeOrigin: true },
      '/roads':     { target: 'http://localhost:8000', changeOrigin: true },
      '/uploads':   { target: 'http://localhost:8000', changeOrigin: true },
      '/health':    { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
