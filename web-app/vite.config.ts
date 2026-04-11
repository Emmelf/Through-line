import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
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