// src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",         // Vite 프록시 사용
  withCredentials: true,   // 쿠키도 함께 보낼 수 있게 (혹시 서버가 쿠키도 쓰면 겸용)
  timeout: 15000,
});

// 요청 인터셉터: 로컬스토리지에 토큰 있으면 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.headers?.accept) {
    config.headers = { ...config.headers, accept: "application/json" };
  }
  return config;
});

// 응답 인터셉터: 401 → 로그인 페이지로 유도 (원하면 주석 해제)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

export default api;
