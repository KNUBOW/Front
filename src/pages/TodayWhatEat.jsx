import { useState } from "react";
import TopBar from "../components/TopBar";
import TopNav from "../components/TopNav";
import TabBar from "../components/TabBar";
import "../styles/TopShell.css";
import "../styles/TodayWhatEat.css";

const TodayWhatEat = () => {
  const [q, setQ] = useState("");

  // 상단 탭 항목
  const navItems = [
    { label: "오늘 뭐 해먹지?", to: "/" },
    { label: "추천 요리", to: "/recommend" },
    { label: "게시판", to: "/board" },
    { label: "랭킹", to: "/rank" },
  ];

  const onSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    console.log("추천 검색:", q.trim());
    // TODO: 라우팅/요청 연동
  };

  return (
    <div className="today-page">
      <div className="today-wrap">
        <TopBar />
        <TopNav items={navItems} />

        <main className="content" role="main">
          <section className="search-card" aria-labelledby="todayTitle">
            <div className="card-icon" aria-hidden="true">🍳</div>
            <h1 id="todayTitle" className="card-title">오늘 뭐 해먹지?</h1>

            {/* ✅ 네이버/구글 스타일 단일 검색창 */}
            <form className="search-form" onSubmit={onSubmit} role="search" aria-label="재료 검색">
              <div className="search-field">
                {/* 좌측 돋보기 (input 내부, absolute) */}
                <svg className="icon-left" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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
                  aria-label="재료 입력"
                />

                {/* 우측 제출 버튼 (input 내부, absolute) */}
                <button type="submit" className="icon-right" aria-label="레시피 추천 검색">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 21l19-9L2 3v7l13 2-13 2v7z" fill="currentColor" />
                  </svg>
                </button>
              </div>
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
};

export default TodayWhatEat;
