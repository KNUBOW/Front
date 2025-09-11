// src/context/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(false);

  // 로그인: 서버가 body 또는 header로 토큰을 주는 모든 케이스 대응
  const login = async (email, password) => {
    const res = await api.post("/users/log-in", { email, password });

    // 1) body 케이스
    const bodyToken =
      res.data?.access_token ||
      res.data?.accessToken ||
      res.data?.token ||
      res.data?.jwt;

    // 2) 헤더 케이스 (Authorization: Bearer xxx)
    const headerAuth = res.headers?.authorization || res.headers?.Authorization;
    const headerToken = headerAuth?.startsWith("Bearer ")
      ? headerAuth.slice("Bearer ".length)
      : null;

    const token = bodyToken || headerToken;
    if (token) {
      localStorage.setItem("accessToken", token);
    }

    // 쿠키 기반도 병행한다면(서버가 Set-Cookie 내려줄 때) withCredentials로 전송됨
    setAuthed(true);
  };

  const logout = async () => {
    try {
      await api.post("/users/log-out");
    } catch {/* ignore */}
    localStorage.removeItem("accessToken");
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
