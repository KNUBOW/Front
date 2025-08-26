import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./../styles/findid.css";
import logo from "./../assets/FoodThing.png";

const FindIdResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || "";

  return (
    <div className="findid-page">
      <div className="findid-wrap">
        <div className="logo-box" role="img" aria-label="FoodThing 로고">
          <img src={logo} alt="FoodThing" className="logo-img" />
        </div>

        <p className="result-desc">고객님의 정보와 일치하는 이메일입니다.</p>

        <div className="result-input">
          <input type="text" value={email} readOnly aria-label="조회된 이메일" />
        </div>

        <div className="result-actions">
          <button className="btn-primary" onClick={() => navigate("/login")}>확인</button>
          <button className="btn-primary" onClick={() => navigate("/reset-password", { state: { email } })}>
            비밀번호 재설정
          </button>
        </div>
      </div>
    </div>
  );
}
export default FindIdResult;
