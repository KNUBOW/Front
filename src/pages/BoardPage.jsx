// src/pages/BoardPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TopBar from "../components/TopBar";
import TopNav from "../components/TopNav";
import TabBar from "../components/TabBar";
import "../styles/TopShell.css";
import "../styles/BoardPage.css";

/**
 * ✅ 요청 전략
 * - 기본은 쿠키 세션 사용 (withCredentials: true)
 * - 로컬스토리지에 accessToken이 있으면 Authorization: Bearer <token> 자동 첨부
 *   (백엔드가 Bearer를 요구하는 경우도 대응)
 * - 401 발생 시: 로그인 페이지로 유도 (필요하면 메시지 표시)
 */

// axios 인스턴스 (쿠키 & 프록시)
const api = axios.create({
  baseURL: "/api",           // vite 프록시: /api -> target 서버
  withCredentials: true,     // 쿠키 포함
  timeout: 15_000,
});

// 요청 인터셉터: 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  // 기본 Accept 헤더
  if (!config.headers?.accept) {
    config.headers = { ...config.headers, accept: "application/json" };
  }
  return config;
});

/** 안전한 필드 추출 유틸 */
const pick = (obj, keys, fallback = "") =>
  keys.reduce((v, k) => (v ?? obj?.[k]), undefined) ?? fallback;

const BoardPage = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 사용자가 탭 이동해도 메모리 누수 방지를 위한 abort + mounted flag
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
      abortRef.current.abort(); // 이전 요청 취소
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErr(null);

    try {
      const params = { skip, limit };
      if (title) params.title = title; // 인코딩된 값 사용 가능: "%EC%A0%95"

      // /api/board/list -> 프록시를 통해 실제 서버로 전달
      const res = await api.get("/board/list", {
        params,
        signal: controller.signal,
      });

      // 배열 또는 {items: []} 대응
      const list = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
      if (!mountedRef.current) return;
      setPosts(list);
    } catch (e) {
      if (!mountedRef.current) return;
      // 요청 취소는 무시
      if (axios.isCancel(e)) return;

      console.error("[게시판 목록 실패]", e);

      // 401 → 인증 필요
      if (e?.response?.status === 401) {
        setErr("로그인이 필요해요. 로그인 후 다시 시도해 주세요.");
        // 필요 시 자동 이동:
        // navigate("/login", { replace: true });
      } else {
        setErr("게시글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // 최초 로드
  useEffect(() => {
    mountedRef.current = true;
    fetchList({ skip: 0, limit: 100, title: "%EC%A0%95" }); // 필요 없으면 title 제거

    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 새로고침(재시도)
  const handleRetry = () => fetchList({ skip: 0, limit: 100 });

  return (
    <div className="board-page">
      <div className="board-wrap">
        <TopBar />
        <TopNav items={navItems} />

        {/* 중앙만 스크롤 */}
        <main className="board-content" role="main" aria-label="게시판 피드">
          {/* 상태별 UI */}
          {loading && <p>로딩 중…</p>}

          {!loading && err && (
            <div className="error-area" role="alert">
              <p>{err}</p>
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

                  {/* 미디어/타이틀 (슬라이드 점은 데코) */}
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
            <button className="write-btn" type="button" onClick={() => navigate("/board/write")}>
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
