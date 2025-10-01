// src/lib/api.js
import axios from "axios";

// .env 파일에 반드시 아래처럼 세팅되어 있어야 합니다:
// VITE_API_BASE=https://augustzero.mooo.com
const baseURL = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");

if (!baseURL) {
  console.error("[API] VITE_API_BASE 환경변수가 비어있습니다.");
  throw new Error("VITE_API_BASE 환경변수를 .env 파일에 설정해주세요.");
}

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  // withCredentials: true, // 쿠키 인증 쓰면 주석 해제
});

// 요청/응답 로깅
api.interceptors.request.use((cfg) => {
  console.debug("[API req]", (cfg.method || "GET").toUpperCase(), `${cfg.baseURL}${cfg.url}`);
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API err]", err?.response?.status, `${err?.config?.baseURL}${err?.config?.url}`, err);
    throw err;
  }
);

export default api;
