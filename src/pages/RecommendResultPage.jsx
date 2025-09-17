import { useLocation, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import TopNav from "../components/TopNav";
import TabBar from "../components/TabBar";
import "../styles/TopShell.css";
import "../styles/RecommendResultPage.css";

export default function RecommendResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.result || null;
  const query = location.state?.query || "";

  // 상단 탭 항목
  const navItems = [
    { label: "오늘 뭐 해먹지?", to: "/" },
    { label: "추천 요리", to: "/recommend" },
    { label: "게시판", to: "/board" },
    { label: "랭킹", to: "/rank" },
  ];

  if (!data) {
    return (
      <div className="result-page">
        <div className="result-wrap">
          <TopBar />
          <TopNav items={navItems} />

          <main className="result-content">
            <div className="empty">
              <p>결과 데이터가 없어요. 재료를 다시 입력해 주세요.</p>
              <button type="button" className="back-btn" onClick={() => navigate("/")}>
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
    use_ingredients = [],
    step = [],
    tip,
    video,
    tag,
  } = data;

  return (
    <div className="result-page">
      <div className="result-wrap">
        <TopBar />
        <TopNav items={navItems} />

        {/* 중앙 스크롤 영역 */}
        <main className="result-content" role="main">
          <header className="result-header">
            <div className="small">입력 재료: {query || "—"}</div>
            <h1 className="title">{food || "추천 요리"}</h1>

            {/* 메타(난이도/시간)는 DB 저장용이라 화면 비노출 요청 → 필요하면 아래 표시 주석 해제 */}
            {/* <div className="meta">난이도 {difficulty} · 조리 {cooking_time}분</div> */}

            {tag && <div className="tags">{String(tag)}</div>}
          </header>

          <section className="card">
            <h2 className="card-title">사용 재료</h2>
            {use_ingredients.length > 0 ? (
              <ul className="chips">
                {use_ingredients.map((it, idx) => (
                  <li key={idx} className="chip">{it}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">표시할 재료가 없어요.</p>
            )}
          </section>

          <section className="card">
            <h2 className="card-title">요리 순서</h2>
            {step.length > 0 ? (
              <ol className="steps">
                {step.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ol>
            ) : (
              <p className="muted">요리 순서가 없어요.</p>
            )}
          </section>

          {tip && (
            <section className="card">
              <h2 className="card-title">팁</h2>
              <p className="tip">{tip}</p>
            </section>
          )}

          {video && (
            <section className="card">
              <h2 className="card-title">관련 영상</h2>
              <a className="link" href={video} target="_blank" rel="noreferrer">
                영상 보러가기
              </a>
            </section>
          )}

          <div className="spacer" />
        </main>

        <TabBar />
      </div>
    </div>
  );
}
