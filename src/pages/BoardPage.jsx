import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import TopNav from "../components/TopNav";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/TopShell.css";
import "../styles/BoardPage.css";

/** 안전한 필드 추출 */
const pick = (obj, keys, fallback = "") =>
  keys.reduce((v, k) => (v ?? obj?.[k]), undefined) ?? fallback;

/** YYYY-MM-DD */
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return dateStr;
  }
};

const BoardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  const navItems = useMemo(
    () => [
      { label: "오늘 뭐 해먹지?", to: "/" },
      { label: "추천 요리", to: "/recommend" },
      { label: "게시판", to: "/board" },
      { label: "랭킹", to: "/rank" },
    ],
    []
  );

  /** 목록 가져오기 */
  const fetchList = async ({ skip = 0, limit = 100 } = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErr(null);

    try {
      const res = await api.get("/board/list", {
        params: { skip, limit },
        signal: controller.signal,
      });
      const list = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
      if (!mountedRef.current) return;
      setPosts(list);
    } catch (e) {
      if (!mountedRef.current) return;
      if (e.name === "CanceledError") return;
      console.error("[게시판 목록 실패]", e);
      setErr(
        e?.response?.status === 401
          ? "로그인이 필요해요. 로그인 후 다시 시도해 주세요."
          : "게시글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // 라우트 진입/복귀 시마다 최신 목록
  useEffect(() => {
    mountedRef.current = true;
    fetchList({ skip: 0, limit: 100 });
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [location.pathname]);

  const handleRetry = () => fetchList({ skip: 0, limit: 100 });

  return (
    <div className="board-page">
      <div className="board-wrap">
        {/* 상단 */}
        <TopBar />
        <TopNav items={navItems} />

        {/* 중앙 스크롤 영역 */}
        <main className="board-content" role="main" aria-label="게시판 피드">
          {loading && <p>로딩 중…</p>}

          {!loading && err && (
            <div className="error-area" role="alert">
              <p>{err}</p>
              <div className="error-actions">
                <button className="retry-btn" type="button" onClick={handleRetry}>
                  다시 시도
                </button>
                <button
                  className="login-btn"
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  로그인 하러 가기
                </button>
              </div>
            </div>
          )}

          {!loading && !err && posts.length === 0 && <p>게시글이 없습니다.</p>}

          {!loading &&
            !err &&
            posts.map((post) => {
              const id = pick(
                post,
                ["id", "board_id", "boardId", "_id"],
                Math.random().toString(36)
              );
              const title = pick(post, ["title"], "제목 없음");
              const content = pick(post, ["content", "body"], "");
              const author = pick(post, ["author", "writer", "nickname"], "익명");
              const createdAt = formatDate(
                pick(post, ["created_at", "createdAt", "regDate"], "")
              );
              const likeCount = pick(post, ["like_count"], 0);
              const imageUrl = pick(post, ["image", "imgUrl", "photo"], null);

              return (
                <article key={id} className="post-card" aria-label="피드 게시글">
                  {/* 헤더 */}
                  <header className="post-head">
                    <div className="post-author">
                      <div className="avatar" aria-hidden="true" />
                      <div className="meta">
                        <strong className="name">{author}</strong>
                        {createdAt && <span className="time">• {createdAt}</span>}
                      </div>
                    </div>
                    <button className="post-more" aria-label="더보기 메뉴">
                      •••
                    </button>
                  </header>

                  {/* 미디어: 항상 정사각형 */}
                  <div className="post-media" role="img" aria-label="게시 미디어">
                    {imageUrl ? (
                      <img src={imageUrl} alt={title} className="post-img" />
                    ) : (
                      <div className="media-inner">
                        <p className="media-caption">{title}</p>
                      </div>
                    )}
                    <div className="dots" aria-hidden="true">
                      <span className="dot active" />
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                  </div>

                  {/* 본문/액션 */}
                  <div className="post-body">
                    <div className="likes" aria-label="좋아요 수">
                      <span className="heart" role="img" aria-label="좋아요">
                        ❤️
                      </span>
                      <strong>{likeCount}</strong>
                    </div>
                    {content && <p className="comment">{content}</p>}
                    <div className="actions">
                      <button className="btn-like" type="button" aria-label="좋아요">
                        ❤️
                      </button>
                      <button className="btn-reply" type="button" aria-label="답글">
                        ⟳
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
        </main>

        {/* 하단 */}
        <div className="write-area">
          <button
            className="write-btn"
            type="button"
            onClick={() => navigate("/board/write")}
          >
            글 쓰기
          </button>
        </div>
        <div className="tabbar-fixed">
          <TabBar />
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
