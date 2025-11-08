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

  const [recommendations, setRecommendations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [ranks, setRanks] = useState([]);

  // 전체 로딩(섹션별로 나눌 수도 있지만 요청대로 전체 하나만 유지)
  const [listsLoading, setListsLoading] = useState(false);

  const limit = 5;

  const formatKST = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const handleBoardItemClick = (id) => {
    if (id == null) return;
    navigate(`/board/details`, { state: { postId: id } });
  };

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
    // ✅ 페이지 진입(마운트) 때마다 fetch 1회
    const ac = new AbortController();

    const fetchInitialData = async () => {
      setListsLoading(true);

      // 동시에 시작 (병렬)
      /*const recommendPromise = api.get("/recipe/card", {
        headers: { accept: "application/json" },
        signal: ac.signal,
      });*/
      const boardPromise = api.get("/board/list", {
        params: { limit },
        withCredentials: true,
        signal: ac.signal,
      });
      const rankPromise = api.get("/recipe/ranking", {
        params: { limit },
        headers: { accept: "application/json" },
        signal: ac.signal,
      });

      // 각 응답이 오는 즉시 UI 반영 (체감속도 개선)
      /*recommendPromise
        .then((res) => {
          const rec = Array.isArray(res?.data?.food_list)
            ? res.data.food_list.slice(0, 5)
            : [];
          setRecommendations(rec);
        })
        .catch((e) => {
          if (e?.code !== "ERR_CANCELED") {
            console.error("[/recipe/card 실패]", e);
            setRecommendations([]); // 실패 시 빈 값
          }
        });*/

      boardPromise
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : res.data?.data ?? [];
          setPosts(Array.isArray(list) ? list : []);
        })
        .catch((e) => {
          if (e?.code !== "ERR_CANCELED") {
            console.error("[/board/list 실패]", e);
            setPosts([]);
          }
        });

      rankPromise
        .then((res) => {
          setRanks(Array.isArray(res.data) ? res.data : []);
        })
        .catch((e) => {
          if (e?.code !== "ERR_CANCELED") {
            console.error("[/recipe/ranking 실패]", e);
            setRanks([]);
          }
        });

      setListsLoading(false);
    };

    fetchInitialData();

    return () => ac.abort();
  }, []); // 의도대로, 마운트마다 실행

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
                <img src={today_what_eat_icon} alt="" width="32" height="32" />
              </div>
              <h2 id="todayTitle" className="card-title">오늘 뭐 해먹지?</h2>
            </div>

            <form className="search-form" onSubmit={onSubmitTodayWhatEat} role="search" aria-label="재료 검색">
              <div className="search-field">
                <img src={searchIcon} alt="검색 아이콘" className="icon-left" width="20" height="20" />
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
                  <img src={sendIcon} alt="전송 아이콘" className="icon-right" width="24" height="24" />
                </button>
              </div>
            </form>

            {err && <p className="error-text" role="alert">{err}</p>}
          </section>

          {/* 추천 카드 (앞 5개만 표시) */}
          {/*<div className="recommend-card main-card" style={{ flex: '0 0 auto' }}>
            <div className="badge">추천 요리</div>

            {listsLoading && recommendations.length === 0 ? (
              <div className="empty" aria-live="polite">추천 요리를 불러오는 중…</div>
            ) : recommendations.length > 0 ? (
              <ul className="recommend-list" role="list">
                {recommendations.map((it, idx) => (
                  <li key={idx} className="recommend-item" role="listitem">
                    <div className="recommend-title">{it.food}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty" aria-live="polite">추천 요리를 불러오는 중…</div>
            )}
          </div> */}

          {/* 랭킹 */}
          <div className="ranking-card main-card" style={{ flex: '0 0 auto' }}>
            <div className="badge">랭킹</div>

            {listsLoading && rankItems.length === 0 ? (
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
              <div className="empty" aria-live="polite">랭킹을 불러오는 중…</div>
            )}
          </div>

          {/* 게시판 */}
          <div className="board-card main-card" style={{ flex: '0 0 auto' }}>
            <div className="badge">게시판</div>

            {listsLoading && boardItems.length === 0 ? (
              <div className="empty" aria-live="polite">게시글을 불러오는 중…</div>
            ) : boardItems.length > 0 ? (
              <ul className="board-list" role="list">
                {boardItems.map((it) => {
                  const title = it.title ?? "-";
                  const nickname = it.author?.nickname ?? "-";
                  const created = formatKST(it.created_at);

                  return (
                    <li
                      key={it.id ?? title}
                      className="board-item"
                      role="listitem"
                      onClick={() => handleBoardItemClick(it.id)}
                      style={{ cursor: it.id ? 'pointer' : 'default' }}
                    >
                      <div className="board-left">
                        <div className="board-title">{title}</div>
                        <div className="board-author">작성자: {nickname}</div>
                      </div>
                      <div className="board-right">
                        <div className="board-meta">
                          <span className="created-at">{created}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty" aria-live="polite">게시글을 불러오는 중…</div>
            )}
          </div>
        </div>

        <TabBar />
      </div>
    </div>
  );
};

export default MainPage;
