/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import basicSsl from '@vitejs/plugin-basic-ssl'
import type { ProxyOptions } from 'vite'

const DOMAIN = process.env.VITE_DOMAIN || 'localhost'

const createProxyConfig = (target: string, host: string): ProxyOptions => ({
  target,
  changeOrigin: true,
  cookieDomainRewrite: DOMAIN,
  headers: { Host: host },
  followRedirects: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configure: (proxy: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proxy.on('proxyReq', (proxyReq: any) => {
      proxyReq.setHeader('Origin', target)
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const DOMAIN = env.VITE_DOMAIN || 'localhost'
  const HTTPS = env.VITE_HTTPS === 'true'

  return {
    plugins: [react(), tsconfigPaths(), HTTPS ? basicSsl() : undefined],
    server: {
      https: HTTPS ? {} : undefined,
      host: '0.0.0.0',
      allowedHosts: [DOMAIN],
      port: 3000,
      proxy: {
        '/amserver': createProxyConfig('https://mastersso.kanagawa-u.ac.jp', 'mastersso.kanagawa-u.ac.jp'),
        '/campusweb': createProxyConfig('https://webstation.kanagawa-u.ac.jp', 'webstation.kanagawa-u.ac.jp'),
        '/__/auth': {
          target: 'https://firebase.firebaseapp.com',
          changeOrigin: true
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.ts']
    }
  }
})