import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/BoardPage.css";

/** YYYY-MM-DD */
const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().split("T")[0];
  } catch {
    return iso;
  }
};

/** 안전 키 생성 (id 없을 때 fallback) */
const safeKey = (id) => id ?? crypto.randomUUID();

function PostCard({ post }) {
  const nickname = post?.author?.nickname ?? "익명";
  const title = post?.title ?? "";
  const content = post?.content ?? "";
  const likeCount = post?.like_count ?? 0;
  const created = fmtDate(post?.created_at);
  const images = useMemo(
    () => (Array.isArray(post?.image_urls) ? post.image_urls.filter(Boolean) : []),
    [post?.image_urls]
  );

  // 여러 장일 때 간단한 인덱스 이동
  const [idx, setIdx] = useState(0);
  const hasImage = images.length > 0;
  const curImg = hasImage ? images[Math.min(idx, images.length - 1)] : null;

  const prev = () => setIdx((v) => (v - 1 + images.length) % images.length);
  const next = () => setIdx((v) => (v + 1) % images.length);

  return (
    <article className="post-card">
      {/* 헤더 */}
      <header className="post-head">
        <div className="post-author">
          <div className="avatar" aria-hidden />
          <div className="meta">
            <div className="name">{nickname}</div>
            <div className="time">{created}</div>
          </div>
        </div>

        <button type="button" className="post-more" aria-label="더보기">
          ⋯
        </button>
      </header>

      {/* 미디어: 정사각형 영역, 이미지가 없어도 자리 유지 */}
      <div className="post-media">
        {hasImage ? (
          <>
            <img
              className="post-img"
              src={curImg}
              alt="게시물 이미지"
              loading="lazy"
              onError={(e) => {
                // 이미지가 깨져도 영역 유지
                e.currentTarget.style.display = "none";
                const cap = e.currentTarget.parentElement.querySelector(".media-inner");
                if (cap) cap.style.display = "flex";
              }}
            />
            {/* 좌/우 네비게이션 (여러 장일 때만) */}
            {images.length > 1 && (
              <>
                <button className="media-nav prev" onClick={prev} aria-label="이전 이미지">
                  ‹
                </button>
                <button className="media-nav next" onClick={next} aria-label="다음 이미지">
                  ›
                </button>
              </>
            )}
            {/* 점 인디케이터 */}
            {images.length > 1 && (
              <div className="dots">
                {images.map((_, i) => (
                  <div key={i} className={`dot ${i === idx ? "active" : ""}`} />
                ))}
              </div>
            )}
            {/* 이미지 로드 실패 시 보여줄 캡션 (기본 숨김) */}
            <div className="media-inner" style={{ display: "none" }}>
              <div className="media-caption">이미지를 불러오지 못했습니다.</div>
            </div>
          </>
        ) : (
          <div className="media-inner">
            <div className="media-caption">이미지가 첨부되지 않은 게시물입니다.</div>
          </div>
        )}
      </div>

      {/* 본문/액션 */}
      <div className="post-body">
        {title && <div className="comment" style={{ fontWeight: 700 }}>{title}</div>}
        {content && <div className="comment">{content}</div>}

        <div className="actions">
          <button type="button" onClick={() => { /* TODO: 좋아요 API */ }}>
            ❤️ 좋아요 {likeCount}
          </button>
          <button type="button" onClick={() => { /* TODO: 댓글 이동 */ }}>
            💬 댓글
          </button>
        </div>
      </div>
    </article>
  );
}

/** 간단 에러 표시 */
function ErrorBox({ error }) {
  if (!error) return null;
  const msg =
    error?.code === "ERR_CANCELED"
      ? "요청이 취소되었습니다. (개발모드/HMR 중복 호출일 수 있어요)"
      : error?.message || String(error);
  return <div className="error-box">⚠ {msg}</div>;
}

export default function BoardPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 최신 요청만 반영
  const reqIdRef = useRef(0);

  useEffect(() => {
    const ac = new AbortController();
    const myReqId = ++reqIdRef.current;

    async function fetchList() {
      try {
        setLoading(true);
        setErr(null);

        const res = await api.get("/board/list", {
          signal: ac.signal,
          withCredentials: true,
        });

        // 백엔드가 배열 or {data:[…]}
        const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];

        if (reqIdRef.current === myReqId) {
          setPosts(list);
        }
      } catch (e) {
        if (e?.code === "ERR_CANCELED") {
          return;
        }
        if (reqIdRef.current === myReqId) {
          setErr(e);
        }
      } finally {
        if (reqIdRef.current === myReqId) {
          setLoading(false);
        }
      }
    }

    fetchList();
    return () => ac.abort();
  }, []);

  return (
    <div className="board-page">
      <TopBar />

      <div className="board-wrap">
        <main className="board-content">
          {loading && <div className="loading">로딩 중…</div>}
          <ErrorBox error={err} />

          {!loading && !err && posts.length === 0 && (
            <div className="empty">게시물이 없습니다.</div>
          )}

          {!loading && !err && posts.map((p) => <PostCard key={safeKey(p.id)} post={p} />)}
        </main>
      </div>

      <div className="write-area">
        <button
          className="write-btn"
          onClick={() => navigate("/board/write")}
          type="button"
        >
          ✍️ 글쓰기
        </button>
      </div>

      {/* 하단 탭 고정 */}
      <div className="tabbar-fixed">
        <TabBar />
      </div>
    </div>
  );
}
