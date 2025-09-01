import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';
import logo from "./../assets/FoodThing.png"

const api = axios.create({
  baseURL: "/api",           
})

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // validate 나중에 추가하기

    try {
      const res = await api.post("/users/log-in", {
        email: form.email,
        password: form.password,
      });
      console.log(res.data);
      alert("로그인 성공!");
      navigate("/"); // 메인 페이지로 이동
    } catch (err) {
      console.error("[로그인 실패]", err);

      if (!err?.response) {
        alert("네트워크 오류 또는 프록시 설정을 확인해 주세요.");
        return;
      }
    }
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

          {/* 하단 링크들 */}
          <div className="helper-links" aria-label="도움 링크">
            <button type="button" className="text-link" onClick={() => navigate('/find-id')}>
              아이디 찾기
            </button>
            <span className="divider" aria-hidden>│</span>
            <button type="button" className="text-link" onClick={() => navigate('/forgot-password')}>
              비밀번호 찾기
            </button>
            <span className="divider" aria-hidden>│</span>
            <button type="button" className="text-link" onClick={() => navigate('/register')}>
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
