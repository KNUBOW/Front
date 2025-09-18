import axios from "axios";

function getCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

const api = axios.create({
  baseURL: "/api",        // Vite 프록시 쓰면 /api
  timeout: 1000000,
});

// 요청 인터셉터: 쿠키에서 access_token 읽어 Bearer 붙이기
api.interceptors.request.use((config) => {
  const token = getCookie("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
