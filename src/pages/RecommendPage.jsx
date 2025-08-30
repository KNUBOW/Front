import TopBar from "../components/TopBar";
import TopNav from "../components/TopNav";
import TabBar from "../components/TabBar";
import "../styles/TopShell.css";
import "../styles/RecommendPage.css";

const RecommendPage = () => {
  const navItems = [
    { label: "오늘 뭐 해먹지?", to: "/" },
    { label: "추천 요리", to: "/recommend" },
    { label: "게시판", to: "/board" },
    { label: "랭킹", to: "/rank" },
  ];

  return (
    <div className="recommend-page">
      <div className="recommend-wrap">
        <TopBar />
        <TopNav items={navItems} />

        {/* 중앙 영역만 스크롤 */}
        <main className="recommend-content" role="main">
          <section className="rec-hero" aria-labelledby="recTitle">
            <h1 id="recTitle" className="rec-title">추천 요리</h1>
            <p className="rec-desc">취향과 재료에 맞춘 맞춤 추천을 준비 중입니다.</p>
          </section>

        <section className="rec-section">
            <div className="rec-card">오늘의 인기 레시피</div>
            <div className="rec-card">간단 10분 요리</div>
            <div className="rec-card">냉장고 파먹기</div>
          </section>
        </main>

        <TabBar />
      </div>
    </div>
  );
};

export default RecommendPage;
