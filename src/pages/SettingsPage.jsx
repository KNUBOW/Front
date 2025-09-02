import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SettingsPage.css";

const SettingsPage = () => {
  const nav = useNavigate();
  const [notifyOn, setNotifyOn] = useState(true);

  const onBack = () => nav(-1);
  const onSave = () => {
    // TODO: 서버에 저장 API 연동
    alert(`저장 완료\n알림: ${notifyOn ? "ON" : "OFF"}`);
  };
  const onClose = () => nav(-1);
  const onLogout = () => {
    // TODO: 토큰/세션 정리
    alert("로그아웃");
    // nav("/login");
  };
  const onResetTaste = () => {
    // TODO: 음식 성향 초기화 로직/라우팅
    alert("음식 성향을 초기화 합니다.");
  };

  return (
    <div className="settings-page">
      {/* 상단 바 */}
      <header className="settings-topbar" role="banner">
        <button className="back-btn" aria-label="뒤로가기" onClick={onBack}>
          {/* chevron-left */}
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="topbar-title">설정</h1>
      </header>

      <main className="settings-content" role="main">
        {/* 프로필 */}
        <section className="profile-row" aria-label="프로필">
          <div className="avatar" aria-hidden="true" />
          <div className="profile-name">성민</div>
        </section>

        <hr className="sep" />

        {/* 알림 설정 */}
        <section className="section">
          <h2 className="section-title">알림 설정</h2>

          <button
            className="item-row"
            onClick={() => setNotifyOn((v) => !v)}
            aria-pressed={notifyOn}
          >
            <div className="item-left">
              <div className="item-icon bell" aria-hidden="true">
                {/* bell */}
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z" fill="currentColor" />
                </svg>
              </div>
              <div className="item-texts">
                <div className="item-title">알림 받기</div>
                <div className="item-sub">좋아요, 댓글, 이벤트 참여 등 소식</div>
              </div>
            </div>

            {/* 토글 */}
            <span className={`toggle ${notifyOn ? "on" : "off"}`} aria-hidden="true">
              <span className="knob" />
            </span>
          </button>

          <hr className="sub-sep" />
        </section>

        {/* 음식 성향 */}
        <section className="section">
          <h2 className="section-title">음식 성향</h2>

          <button className="item-row arrow" onClick={onResetTaste}>
            <div className="item-left">
              <div className="item-icon utensil" aria-hidden="true">
                {/* fork & spoon */}
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M7 2v7a2 2 0 1 1-2 0V2H4v7a4 4 0 1 0 6 0V2H7Zm9 0a4 4 0 0 0-1 7.874V22h2V9.874A4 4 0 0 0 16 2Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="item-texts">
                <div className="item-title">음식 성향 초기화</div>
              </div>
            </div>

            {/* chevron-right */}
            <svg className="chevron" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </section>

        {/* 하단 버튼 */}
        <div className="footer-actions" role="group" aria-label="설정 액션">
          <button className="btn btn-ghost" onClick={onClose}>닫기</button>
          <button className="btn btn-solid" onClick={onSave}>저장</button>
        </div>

        {/* 로그아웃 */}
        <button className="logout" onClick={onLogout}>로그아웃</button>
      </main>
    </div>
  );
}

export default SettingsPage;