import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import TopNav from "../components/TopNav";
import TabBar from "../components/TabBar";
import api from "../lib/api";          // ✅ 공용 axios 인스턴스 사용
import "../styles/TopShell.css";
import "../styles/BoardPage.css";

/** 안전한 필드 추출 유틸 */
const pick = (obj, keys, fallback = "") =>
  keys.reduce((v, k) => (v ?? obj?.[k]), undefined) ?? fallback;

const BoardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // abort + mounted flag
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

  // 게시글 목록 가져오기
  const fetchList = async ({ skip = 0, limit = 100, title } = {}) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErr(null);

    try {
      const params = { skip, limit };
      if (title) params.title = title;

      const res = await api.get("/board/list", {
        params,
        signal: controller.signal,
      });

      const list = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
      if (!mountedRef.current) return;
      setPosts(list);
    } catch (e) {
      if (!mountedRef.current) return;
      if (e.name === "CanceledError") return; // 요청 취소 무시

      console.error("[게시판 목록 실패]", e);

      if (e?.response?.status === 401) {
        setErr("로그인이 필요해요. 로그인 후 다시 시도해 주세요.");
      } else {
        setErr("게시글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // 라우트 진입/복귀 시마다 fetch (방법 1)
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
        <TopBar />
        <TopNav items={navItems} />

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
              const id = pick(post, ["id", "boardId", "_id"], Math.random().toString(36));
              const title = pick(post, ["title"], "제목 없음");
              const content = pick(post, ["content", "body"], "");
              const author = pick(post, ["author", "writer", "nickname"], "익명");
              const createdAt = pick(post, ["createdAt", "created_at", "regDate"], "");
              const likes = pick(post, ["likes", "like", "likeCount"], 0);

              return (
                <article key={id} className="post-card" aria-label="피드 게시글">
                  <header className="post-head">
                    <div className="post-author">
                      <div className="avatar" aria-hidden="true" />
                      <div className="meta">
                        <strong className="name">{author}</strong>
                        {createdAt && <span className="time">• {createdAt}</span>}
                      </div>
                    </div>
                    <button className="post-more" aria-label="더보기 메뉴">•••</button>
                  </header>

                  <div className="post-media" role="img" aria-label="게시 미디어">
                    <div className="media-inner">
                      <p className="media-caption">{title}</p>
                    </div>
                    <div className="dots" aria-hidden="true">
                      <span className="dot active" />
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                  </div>

                  <div className="post-body">
                    <div className="likes" aria-label="좋아요 수">
                      <span className="heart" role="img" aria-label="좋아요">❤️</span>
                      <strong>{likes}</strong>
                    </div>
                    {content && <p className="comment">{content}</p>}
                    <div className="actions">
                      <button className="btn-like" type="button" aria-label="좋아요">❤️</button>
                      <button className="btn-reply" type="button" aria-label="답글">⟳</button>
                    </div>
                  </div>
                </article>
              );
            })}

          <div className="write-area">
            <button
              className="write-btn"
              type="button"
              onClick={() => navigate("/board/write")}
            >
              글 쓰기
            </button>
          </div>
        </main>

        <TabBar />
      </div>
    </div>
  );
};

export default BoardPage;
