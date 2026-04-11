import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    watch: {
      // When running Vite on WSL2 (Docker with a WSL2 backend),
      // file system watching does not work when files are edited
      // by Windows apps (non-WSL2 process).
      // See: https://vite.dev/config/server-options
      usePolling: true,
    },
  }
})