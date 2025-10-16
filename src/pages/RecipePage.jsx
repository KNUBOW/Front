import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/TopShell.css";
import "../styles/RecipePage.css";

function useFixVh() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      const root = document.documentElement;
      root.style.setProperty("--vh", `${vh}px`);
      root.style.setProperty("--safe-top", "env(safe-area-inset-top, 0px)");
      root.style.setProperty("--safe-bottom", "env(safe-area-inset-bottom, 0px)");
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    document.addEventListener("visibilitychange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
      document.removeEventListener("visibilitychange", setVh);
    };
  }, []);
}

export default function RecipePage() {
  useFixVh();

  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 동시 호출 방지
  const inFlight = useRef(false);
  // 개별 레시피 상세 호출 방지
  const clickInFlight = useRef(false);

  const diffClass = (d) => {
    const n = Number(d) || 0;
    if (n <= 1) return "badge badge-easy";
    if (n === 2) return "badge badge-normal";
    if (n === 3) return "badge badge-medium";
    if (n === 4) return "badge badge-hard";
    return "badge badge-expert";
  };

  const fetchSuggest = async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      setErr("");
      setLoading(true);

      const res = await api.get("/recipe/suggest", {
        headers: { accept: "application/json" },
      });

      const list = res?.data?.recipes ?? [];
      setRecipes(Array.isArray(list) ? list.slice(0, 5) : []);
    } catch (e) {
      setErr("레시피 추천을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      setRecipes([]);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        setLoading(true);
        const res = await api.get("/recipe/suggest", {
          headers: { accept: "application/json" },
        });
        if (!alive) return;

        const list = res?.data?.recipes ?? [];
        setRecipes(Array.isArray(list) ? list.slice(0, 5) : []);
      } catch (e) {
        if (!alive) return;
        setErr("레시피 추천을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        setRecipes([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // 언마운트 시 응답 무시 (요청 자체는 취소하지 않음)
    return () => {
      alive = false;
    };
  }, []);

  const handleRecipeClick = async (foodName) => {
    if (!foodName) return;
    if (clickInFlight.current) return;
    clickInFlight.current = true;

    try {
      setErr("");

      const res = await api.post(
        "/recipe/food-cook",
        { chat: foodName },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const resData = res?.data;
      if (!resData) {
        setErr("레시피 상세를 불러오지 못했습니다.");
        return;
      }

      // 서버 샘플 스키마에 맞춰 정규화 (step 혹은 steps 처리)
      const normalized = {
        food: resData.food ?? foodName,
        difficulty: resData.difficulty ?? null,
        cooking_time: resData.cooking_time ?? null,
        use_ingredients: Array.isArray(resData.use_ingredients) ? resData.use_ingredients : [],
        steps: Array.isArray(resData.steps)
          ? resData.steps
          : Array.isArray(resData.step)
          ? resData.step
          : [],
        tip: resData.tip ?? "",
        video: resData.video ?? "",
        tag: resData.tag ?? "",
      };

      navigate("/recommend/result", { state: { result: normalized, query: foodName } });
    } catch (e) {
      console.error(e);
      const resp = e?.response;
      if (resp?.data) setErr(resp.data.message ?? JSON.stringify(resp.data));
      else setErr("레시피 상세를 불러오지 못했습니다.");
    } finally {
      clickInFlight.current = false;
    }
  };

  return (
    <div className="recipe-page">
      <div className="recipe-wrap">
        <TopBar />

        <main className="recipe-content" role="main" aria-label="레시피 콘텐츠 영역">
          <header className="recipe-header">
            <h1 className="title">추천 레시피</h1>
          </header>

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
              <button type="button" className="retry-btn" onClick={fetchSuggest}>
                다시 시도
              </button>
            </div>
          )}

          {!loading && !err && recipes.length === 0 && (
            <div className="state empty">추천 결과가 없습니다.</div>
          )}

          {!loading && !err && recipes.length > 0 && (
            <ul className="recipe-list" aria-label="추천 레시피 목록">
              {recipes.map((r, idx) => (
                <li key={`${r.food ?? "recipe"}-${idx}`} className="recipe-card">
                  <button
                    type="button"
                    className="recipe-btn"
                    onClick={() => handleRecipeClick(r.food)}
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 0 }}
                  >
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
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      <TabBar />
    </div>
  );
}
