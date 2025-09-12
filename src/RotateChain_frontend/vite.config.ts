import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4943',
        changeOrigin: true,
      },
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  define: {
    global: 'globalThis',
    // Only expose specific environment variables (secure approach)
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})