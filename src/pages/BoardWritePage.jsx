import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import "../styles/TopShell.css";
import "../styles/BoardWritePage.css";

// 공용 axios 인스턴스 (쿠키/토큰 포함)
import api from "../lib/api";

export default function BoardWrite() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);     // 업로드 파일
  const [preview, setPreview] = useState(""); // 미리보기 URL
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // 백엔드 spec의 content
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const inputRef = useRef(null);

  const onPickImage = () => inputRef.current?.click();

  const onFileChange = (e) => {
    setErr("");
    const f = e.target.files?.[0];
    if (!f) return;

    // 간단 유효성: 이미지 & 10MB 이하
    if (!/^image\//.test(f.type)) {
      setErr("이미지 파일만 업로드할 수 있어요.");
      e.target.value = "";
      return;
    }
    const MAX = 10 * 1024 * 1024;
    if (f.size > MAX) {
      setErr("파일이 너무 커요. 10MB 이하로 올려 주세요.");
      e.target.value = "";
      return;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const onRemoveImage = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const onCancel = () => {
    if (preview) URL.revokeObjectURL(preview);
    navigate(-1);
  };

  // ✅ API Spec에 맞춘 업로드
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!title.trim()) {
      setErr("제목을 입력해 주세요.");
      return;
    }
    if (!content.trim()) {
      setErr("내용(캡션)을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("content", content.trim());
      if (file) {
        // 백엔드 스펙: 필드명은 images (단수 파일도 images로 보냄)
        form.append("images", file);
      }

      const res = await api.post("/board", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        validateStatus: () => true, // 직접 상태코드 처리
      });

      if (res.status === 201) {
        // { board_id: number }
        navigate("/board", { replace: true });
      } else if (res.status === 401) {
        setErr("로그인이 필요해요. 로그인 후 다시 시도해 주세요.");
      } else {
        setErr("업로드에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    } catch (e) {
      console.error("[게시글 작성 실패]", e);
      setErr("업로드 중 오류가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="boardwrite-page">
      <div className="boardwrite-wrap">
        <TopBar />

        <main className="boardwrite-content" role="main" aria-label="게시글 작성">
          <h1 className="bw-title">새 게시물</h1>

          {/* 이미지 업로드 */}
          <section className="bw-media">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onFileChange}
              aria-label="사진 파일 선택"
            />

            {!preview ? (
              <button
                type="button"
                className="bw-drop"
                onClick={onPickImage}
                aria-label="사진 넣기"
              >
                <span className="bw-drop-text">사진 넣기</span>
              </button>
            ) : (
              <div className="bw-preview" role="img" aria-label="선택한 사진 미리보기">
                <img src={preview} alt="선택한 사진" />
                <button
                  type="button"
                  className="bw-remove"
                  onClick={onRemoveImage}
                  aria-label="사진 지우기"
                >
                  ×
                </button>
              </div>
            )}
          </section>

          {/* 제목 */}
          <section className="bw-input-area">
            <label htmlFor="title" className="sr-only">제목</label>
            <input
              id="title"
              className="bw-input"
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              inputMode="text"
            />
          </section>

          {/* 내용(캡션) -> content 필드로 전송 */}
          <section className="bw-input-area">
            <label htmlFor="content" className="sr-only">내용</label>
            <input
              id="content"
              className="bw-input"
              type="text"
              placeholder="캡션 추가..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={300}
              inputMode="text"
            />
          </section>

          {/* 오류 */}
          {err && (
            <p className="bw-error" role="alert">
              {err}
            </p>
          )}

          {/* 버튼 */}
          <div className="bw-actions">
            <button
              type="button"
              className="bw-btn bw-cancel"
              onClick={onCancel}
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="button"
              className="bw-btn bw-submit"
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting ? "공유 중..." : "공유하기"}
            </button>
          </div>
        </main>

        <TabBar />
      </div>
    </div>
  );
}
