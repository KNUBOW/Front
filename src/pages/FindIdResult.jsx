import { useLocation, useNavigate } from "react-router-dom";
import "./../styles/findid.css";
import logo from "./../assets/FoodThing.png";

const FindIdResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 방어적 문자열 변환
  const email = (() => {
    const raw = state?.email;

    if (typeof raw === "string") return raw;
    if (raw && typeof raw === "object") {
      const v = raw.user_email ?? raw.email ?? "";
      return typeof v === "string" ? v : JSON.stringify(v);
    }
    return "";
  })();

  // state 없이 직접 접근 시 가드
  if (!email) {
    return (
      <div className="findid-page">
        <div className="findid-wrap">
          <div className="logo-box" role="img" aria-label="FoodThing 로고">
            <img src={logo} alt="FoodThing" className="logo-img" />
          </div>

          <p className="result-desc">조회 결과가 없습니다. 다시 시도해 주세요.</p>

          <div className="result-actions">
            <button className="btn-primary" onClick={() => navigate("/find-id")}>
              다시 조회하기
            </button>
            <button className="btn-primary" onClick={() => navigate("/login")}>
              로그인으로
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <button className="btn-primary" onClick={() => navigate("/login")}>
            확인
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate("/reset-password", { state: { email } })}
          >
            비밀번호 재설정
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindIdResult;
