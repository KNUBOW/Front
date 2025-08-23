import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "./../assets/foodthing-logo.png";
import "../styles/password.css";

const ResetPassword = () => {
  const { state } = useLocation();              // find 단계에서 넘긴 email/token 사용
  const email = state?.email || "";
  const navigate = useNavigate();

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

  const validate = () => {
    if (pw.length < 6) return alert("비밀번호는 6자 이상 입력해 주세요.");
    if (pw !== pw2) return alert("비밀번호가 서로 일치하지 않습니다.");
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // TODO: 실제 재설정 API 호출
    // await axios.post('/api/auth/reset-password', { token: state.token, password: pw });

    alert("비밀번호가 재설정되었습니다.");
    navigate("/login");
  };

  return (
    <div className="pw-page">
      <div className="pw-wrap">
        <div className="logo-box"><img src={logo} alt="FoodThing" className="logo-img" /></div>

        {/* 안내 문구가 필요하면 여기에 추가 */}
        {email && <p className="hint-email">{email}</p>}

        <form className="pw-form" onSubmit={onSubmit}>
          <div className="pw-field">
            <label className="sr-only" htmlFor="newPw">새 비밀번호</label>
            <input
              id="newPw"
              type={show ? "text" : "password"}
              placeholder="새 비밀번호"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              minLength={6}
              required
            />
            <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)} aria-label="비밀번호 보기 토글">
              {show ? "숨김" : "표시"}
            </button>
          </div>

          <div className="pw-field">
            <label className="sr-only" htmlFor="newPw2">새 비밀번호 확인</label>
            <input
              id="newPw2"
              type={show2 ? "text" : "password"}
              placeholder="새 비밀번호 확인"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              minLength={6}
              required
            />
            <button type="button" className="pw-toggle" onClick={() => setShow2((s) => !s)} aria-label="비밀번호 보기 토글">
              {show2 ? "숨김" : "표시"}
            </button>
          </div>

          <button type="submit" className="btn-primary">비밀번호 재설정</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;