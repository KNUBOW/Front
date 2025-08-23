import React, { useState } from 'react';
import '../styles/LoginPage.css';
import logo from "./../assets/foodthing-logo.png"

const LoginPage = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    
    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Logging in with:', form);
    };

    const handleNaverLogin = () => {
        // TODO: 네이버 OAuth 연결
        console.log("naver login");
    };

    const handleGoogleLogin = () => {
        // TODO: 구글 OAuth 연결
        console.log("google login");
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
          <label className="sr-only" htmlFor="username">아이디</label>
          <input
            id="username"
            name="username"
            type="text"
            inputMode="text"
            placeholder="아이디"
            value={form.username}
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

          {/* 하단 링크들 */}
          <div className="helper-links" aria-label="도움 링크">
            <button type="button" className="text-link" onClick={() => alert("아이디 찾기 이동")}>
              아이디 찾기
            </button>
            <span className="divider" aria-hidden>│</span>
            <button type="button" className="text-link" onClick={() => alert("비밀번호 찾기 이동")}>
              비밀번호 찾기
            </button>
            <span className="divider" aria-hidden>│</span>
            <button type="button" className="text-link" onClick={() => alert("회원가입 이동")}>
              회원가입
            </button>
          </div>

          <button type="submit" className="btn-login">로그인</button>
        </form>

        {/* 소셜 로그인 */}
        <div className="social-row" aria-label="소셜 로그인">
          <button
            type="button"
            className="social-btn naver"
            onClick={handleNaverLogin}
            aria-label="네이버로 로그인"
            title="네이버로 로그인"
          >
            N
          </button>
          <button
            type="button"
            className="social-btn google"
            onClick={handleGoogleLogin}
            aria-label="Google로 로그인"
            title="Google로 로그인"
          >
            G
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
