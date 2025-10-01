// src/lib/api.js
import axios from "axios";

/**
 * 개발(dev): Vite 프록시를 통해 /api로 우회
 * 배포(prod): VITE_API_BASE(절대 URL)로 직접 호출
 *
 * .env.production 예) VITE_API_BASE=https://your-backend.sel3.cloudtype.app
 * .env.development 예) 필요 없음 (프록시 사용)
 */
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") // 끝 슬래시 제거
  : "/api";

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  // 인증이 필요하면 아래 주석 해제
  // withCredentials: true,
});

// 간단 로깅(문제 시 추적)
api.interceptors.request.use((cfg) => {
  console.debug("[API req]", cfg.method?.toUpperCase(), cfg.baseURL + cfg.url);
  return cfg;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API err]", err?.response?.status, err?.config?.url, err);
    throw err;
  }
);

export default api;
