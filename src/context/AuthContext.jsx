// src/context/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../lib/api";

/**
 * 쿠키 세션만 사용하는 간소 버전
 * - 앱 시작 시 서버에 세션 확인 호출을 하지 않음(엔드포인트 부재)
 * - 로그인 성공(200) 시에만 authed=true로 전환
 * - 새로고침하면 상태가 초기화되므로, 서버에 /auth/check 같은 엔드포인트가 생기면 그때 재도입
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(false);

  // 로그인: 서버가 Set-Cookie(HttpOnly)를 내려준다는 가정
  const login = async (email, password) => {
    await api.post("/users/log-in", { email, password });
    setAuthed(true);
  };

  // 로그아웃: 서버가 쿠키 삭제(clearCookie) 수행
  const logout = async () => {
    try {
      await api.post("/users/log-out");
    } catch {/* ignore */}
    setAuthed(false);
  };

  const value = useMemo(() => ({ authed, login, logout }), [authed]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
