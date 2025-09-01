import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TopBar from "../components/TopBar";
import TopNav from "../components/TopNav";
import TabBar from "../components/TabBar";
import "../styles/TopShell.css";
import "../styles/BoardPage.css";

const api = axios.create({
  baseURL: "/api", // vite.config.js에서 /api -> target 으로 프록시
});

const BoardPage = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const navItems = [
    { label: "오늘 뭐 해먹지?", to: "/" },
    { label: "추천 요리", to: "/recommend" },
    { label: "게시판", to: "/board" },
    { label: "랭킹", to: "/rank" },
  ];

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      setErr(null);
      try {
        // /api/board/list -> http://augustzero.mooo.com/board/list 로 프록시
        const res = await api.get("/board/list", {
          params: { skip: 0, limit: 100, title: "%EC%A0%95" },
          headers: { accept: "application/json" },
        });

        // 배열 또는 {items: []} 대응
        const list = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
        setPosts(list);
      } catch (e) {
        console.error("[게시판 목록 실패]", e);
        setErr("게시글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  // 안전한 필드 추출 유틸
  const pick = (obj, keys, fallback = "") =>
    keys.reduce((v, k) => (v ?? obj?.[k]), undefined) ?? fallback;

  return (
    <div className="board-page">
      <div className="board-wrap">
        <TopBar />
        <TopNav items={navItems} />

        {/* 중앙만 스크롤 */}
        <main className="board-content" role="main" aria-label="게시판 피드">
          {loading && <p>로딩 중…</p>}
          {!loading && err && <p>{err}</p>}
          {!loading && !err && posts.length === 0 && <p>게시글이 없습니다.</p>}

          {!loading &&
            !err &&
            posts.map((post) => {
              const id = pick(post, ["id", "boardId", "_id"], Math.random());
              const title = pick(post, ["title"], "제목 없음");
              const content = pick(post, ["content", "body"], "");
              const author = pick(post, ["author", "writer", "nickname"], "익명");
              const createdAt = pick(post, ["createdAt", "created_at", "regDate"], "");
              const likes = pick(post, ["likes", "like", "likeCount"], 0);

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
                    <button className="post-more" aria-label="더보기 메뉴">•••</button>
                  </header>

                  {/* 미디어/타이틀 */}
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

                  {/* 본문/액션 */}
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

          {/* 글쓰기 이동 (필요 시 라우트 연결) */}
          <div className="write-area">
            <button className="write-btn" type="button">
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
