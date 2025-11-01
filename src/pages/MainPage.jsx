import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/TopShell.css";
import "../styles/MainPage.css";

import searchIcon from "../assets/search_icon.svg";
import sendIcon from "../assets/arrow_circle_icon.svg";
import today_what_eat_icon from "../assets/today_what_eat_icon.png";

const MainPage = () => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);   // 게시판 API 데이터
  const [ranks, setRanks] = useState([]);   // 랭킹 API 데이터
  const [listsLoading, setListsLoading] = useState(false); // 목록 로딩

  const limit = 5; // 랭킹/게시판 표시 개수

  // 🔸 추천 샘플(요청과 무관) — 유지
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
        setListsLoading(true);

        const boardRes = await api.get("/board/list", {
          params: { limit },
          signal: ac.signal,
          withCredentials: true,
        });

        const list = Array.isArray(boardRes.data)
          ? boardRes.data
          : boardRes.data?.data ?? [];
        setPosts(Array.isArray(list) ? list : []);

        const rankRes = await api.get("/recipe/ranking", {
          params: { limit },
          headers: { accept: "application/json" },
          signal: ac.signal,
        });

        setRanks(Array.isArray(rankRes.data) ? rankRes.data : []);
      } catch (e) {
        console.error("[fetchInitialData]", e?.name || e, e?.message || "");
        // 실패해도 샘플로 대체하지 않음 (요청사항)
        setPosts([]);
        setRanks([]);
      } finally {
        setListsLoading(false);
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
              <div className="card-icon" aria-hidden="true">
                <img src={today_what_eat_icon} alt="" width="32" height="32"/>
              </div>
              <h2 id="todayTitle" className="card-title">오늘 뭐 해먹지?</h2>
            </div>

            <form className="search-form" onSubmit={onSubmitTodayWhatEat} role="search" aria-label="재료 검색">
              <div className="search-field">
                <img src={searchIcon} alt="검색 아이콘" className="icon-left" width="20" height="20"/>

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

                <button type="submit" className="icon-button" aria-label="추천 요청" disabled={loading}>
                  <img src={sendIcon} alt="전송 아이콘" className="icon-right" width="24" height="24"/>
                </button>
              </div>
            </form>

            {err && <p className="error-text" role="alert">{err}</p>}
          </section>

          {/* 추천 카드 (샘플 유지) */}
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

          {/* 랭킹 — 샘플 제거, 빈 상태 처리 */}
          <div className="ranking-card main-card" style={{ flex: '0 0 auto' }}>
            <div className="badge">랭킹</div>

            {listsLoading ? (
              <div className="empty" aria-live="polite">랭킹을 불러오는 중…</div>
            ) : rankItems.length > 0 ? (
              <ul className="ranking-list" role="list">
                {rankItems.map((it, idx) => {
                  const title = it.food_name ?? it.title ?? "-";
                  const rawScore = typeof it.count === "number" ? it.count : (typeof it.score === "number" ? it.score : 0);
                  const score = Math.max(0, Math.min(5, Math.round(rawScore)));
                  const reviewCount = typeof it.count === "number" ? it.count : undefined;

                  return (
                    <li key={title + idx} className="ranking-item" role="listitem">
                      <div className="rank-left">
                        <div className="rank-title">{idx + 1}위: {title}</div>
                        <div className="rank-sub">
                          별점: <span className="stars">{'★'.repeat(score)}{'☆'.repeat(5 - score)}</span>
                          {typeof reviewCount === "number" && (
                            <span className="count" aria-label={`리뷰 ${reviewCount}개`}>&nbsp;(리뷰 {reviewCount}개)</span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty" aria-live="polite">아직 랭킹 데이터가 없어요.</div>
            )}
          </div>

          {/* 게시판 — 샘플 제거, 빈 상태 처리 */}
          <div className="board-card main-card" style={{ flex: '0 0 auto' }}>
            <div className="badge">게시판</div>

            {listsLoading ? (
              <div className="empty" aria-live="polite">게시글을 불러오는 중…</div>
            ) : boardItems.length > 0 ? (
              <ul className="board-list" role="list">
                {boardItems.map((it) => {
                  const isApiItem = typeof it.id !== "undefined";
                  const key = isApiItem ? it.id : String(Math.random());
                  const title = it.title ?? "-";
                  const nickname = isApiItem ? (it.author?.nickname ?? "-") : (it.author ?? "-");
                  const created = isApiItem ? formatKST(it.created_at) : "-";
                  const likeCount = isApiItem ? (it.like_count ?? 0) : 0;
                  const hasImage = isApiItem ? !!it.exist_image : false;

                  return (
                    <li
                      key={key}
                      className="board-item"
                      role="listitem"
                      onClick={() => { if (isApiItem) navigate(`/board/${it.id}`); }}
                      style={{ cursor: isApiItem ? 'pointer' : 'default' }}
                    >
                      <div className="board-left">
                        <div className="board-title">
                          {title} {hasImage && <span className="img-badge" aria-label="이미지 포함">🖼️</span>}
                        </div>
                        <div className="board-author">작성자: {nickname}</div>
                      </div>
                      <div className="board-right">
                        <div className="board-meta">
                          <span className="created-at">{created}</span>
                          <span className="likes">♥ {likeCount}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty" aria-live="polite">게시글이 아직 없습니다.</div>
            )}
          </div>
        </div>

        <TabBar />
      </div>
    </div>
  );
};

export default MainPage;
