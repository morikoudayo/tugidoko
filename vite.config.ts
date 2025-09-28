import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

const LOCAL_DOMAIN = process.env.VITE_DOMAIN || 'localhost'

const createProxyConfig = (target: string, host: string) => ({
  target,
  changeOrigin: true,
  cookieDomainRewrite: LOCAL_DOMAIN,
  headers: { Host: host },
  followRedirects: false,
  configure: (proxy: any) => {
    proxy.on('proxyReq', (proxyReq: any) => {
      proxyReq.setHeader('Origin', target)
    })
    proxy.on('proxyRes', (proxyRes: any) => {
      if (proxyRes.statusCode === 302 && proxyRes.headers.location) {
        let location = proxyRes.headers.location
        location = location.replace(/https:\/\/(mastersso|webstation)\.kanagawa-u\.ac\.jp:443/g, '')
        location = location.replace(/https:\/\/(mastersso|webstation)\.kanagawa-u\.ac\.jp/g, '')
        proxyRes.headers.location = location
      }
    })
  }
})

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    https: process.env.VITE_HTTPS === 'true' ? {} : undefined,
    host: '0.0.0.0',
    allowedHosts: [LOCAL_DOMAIN],
    port: 3000,
    proxy: {
      '/amserver': createProxyConfig('https://mastersso.kanagawa-u.ac.jp', 'mastersso.kanagawa-u.ac.jp'),
      '/campusweb': createProxyConfig('https://webstation.kanagawa-u.ac.jp', 'webstation.kanagawa-u.ac.jp'),
      '/__/auth': {
        target: 'https://firebase.firebaseapp.com',
        changeOrigin: true
      }
    }
  }
})