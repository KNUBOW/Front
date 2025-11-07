import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/BoardDetailPage.css";

/** YYYY-MM-DD 포맷 */
const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().split("T")[0];
  } catch {
    return iso;
  }
};

const BoardDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state?.postId;

  const [post, setPost] = useState(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    document.title = "게시글 상세 - 보드";
    if (id != null) fetchPostDetail(id);
  }, [id]);

  const fetchPostDetail = async (postId) => {
    try {
      const res = await api.get(`/board/${postId}`, { withCredentials: true });
      setPost(res.data);
    } catch (error) {
      console.error("[fetchPostDetail 실패]", error);
    }
  };

  const images = useMemo(
    () =>
      Array.isArray(post?.image_urls)
        ? post.image_urls.filter(Boolean)
        : [],
    [post?.image_urls]
  );

  const hasImage = images.length > 0;
  const curImg = hasImage ? images[Math.min(idx, images.length - 1)] : null;

  const prev = () => setIdx((v) => (v - 1 + images.length) % images.length);
  const next = () => setIdx((v) => (v + 1) % images.length);

  return (
    <div className="board-detail-page">
      <TopBar />

      <div className="board-detail-container">
        <button
          type="button"
          className="detail-back-button"
          onClick={() => navigate("/board")}
        >
          ← 뒤로가기
        </button>

        <div className="board-detail-content">
          {post ? (
            <article className="post-detail-card">
              {/* 헤더 */}
              <header className="post-detail-head">
                <div className="post-detail-author">
                  <div className="post-detail-avatar" aria-hidden />
                  <div className="post-detail-meta">
                    <div className="post-detail-name">
                      {post?.author?.nickname ?? "익명"}
                    </div>
                    <div className="post-detail-time">
                      {fmtDate(post?.created_at)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="post-detail-more"
                  aria-label="더보기"
                >
                  ⋯
                </button>
              </header>

              {/* 미디어 영역 */}
              <div className="post-detail-media">
                {hasImage ? (
                  <>
                    <img
                      className="post-detail-img"
                      src={curImg}
                      alt="게시물 이미지"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const cap =
                          e.currentTarget.parentElement.querySelector(
                            ".detail-media-inner"
                          );
                        if (cap) cap.style.display = "flex";
                      }}
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          className="detail-media-nav prev"
                          onClick={prev}
                          aria-label="이전 이미지"
                          type="button"
                        >
                          ‹
                        </button>
                        <button
                          className="detail-media-nav next"
                          onClick={next}
                          aria-label="다음 이미지"
                          type="button"
                        >
                          ›
                        </button>
                      </>
                    )}
                    {images.length > 1 && (
                      <div className="detail-dots">
                        {images.map((_, i) => (
                          <div
                            key={i}
                            className={`detail-dot ${i === idx ? "active" : ""}`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="detail-media-inner" style={{ display: "none" }}>
                      <div className="detail-media-caption">
                        이미지를 불러오지 못했습니다.
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="detail-media-inner">
                    <div className="detail-media-caption">
                      이미지가 첨부되지 않았습니다.
                    </div>
                  </div>
                )}
              </div>

              {/* 본문 */}
              <div className="post-detail-body">
                {post?.title && (
                  <div className="detail-comment" style={{ fontWeight: 800 }}>
                    {post.title}
                  </div>
                )}
                {post?.content && (
                  <div className="detail-comment">{post.content}</div>
                )}

                <div className="detail-actions">
                  <button type="button">
                    ❤️ 좋아요 {post?.like_count ?? 0}
                  </button>
                  <button type="button">💬 댓글</button>
                </div>
              </div>
            </article>
          ) : (
            <p>게시글을 불러오는 중입니다...</p>
          )}
        </div>
      </div>

      <div className="tabbar-fixed">
        <TabBar />
      </div>
    </div>
  );
};

export default BoardDetailPage;
