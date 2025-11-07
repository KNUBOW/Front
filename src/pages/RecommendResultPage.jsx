import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/TopShell.css";
import "../styles/RecommendResultPage.css";

function toText(v) {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);

  // 객체일 때 우선순위: name(+amount/unit) → text/desc → JSON 문자열
  if (typeof v === "object") {
    const name = v.name ?? v.title ?? v.ingredient ?? v.item ?? null;
    const amount = v.amount ?? v.qty ?? v.quantity ?? null;
    const unit = v.unit ?? null;
    const text = v.text ?? v.desc ?? v.description ?? null;

    if (name) {
      const amt = amount != null ? ` ${amount}` : "";
      const un = unit ? ` ${unit}` : "";
      return `${name}${amt}${un}`.trim();
    }
    if (text) return String(text);
    try {
      return JSON.stringify(v);
    } catch {
      return "[object]";
    }
  }
  return String(v);
}

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v == null || v === "") return [];
  // "a, b, c" 같이 올 수도 있음
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (!trimmed) return [];
    if (trimmed.includes(",")) return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    return [trimmed];
  }
  // 단일 객체면 배열로 감싸기
  return [v];
}

export default function RecommendResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const data = location.state?.result || null;

  if (!data) {
    return (
      <div className="result-page">
        <div className="result-wrap">
          <TopBar />
          <TopNav items={navItems} />
          <main className="result-content">
            <div className="empty">
              <p>결과 데이터가 없어요. 재료를 다시 입력해 주세요.</p>
              <button
                type="button"
                className="back-btn"
                onClick={() => navigate("/")}
              >
                재료 다시 입력하기
              </button>
            </div>
          </main>
          <TabBar />
        </div>
      </div>
    );
  }

  const {
    food,
    difficulty,
    cooking_time,
    use_ingredients,
    steps,
    tip,
    video,
    tag,
  } = data;

  // ✅ 방어적 정규화
  const ingredientsList = toArray(use_ingredients).map(toText).filter(Boolean);
  const stepsList = toArray(steps).map(toText).filter(Boolean);
  const tagsList = toArray(tag).map(toText).filter(Boolean);

  // 좋아요 추가 핸들러 — 백엔드가 기대하는 필드 형태로 payload 구성
  const handleAddLike = async () => {
    if (isLiking || liked) return; // 중복 요청 방지
    setIsLiking(true);

    try {
      // use_ingredients가 배열(객체 배열)인지 우선 사용, 아니면 문자열 배열에서 name으로 변환
      const normalizedIngredients = Array.isArray(use_ingredients)
        ? use_ingredients
        : ingredientsList.map((txt) => ({ name: txt }));

      // 서버가 예시로 준 구조에 맞춰 명시적으로 필드 전달
      const payload = {
        food: food ?? toText(food),
        use_ingredients: normalizedIngredients,
        steps: stepsList,
        tip: tip ?? null,
        _ai_provider: data._ai_provider ?? "ollama",
      };

      console.info("POST /recipe/like payload:", payload);
      const res = await api.post("/recipe/like", payload);
      console.info("좋아요 응답:", res?.data);

      setLiked(true);
    } catch (err) {
      // 서버가 반환한 검증 메시지 확인 (422일 경우 거부 이유가 들어있음)
      console.error("좋아요 처리 중 오류 발생:", err);
      if (err?.response?.data) {
        console.error("서버 응답(검증 오류 등):", err.response.data);
      }
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="result-page">
      <div className="result-wrap">
        <TopBar />

        <main className="result-content" role="main">
          <header className="result-header">
            <h1 className="title">{toText(food) || "추천 요리"}</h1>
 
            <div className="meta">난이도 {toText(difficulty)}</div> 

            {tagsList.length > 0 && (
              <ul className="tags" role="list">
                {tagsList.map((t, i) => (
                  <li key={i} className="tag">
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </header>

          <section className="card">
            <h2 className="card-title">사용 재료</h2>
            {ingredientsList.length > 0 ? (
              <ul className="chips" role="list">
                {ingredientsList.map((txt, idx) => (
                  <li key={idx} className="chip">
                    {txt}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">표시할 재료가 없어요.</p>
            )}
          </section>

          <section className="card">
            <h2 className="card-title">요리 순서</h2>
            {stepsList.length > 0 ? (
              <ul className="steps">
                {stepsList.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">요리 순서가 없어요.</p>
            )}
          </section>

          {toText(tip) && (
            <section className="card">
              <h2 className="card-title">팁</h2>
              <p className="tip">{toText(tip)}</p>
            </section>
          )}

          {toText(video) && (
            <section className="card">
              <h2 className="card-title">관련 영상</h2>
              <a
                className="link"
                href={toText(video)}
                target="_blank"
                rel="noreferrer"
              >
                영상 보러가기
              </a>
            </section>
          )}

          <div className="spacer" />

          <div className="like-button-wrap">
            <button 
              type="button"
              className="like-button"
              onClick={handleAddLike}
              disabled={isLiking || liked}
            >
              {isLiking ? "전송중..." : liked ? "좋아요 완료 ❤️" : "좋아요 ❤️"}
            </button>
          </div>
        </main>

        <TabBar />
      </div>
    </div>
  );
}
