import { createContext, useContext, useMemo, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

// ----- cookie & jwt utils -----
function getCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function deleteCookie(name) {
  document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
}
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
}
function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function isExpired(token) {
  const p = decodeJwt(token);
  if (!p?.exp) return false; // exp 없으면 일단 유효 취급
  const nowSec = Math.floor(Date.now() / 1000);
  return p.exp <= nowSec;
}

// ----- initial bootstrap (동기) -----
function bootstrapFromCookie() {
  const token = getCookie("access_token");
  if (!token || isExpired(token)) {
    if (token && isExpired(token)) deleteCookie("access_token");
    return { authed: false, user: null };
  }
  const p = decodeJwt(token);
  const user = {
    id: p?.id ?? p?.userId ?? p?.sub ?? null,
    email: p?.email ?? p?.userEmail ?? null,
    name: p?.name ?? p?.userName ?? p?.nickname ?? null,
  };
  return { authed: true, user };
}

export function AuthProvider({ children }) {
  // ★ 첫 렌더 시점에 동기로 쿠키 확인 → 깜빡임/오리디렉트 방지
  const boot = bootstrapFromCookie();
  const [authed, setAuthed] = useState(boot.authed);
  const [user, setUser] = useState(boot.user);
  const [loading, setLoading] = useState(false); // 서버 핑이나 추가 작업 시 표시용(옵션)

  // (옵션) 토큰이 만료 임박 시 새 로그인 유도 등을 여기서 처리 가능
  useEffect(() => {
    // 필요하면 서버에 핑 치는 로직 넣기
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/users/log-in", { email, password });
      const token =
        res.data?.access_token ||
        res.data?.accessToken ||
        res.data?.token ||
        res.data?.jwt;
      if (!token) throw new Error("로그인 응답에 access token이 없습니다.");

      setCookie("access_token", token, 7);

      const p = decodeJwt(token);
      const nextUser = {
        id: p?.id ?? p?.userId ?? p?.sub ?? null,
        email: p?.email ?? p?.userEmail ?? null,
        name: p?.name ?? p?.userName ?? p?.nickname ?? null,
      };
      setUser(nextUser);
      setAuthed(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    deleteCookie("access_token");
    setUser(null);
    setAuthed(false);
  };

  const value = useMemo(
    () => ({ authed, user, loading, login, logout }),
    [authed, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
