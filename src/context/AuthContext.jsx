// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // 세션 체크 로딩

  // 앱 시작 시 세션 확인
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/users/me"); // 서버 경로에 맞게
        setProfile(data);
        setAuthed(true);
      } catch {
        setAuthed(false);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 로그인: 토큰 저장 X, 단지 서버가 Set-Cookie 하도록 요청
  const login = async (email, password) => {
    await api.post("/users/log-in", { email, password }); // withCredentials로 쿠키 심어짐
    // 로그인 직후 프로필 갱신
    const { data } = await api.get("/users/me");
    setProfile(data);
    setAuthed(true);
  };

  // 로그아웃: 서버에 쿠키 삭제 요청
  const logout = async () => {
    try {
      await api.post("/users/log-out"); // 서버에서 clearCookie 수행
    } catch {
      // ignore
    } finally {
      setAuthed(false);
      setProfile(null);
    }
  };

  const value = useMemo(
    () => ({ authed, profile, loading, login, logout }),
    [authed, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
