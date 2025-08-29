import React, { useState } from "react";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import "../styles/TopShell.css";
import "../styles/TodayWhatEat.css";

export default function TodayWhatEat() {
  const [q, setQ] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    console.log("추천 검색:", q.trim());
  };

  return (
    <div className="today-page">
      <div className="today-wrap">
        <TopBar />

        <nav className="topnav-bar" aria-label="상단 메뉴">
          <div className="topnav" role="tablist" aria-label="탭 메뉴">
            <button type="button" className="topnav-item active" aria-current="page">
              오늘 뭐 해먹지?
            </button>
            <button type="button" className="topnav-item">추천 요리</button>
            <button type="button" className="topnav-item">게시판</button>
            <button type="button" className="topnav-item">랭킹</button>
          </div>
        </nav>

        <main className="content" role="main">
          <section className="search-card" aria-labelledby="todayTitle">
            <div className="card-icon" aria-hidden="true">🍳</div>
            <h1 id="todayTitle" className="card-title">오늘 뭐 해먹지?</h1>

            <form className="search-row" onSubmit={onSubmit} role="search">
              <div className="search-input">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
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
              <button type="submit" className="btn-recommend">추천</button>
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

        <TabBar />
      </div>
    </div>
  );
}
