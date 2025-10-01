import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Cloudtype docbase(/build)와 일치
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://augustzero.mooo.com',
        changeOrigin: true,
        secure: true, // 로컬 개발에서 자체서명 인증서면 false로
        rewrite: (path) => path.replace(/^\/api/, ''),
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
      },
    },
  },
})
