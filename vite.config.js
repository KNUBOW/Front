// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://augustzero.mooo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // ★ 쿠키 도메인/경로 재작성 (http-proxy 옵션)
        cookieDomainRewrite: 'localhost', // 또는 '127.0.0.1'
        cookiePathRewrite: '/',           // 보통 '/' 유지
      },
    },
  },
})
