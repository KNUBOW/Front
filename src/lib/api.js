// src/lib/api.js
import axios from "axios";

/**
 * BASE URL
 * - 배포: .env의 VITE_API_BASE (ex: https://augustzero.mooo.com)
 * - 개발: 없으면 상대경로 /api (vite proxy 권장)
 */
const ENV_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");
const baseURL = ENV_BASE || "/api";

/** 쿠키에서 특정 이름의 값을 읽는 유틸
 *  - access_token 쿠키가 JS에서 보이도록 서버가 httpOnly:false 로 세팅돼 있어야 함
 */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    ?.split(";")
    ?.map((v) => v.trim())
    ?.find((v) => v.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// 쿠키 이름을 프로젝트에 맞게 지정해 주세요.
const COOKIE_TOKEN_NAME = "access_token"; // ex) 'access_token' / 'token' 등

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // 쿠키 인증 병행
});

// === 요청 인터셉터 ===
// 쿠키 → Authorization 헤더 주입 (없으면 localStorage 백업)
api.interceptors.request.use((cfg) => {
  const cookieToken = getCookie(COOKIE_TOKEN_NAME);
  const lsToken = localStorage.getItem("access_token");
  const token = cookieToken || lsToken;

  if (token) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${token}`;
  }

  // 디버깅 로그
  const method = (cfg.method || "GET").toUpperCase();
  const full = `${cfg.baseURL}${cfg.url}`;
  console.debug("[API req]", method, full, {
    attachedAuth: !!token,
    withCredentials: cfg.withCredentials,
  });

  return cfg;
});

// === 응답 인터셉터 ===
// 401이어도 /auth/refresh 호출하지 않음 (요구사항)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = `${err?.config?.baseURL || baseURL}${err?.config?.url || ""}`;
    console.error("[API err]", status, url, err);

    // 필요 시 401 공통 처리(전역 알림/로그아웃/리다이렉트 훅)
    // if (status === 401) {
    //   // 예: 라우팅 라이브러리에서 로그인 페이지로 보내기
    //   // window.location.href = "/login";
    // }

    throw err;
  }
);

export default api;
