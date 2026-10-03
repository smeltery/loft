import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  server: { port: 3000 },
  preview: { port: 3000 },
})
