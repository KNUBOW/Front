// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/LoginPage.css";
import logo from "./../assets/FoodThing.png";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      alert("아이디/비밀번호를 입력해 주세요.");
      return;
    }
    try {
      setSubmitting(true);
      await login(form.email.trim(), form.password); // 쿠키 심기 + /me 갱신
      // 원래 가려던 곳이 있으면 거기로, 없으면 홈으로
      const dest = location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
    } catch (err) {
      console.error("[로그인 실패]", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "로그인에 실패했습니다. 입력 정보를 확인해 주세요.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNaverLogin = () => {
    console.log("naver login"); // TODO: OAuth 연결
  };
  const handleGoogleLogin = () => {
    console.log("google login"); // TODO: OAuth 연결
  };

  return (
    <div className="login-page">
      <div className="login-wrap">
        {/* 상단 로고 영역 */}
        <div className="logo-box" role="img" aria-label="FoodThing 로고">
          <img src={logo} alt="FoodThing" className="logo-img" />
        </div>

        {/* 입력 폼 */}
        <form className="login-form" onSubmit={onSubmit} autoComplete="on">
          <label className="sr-only" htmlFor="email">아이디</label>
          <input
            id="email"
            name="email"
            type="text"
            inputMode="text"
            placeholder="아이디"
            value={form.email}
            onChange={onChange}
            required
          />

          <label className="sr-only" htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={onChange}
            required
          />

          <div className="helper-links" aria-label="도움 링크">
            <button type="button" className="text-link" onClick={() => navigate('/find-id')}>아이디 찾기</button>
            <span className="divider" aria-hidden>│</span>
            <button type="button" className="text-link" onClick={() => navigate('/forgot-password')}>비밀번호 찾기</button>
            <span className="divider" aria-hidden>│</span>
            <button type="button" className="text-link" onClick={() => navigate('/register')}>회원가입</button>
          </div>

          <button type="submit" className="btn-login" disabled={submitting}>
            {submitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 소셜 로그인 */}
        <div className="social-row" aria-label="소셜 로그인">
          <button type="button" className="social-btn naver" onClick={handleNaverLogin} aria-label="네이버로 로그인" title="네이버로 로그인">N</button>
          <button type="button" className="social-btn google" onClick={handleGoogleLogin} aria-label="Google로 로그인" title="Google로 로그인">G</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
