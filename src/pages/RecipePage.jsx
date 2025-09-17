import { useEffect, useState, useMemo } from "react";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/TopShell.css";
import "../styles/RecipePage.css";

export default function RecipePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 난이도 배지 색상 클래스
  const diffClass = (d) => {
    const n = Number(d) || 0;
    if (n <= 1) return "badge badge-easy";
    if (n === 2) return "badge badge-normal";
    if (n === 3) return "badge badge-medium";
    if (n === 4) return "badge badge-hard";
    return "badge badge-expert";
  };

  const fetchSuggest = async () => {
    try {
      setErr("");
      setLoading(true);
      // ✅ 백엔드: GET /recipe/suggest (권장). 필요 시 POST로 바꿔도 됨.
      const res = await api.get("/recipe/suggest", {
        headers: {
          accept: "application/json",
        },
      });
      const list = res?.data?.recipes ?? [];
      setRecipes(Array.isArray(list) ? list.slice(0, 5) : []);
    } catch (e) {
      console.error("[/recipe/suggest 실패]", e);
      setErr("레시피 추천을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 상단 작은 안내 텍스트
  const subtitle = useMemo(() => {
    if (loading) return "추천 레시피를 불러오는 중…";
    if (err) return "불러오기 실패";
    return `추천 레시피 ${recipes.length}개`;
  }, [loading, err, recipes.length]);

  return (
    <div className="recipe-page">
      <div className="recipe-wrap">
        <TopBar />

        <main className="recipe-content" role="main" aria-label="레시피 콘텐츠 영역">
          <header className="recipe-header">
            <p className="small">{subtitle}</p>
            <h1 className="title">추천 레시피</h1>
          </header>

          {/* 상태 표시 */}
          {loading && (
            <div className="state loading">
              <svg width="24" height="24" viewBox="0 0 24 24" className="spin" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
                <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
              <span>불러오는 중…</span>
            </div>
          )}

          {!loading && err && (
            <div className="state error" role="alert">
              {err}
              <button type="button" className="retry-btn" onClick={fetchSuggest}>다시 시도</button>
            </div>
          )}

          {!loading && !err && recipes.length === 0 && (
            <div className="state empty">추천 결과가 없습니다.</div>
          )}

          {/* 레시피 카드 리스트 */}
          {!loading && !err && recipes.length > 0 && (
            <ul className="recipe-list" aria-label="추천 레시피 목록">
              {recipes.map((r, idx) => (
                <li key={`${r.food}-${idx}`} className="recipe-card">
                  <div className="card-head">
                    <h2 className="food">{r.food || "이름 없는 레시피"}</h2>
                    <div className="meta">
                      <span className={diffClass(r.difficulty)}>Lv.{r.difficulty ?? "-"}</span>
                      <span className="time">{r.cooking_time ? `${r.cooking_time} min` : "-"}</span>
                    </div>
                  </div>

                  {r.describe && <p className="desc">{r.describe}</p>}

                  <div className="ing">
                    <p className="ing-title">사용 재료</p>
                    {Array.isArray(r.use_ingredients) && r.use_ingredients.length > 0 ? (
                      <ul className="chips">
                        {r.use_ingredients.map((ing, i) => (
                          <li className="chip" key={`${ing}-${i}`}>{ing}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted">표시할 재료가 없어요.</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="bottom-space" />
        </main>
      </div>

      <TabBar />
    </div>
  );
}
