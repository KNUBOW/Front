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

// 쿠키 이름을 프로젝트에 맞게 지정
const COOKIE_TOKEN_NAME = "access_token"; // ex) 'access_token' / 'token' 등
const isDev = import.meta.env.DEV === true;

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
  const lsToken = typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null;
  const token = cookieToken || lsToken;

  // 요청에 이미 Authorization이 없다면 설정
  if (token && !cfg.headers?.Authorization) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${token}`;
  }

  if (isDev) {
    const method = (cfg.method || "GET").toUpperCase();
    // baseURL과 url이 둘 다 슬래시로 끝/시작하는 경우를 정리
    const urlPath = String(cfg.url || "").replace(/^\/+/, "");
    const full = `${(cfg.baseURL || "").replace(/\/+$/, "")}/${urlPath}`;
    console.debug("[API req]", method, full, {
      attachedAuth: !!token,
      withCredentials: cfg.withCredentials === true,
    });
  }

  return cfg;
});

// === 응답 인터셉터 ===
// 401이어도 /auth/refresh 호출하지 않음 (요구사항 유지)
api.interceptors.response.use(
  (res) => {
    if (isDev) {
      const urlPath = String(res.config?.url || "").replace(/^\/+/, "");
      const full = `${(res.config?.baseURL || baseURL).replace(/\/+$/, "")}/${urlPath}`;
      console.debug("[API res]", res.status, full);
    }
    return res;
  },
  (err) => {
    // ✅ 취소(AbortController)면 시끄러운 에러 로그를 남기지 않음
    const isCanceled =
      axios.isCancel?.(err) || err?.code === "ERR_CANCELED" || err?.message === "canceled";

    if (isCanceled) {
      if (isDev) {
        const urlPath = String(err?.config?.url || "").replace(/^\/+/, "");
        const full = `${(err?.config?.baseURL || baseURL).replace(/\/+$/, "")}/${urlPath}`;
        console.debug("[API canceled]", full);
      }
      return Promise.reject(err); // 호출부에서 취소는 에러로 취급하지 않도록 처리
    }

    // 그 외 에러만 보기 좋게 로깅
    const status = err?.response?.status;
    const urlPath = String(err?.config?.url || "").replace(/^\/+/, "");
    const full = `${(err?.config?.baseURL || baseURL).replace(/\/+$/, "")}/${urlPath}`;
    console.error("[API err]", status, full, err);

    // 필요 시 401 공통 처리 훅
    // if (status === 401) {
    //   // 예: 라우팅 라이브러리로 로그인 페이지로 이동
    //   // window.location.href = "/login";
    // }

    return Promise.reject(err);
  }
);

export default api;
