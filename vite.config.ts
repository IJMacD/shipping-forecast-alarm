import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/shipping-forecast-alarm/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          dashjs: ["dashjs"]
        }
      }
    }
  }
})
