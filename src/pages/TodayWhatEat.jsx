// src/pages/TodayWhatEat.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/todayWhatEat.css";
import logo from "./../assets/FoodThing.png";

const TodayWhatEat = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    console.log("추천 검색:", q.trim());
    // TODO: 추천 API 연동
  };

  return (
    <div className="today-page">
      {/* LoginPage와 동일한 중앙 래퍼 (max-width:430px) */}
      <div className="today-wrap">
        {/* 상단바 */}
        <header className="topbar" aria-label="브랜드 헤더">
          <div className="brand">
            <img src={logo} alt="FoodThing" />
          </div>
        </header>

        {/* 상단 내비 */}
        <nav className="topnav-bar" aria-label="상단 메뉴">
          <div className="topnav" role="tablist" aria-label="탭 메뉴">
            <button
              type="button"
              className="topnav-item active"
              aria-current="page"
            >
              오늘 뭐 해먹지?
            </button>
            <button
              type="button"
              className="topnav-item"
              onClick={() => navigate("/recommend")}
            >
              추천 요리
            </button>
            <button
              type="button"
              className="topnav-item"
              onClick={() => navigate("/board")}
            >
              게시판
            </button>
            <button
              type="button"
              className="topnav-item"
              onClick={() => navigate("/rank")}
            >
              랭킹
            </button>
          </div>
        </nav>

        {/* 본문 */}
        <main className="content" role="main">
          <section className="search-card" aria-labelledby="todayTitle">
            <div className="card-icon" aria-hidden="true">🍳</div>
            <h1 id="todayTitle" className="card-title">
              오늘 뭐 해먹지?
            </h1>

            <form className="search-row" onSubmit={onSubmit} role="search">
              <div className="search-input">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M10 2a8 8 0 015.66 13.66l3.34 3.34a1 1 0 11-1.41 1.41l-3.34-3.34A8 8 0 1110 2zm0 2a6 6 0 100 12A6 6 0 0010 4z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  type="text"
                  name="ingredients"
                  placeholder="재료를 입력해 보세요 (예: 계란, 양파, 햄)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  autoComplete="off"
                  inputMode="text"
                />
              </div>
              <button type="submit" className="btn-recommend">
                추천
              </button>
            </form>

            <div className="tips" aria-live="polite">
              <p className="tip-title">💡 사용 꿀팁</p>
              <p className="tip-body">
                &quot;오늘 뭐 먹지?&quot; 고민될 때, 집에 있는 재료만 입력해보세요!<br />
                예: 계란, 양파, 햄 → 오믈렛, 볶음밥 등 추천 요리 등장!<br />
                복잡한 재료 이름 몰라도 OK! 떠오르는 재료부터 가볍게 입력해보세요.
              </p>
            </div>
          </section>
        </main>

        {/* 하단 탭바 */}
        <footer className="tabbar" aria-label="하단 탭바">
          <div className="tab-inner">
            <button
              type="button"
              className="tab-item"
              onClick={() => navigate("/box")}
            >
              <div className="tab-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 6h12V4H6v4z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span>Box</span>
            </button>

            <button
              type="button"
              className="tab-item"
              onClick={() => navigate("/recipes")}
            >
              <div className="tab-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    d="M6 3h12a1 1 0 011 1v16l-4-2-4 2-4-2-4 2V4a1 1 0 011-1h2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span>Recipe</span>
            </button>

            <button
              type="button"
              className="tab-item home-active"
              onClick={() => navigate("/")}
            >
              <div className="home-hex" aria-hidden="true">
                <svg viewBox="0 0 100 100" width="44" height="44">
                  <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" fill="#F2B705" />
                  <path
                    d="M30 50l20-14 20 14h-6l-14-9.5L36 50h-6z M35 68V52h30v16h-6V58H41v10h-6z"
                    fill="#000"
                  />
                </svg>
              </div>
              <span>Home</span>
            </button>

            <button
              type="button"
              className="tab-item"
              onClick={() => navigate("/likes")}
            >
              <div className="tab-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    d="M12 21s-7-4.3-9.3-8A5.3 5.3 0 0112 6.7 5.3 5.3 0 0121.3 13c-2.3 3.7-9.3 8-9.3 8z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span>Like</span>
            </button>

            <button
              type="button"
              className="tab-item"
              onClick={() => navigate("/settings")}
            >
              <div className="tab-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M12 8a4 4 0 110 8 4 4 0 010-8z" fill="currentColor" />
                </svg>
              </div>
              <span>Settings</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TodayWhatEat;
