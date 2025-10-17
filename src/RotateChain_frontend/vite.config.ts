import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path,{resolve} from 'path'
import environment from 'vite-plugin-environment';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" })

  ],
  resolve: {
    alias: {
      '@declarations': resolve(__dirname, '../declarations'),
      '@': resolve(__dirname, './src'),
    },
    dedupe: ['@dfinity/agent']

  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4943',
        changeOrigin: true
      }
    }
  },
  build: {
    emptyOutDir: true,
  },
  define: {
    global: 'globalThis',
    //'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
    //'process.env.INTERNET_IDENTITY_CANISTER_ID': JSON.stringify(process.env.INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai')
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})
