import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SettingsPage.css";

function decodeJwtPayload(token) {
  try {
    if (!token) return null;

    const t = String(token).split(" ").pop();
    const parts = t.split(".");
    if (parts.length < 2) return null;

    let payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = payloadB64.length % 4;
    if (pad) payloadB64 += "=".repeat(4 - pad);

    const json = decodeURIComponent(
      atob(payloadB64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const obj = JSON.parse(json);

    return obj;
  } catch (err) {
    console.error("decodeJwtPayload error:", err);
    return null;
  }
}

function getCookie(name) {
  const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return m ? m.pop() : "";
}

const SettingsPage = () => {
  const nav = useNavigate();
  const [notifyOn, setNotifyOn] = useState(true);
  const [profileName, setProfileName] = useState("게스트");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      getCookie("access_token") ||
      "";

    const payload = token ? decodeJwtPayload(token) : null;

    console.log("JWT payload:", payload);

    if (payload) {
      const name =
        payload.nickname ||
        payload.preferred_username ||
        payload.name ||
        payload.username ||
        payload.email ||
        payload.sub ||
        "게스트";
      setProfileName(String(name));
    }
  }, []);

  const onBack = () => nav(-1);

  const onClose = () => nav("/");
  const onSave = () => {
    alert(`저장 완료\n알림: ${notifyOn ? "ON" : "OFF"}`);
    nav("/");
  };

  const onLogout = () => setShowLogoutModal(true);
  const onCancelLogout = () => setShowLogoutModal(false);
  const onConfirmLogout = async () => {
    try {
      // optional server logout
    } catch (_) {
    } finally {
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");
      document.cookie = "access_token=; Max-Age=0; path=/";
      nav("/login");
    }
  };

  const onResetTaste = () => {
    alert("음식 성향을 초기화 합니다.");
  };

  return (
    <div className="settingsPage-root">
      <header className="settingsPage-topbar" role="banner">
        <button className="settingsPage-back-btn" aria-label="뒤로가기" onClick={onBack}>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="settingsPage-topbar-title">설정</h1>
      </header>

      <main className="settingsPage-content" role="main">
        <section className="settingsPage-profile-row" aria-label="프로필">
          <div className="settingsPage-avatar" aria-hidden="true" />
          <div className="settingsPage-profile-name">{profileName}</div>
        </section>

        <hr className="settingsPage-sep" />

        <section className="settingsPage-section">
          <h2 className="settingsPage-section-title">알림 설정</h2>

          <button
            className="settingsPage-item-row"
            onClick={() => setNotifyOn(v => !v)}
            aria-pressed={notifyOn}
          >
            <div className="settingsPage-item-left">
              <div className="settingsPage-item-icon bell" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="settingsPage-item-texts">
                <div className="settingsPage-item-title">알림 받기</div>
                <div className="settingsPage-item-sub">좋아요, 댓글, 이벤트 참여 등 소식</div>
              </div>
            </div>

            <span className={`settingsPage-toggle ${notifyOn ? "on" : "off"}`} aria-hidden="true">
              <span className="settingsPage-knob" />
            </span>
          </button>

          <hr className="settingsPage-sub-sep" />
        </section>

        <section className="settingsPage-section">
          <h2 className="settingsPage-section-title">음식 성향</h2>

          <button className="settingsPage-item-row arrow" onClick={onResetTaste}>
            <div className="settingsPage-item-left">
              <div className="settingsPage-item-icon utensil" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    d="M7 2v7a2 2 0 1 1-2 0V2H4v7a4 4 0 1 0 6 0V2H7Zm9 0a4 4 0 0 0-1 7.874V22h2V9.874A4 4 0 0 0 16 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="settingsPage-item-texts">
                <div className="settingsPage-item-title">음식 성향 초기화</div>
              </div>
            </div>

            <svg className="settingsPage-chevron" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </section>

        <div className="settingsPage-footer-actions" role="group" aria-label="설정 액션">
          <button className="btn btn-ghost" onClick={onClose}>닫기</button>
          <button className="btn btn-solid" onClick={onSave}>저장</button>
        </div>

        <button className="settingsPage-logout" onClick={onLogout}>로그아웃</button>
      </main>

      {showLogoutModal && (
        <div className="settingsPage-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="settingsPage-modal" style={{ maxWidth: 360 }}>
            <h3 id="logout-title" style={{ marginTop: 0 }}>로그아웃 하시겠어요?</h3>
            <p style={{ marginTop: 8 }}>네를 누르면 로그인 화면으로 이동합니다.</p>
            <div className="settingsPage-modal-actions" style={{ marginTop: 16 }}>
              <button className="btn left" onClick={onConfirmLogout}>네</button>
              <button className="btn right" onClick={onCancelLogout}>아니요</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
