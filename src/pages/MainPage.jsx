import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/TopShell.css";
import "../styles/MainPage.css";

const MainPage = () => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);  // 게시판 API 데이터
  const [ranks, setRanks] = useState([]);  // 랭킹 API 데이터

  const limit = 5; // 랭킹/게시판 표시 개수

  // 🔸 샘플(백업용) — API 데이터가 비어있을 때만 사용
  const sampleRecommendations = [
    { food: "된장찌개", time: "30분", ingredients: "두부, 호박, 양파, 된장" },
    { food: "김치 볶음밥", time: "20분", ingredients: "밥, 김치, 계란" },
    { food: "닭갈비", time: "40분", ingredients: "닭고기, 고구마, 양배추" },
    { food: "불고기", time: "35분", ingredients: "소고기, 양파, 당근" },
    { food: "오므라이스", time: "25분", ingredients: "밥, 계란, 케찹" },
  ];

  // ✅ KST 표시 유틸
  const formatKST = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  // 오늘 뭐 해먹지
  const onSubmitTodayWhatEat = async (e) => {
    e.preventDefault();
    setErr("");
    const chat = q.trim();
    if (!chat) return;

    try {
      setLoading(true);
      const res = await api.post(
        "/recipe/ingredient-cook",
        { chat },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      navigate("/recommend/result", { state: { result: res.data, query: chat } });
    } catch (e) {
      console.error("[ingredient-cook 실패]", e);
      setErr("추천 요청에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();

    async function fetchInitialData() {
      try {
        const boardRes = await api.get("/board/list", {
          params: { limit },
          signal: ac.signal,
          withCredentials: true,
        });

        const list = Array.isArray(boardRes.data)
          ? boardRes.data
          : boardRes.data?.data ?? [];
        setPosts(list);

        const rankRes = await api.get("/recipe/ranking", {
          params: { limit },
          headers: { accept: "application/json" },
          signal: ac.signal,
        });

        setRanks(Array.isArray(rankRes.data) ? rankRes.data : []);
      } catch (e) {
        console.error("[fetchInitialData]", e?.name || e, e?.message || "");
      }
    }

    fetchInitialData();
    return () => ac.abort();
  }, []);

  // ✅ 렌더링용 파생 데이터
  const boardItems = useMemo(
    () => (posts && posts.length ? posts.slice(0, limit) : []),
    [posts]
  );

  const rankItems = useMemo(
    () => (ranks && ranks.length ? ranks.slice(0, limit) : []),
    [ranks]
  );

  return (
    <div className="main-page">
      <div className="main-wrap" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopBar />

        <div
          className="main-content"
          role="main"
          style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, flex: 1, overflow: 'auto' }}
        >
          {/* 오늘 뭐 해먹지? */}
          <section className="main-today-what-eat">
            <div className="card-header">
              <div className="card-icon" aria-hidden="true">🍳</div>
              <h2 id="todayTitle" className="card-title">오늘 뭐 해먹지?</h2>
            </div>

            <form className="search-form" onSubmit={onSubmitTodayWhatEat} role="search" aria-label="재료 검색">
              <div className="search-field">
                {/* 좌측 돋보기 */}
                <svg className="icon-left" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M10 2a8 8 0 015.66 13.66l3.34 3.34a1 1 0 11-1.41 1.41l-3.34-3.34A8 8 0 1110 2zm0 2a6 6 0 100 12A6 6 0 0010 4z"
                    fill="currentColor"
                  />
                </svg>

                <input
                  type="text"
                  name="ingredients"
                  placeholder="재료를 입력해 보세요 (예: 양파, 베이컨, 새우)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  autoComplete="off"
                  inputMode="text"
                  aria-label="재료 입력"
                  disabled={loading}
                />

                {/* 우측 제출 버튼 */}
                <button type="submit" className="icon-right" aria-label="레시피 추천 검색" disabled={loading}>
                  {loading ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="spin">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" fill="none" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 21l19-9L2 3v7l13 2-13 2v7z" fill="currentColor" />
                    </svg>
                  )}
                </button>
              </div>
            </form>

            {err && <p className="error-text" role="alert">{err}</p>}
          </section>

          <div className="recommend-card main-card" style={{ flex: '0 0 auto' }}>
            <div className="badge">추천 요리</div>
            <ul className="recommend-list" role="list">
              {sampleRecommendations.map((it, idx) => (
                <li className="recommend-item" key={idx} role="listitem" onClick={() => { /* 상세 이동 등 */ }}>
                  <div className="item-left">
                    <div className="title">{it.food}</div>
                    <div className="sub">조리 시간: <span className="time">{it.time}</span></div>
                  </div>
                  <div className="item-right">
                    {it.ingredients}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="ranking-card main-card" style={{ flex: '0 0 auto' }}>
            <div className="badge">랭킹</div>
            <ul className="ranking-list" role="list">
              {(rankItems.length ? rankItems : sampleRanking).map((it, idx) => {
                const title = it.food_name ?? it.title ?? "-";
                const rawScore = typeof it.count === "number" ? it.count : it.score ?? 0;
                const score = Math.max(0, Math.min(5, Math.round(rawScore)));
                return (
                  <li key={title + idx} className="ranking-item" role="listitem">
                    <div className="rank-left">
                      <div className="rank-title">{idx + 1}위: {title}</div>
                      <div className="rank-sub">
                        별점: <span className="stars">{'★'.repeat(score)}{'☆'.repeat(5 - score)}</span>
                        {typeof it.count === "number" && <span className="count"> </span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="board-card main-card" style={{ flex: '0 0 auto' }}>
            <div className="badge">게시판</div>
            <ul className="board-list" role="list">
              {(boardItems.length ? boardItems : sampleBoard).map((it, idx) => {
                const isApiItem = typeof it.id !== "undefined";
                const key = isApiItem ? it.id : `sample-${idx}`;
                const title = it.title;
                const nickname = isApiItem ? (it.author?.nickname ?? "-") : (it.author ?? "-");
                const created = isApiItem ? formatKST(it.created_at) : undefined;
                const likeCount = isApiItem ? it.like_count ?? 0 : undefined;
                const hasImage = isApiItem ? !!it.exist_image : false;

                return (
                  <li
                    key={key}
                    className="board-item"
                    role="listitem"
                    onClick={() => {
                      if (isApiItem) {
                        navigate(`/board/${it.id}`);
                      }
                    }}
                    style={{ cursor: isApiItem ? 'pointer' : 'default' }}
                  >
                    <div className="board-left">
                      <div className="board-title">
                        {title} {hasImage && <span className="img-badge" aria-label="이미지 포함">🖼️</span>}
                      </div>
                      <div className="board-author">작성자: {nickname}</div>
                    </div>
                    <div className="board-right">
                      {isApiItem ? (
                        <div className="board-meta">
                          <span className="created-at">{created}</span>
                          <span className="likes">♥ {likeCount}</span>
                        </div>
                      ) : (
                        <div className="board-summary">{it.summary}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <TabBar />
      </div>
    </div>
  );
};

export default MainPage;
