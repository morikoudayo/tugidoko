import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/amserver': {
        target: 'https://mastersso.kanagawa-u.ac.jp',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost'
      },
      '/campusweb': {
        target: 'https://webstation.kanagawa-u.ac.jp',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost'
      },
      '/__/auth': {
        target: 'https://firebase.firebaseapp.com',
        changeOrigin: true
      }
    }
  }
})