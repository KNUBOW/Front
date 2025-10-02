// src/lib/api.js
import axios from "axios";

/**
 * ✅ BASE URL 해석 로직
 * - 배포: VITE_API_BASE 이면 그걸 사용 (예: https://augustzero.mooo.com)
 * - 개발: VITE_API_BASE 없으면 프록시(/api)로 동작하도록 상대 경로를 사용
 *   → vite.config.js에서 /api 프록시 설정 권장
 */
const ENV_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");
const USE_RELATIVE = !ENV_BASE; // .env에 VITE_API_BASE 없으면 상대경로 모드
const baseURL = USE_RELATIVE ? "/api" : ENV_BASE;

// 간단한 가드(선택): 절대 URL만 강제하고 싶다면 아래 주석 해제
// if (!ENV_BASE) {
//   console.error("[API] VITE_API_BASE가 비어있습니다. (개발은 프록시 /api 사용)");
// }

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ 쿠키 인증 필수
  // XSRF를 서버가 요구한다면 주석 해제하고 이름 맞추세요
  // xsrfCookieName: "XSRF-TOKEN",
  // xsrfHeaderName: "X-XSRF-TOKEN",
});

/** (선택) Authorization 병행 지원
 * 서버가 "쿠키"만 읽는다면 굳이 필요 없음.
 * 다만 과거 코드가 Bearer도 허용한다면 양쪽 다 붙여도 무방.
 */
api.interceptors.request.use((cfg) => {
  // 필요 시 로컬 토큰도 붙임 (없으면 무시)
  const token = localStorage.getItem("access_token");
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }

  // 디버그 로그
  const method = (cfg.method || "GET").toUpperCase();
  const full = `${cfg.baseURL}${cfg.url}`;
  console.debug("[API req]", method, full, {
    withCredentials: cfg.withCredentials,
    // 쿠키는 HttpOnly면 브라우저에서 못 읽으니 여기서 노출 불가(정상)
  });

  return cfg;
});

/**
 * ✅ 401 자동 복구:
 * - 가정: 서버가 /auth/refresh 를 제공하고, 리프레시 토큰은 **HttpOnly 쿠키**로 저장됨
 * - 동시 다발 401을 큐로 직렬화 처리
 */
let isRefreshing = false;
let waitQueue = [];

async function refreshToken() {
  // 동일 인스턴스 쓰면 인터셉터에 또 걸릴 수 있어 별도 axios 사용
  const res = await axios.post(
    `${baseURL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  const newAccess = res?.data?.accessToken;
  if (newAccess) localStorage.setItem("access_token", newAccess);
  return newAccess;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const original = err?.config;

    console.error(
      "[API err]",
      status,
      `${original?.baseURL || baseURL}${original?.url || ""}`,
      err
    );

    // 401 처리
    if (status === 401 && original && !original._retry) {
      original._retry = true;

      // 이미 갱신 중이면 큐에 합류
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waitQueue.push({ resolve, reject });
        })
          .then((newAccess) => {
            if (newAccess) {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${newAccess}`;
            }
            return api(original);
          })
          .catch((e) => Promise.reject(e));
      }

      try {
        isRefreshing = true;
        const newAccess = await refreshToken();

        // 대기중 요청 재개
        waitQueue.forEach(({ resolve }) => resolve(newAccess));
        waitQueue = [];

        // 재시도
        if (newAccess) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newAccess}`;
        }
        return api(original);
      } catch (e) {
        // 대기중 실패 전파
        waitQueue.forEach(({ reject }) => reject(e));
        waitQueue = [];

        // 액세스 토큰 폐기(있다면)
        localStorage.removeItem("access_token");
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    // 그 외 에러는 통과
    throw err;
  }
);

export default api;
