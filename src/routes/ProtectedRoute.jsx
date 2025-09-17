// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { authed, loading } = useAuth();
  const location = useLocation();

  // ★ Auth 초기화/로그인 진행 중이면 리다이렉트하지 말고 로딩만
  if (loading) {
    return <div style={{ padding: 24, textAlign: "center" }}>Loading…</div>;
  }

  // 미인증이면 로그인 페이지로
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 인증 OK → 자식 라우트 표시
  return <Outlet />;
}
