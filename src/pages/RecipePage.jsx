import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import "../styles/RecipePage.css"; // 레시피 페이지 전용 스타일
import "../styles/TopShell.css";     // 프로젝트 공통 쉘 스타일 (이미 사용 중이면 유지)

export default function RecipePage() {
  return (
    <div className="recipe-page">
      <div className="recipe-wrap">
        {/* 상단 바 */}
        <TopBar />

        {/* 본문 영역: 여기부터 레시피 목록/상세/필터 등을 붙이면 됨 */}
        <main className="recipe-content" role="main" aria-label="레시피 콘텐츠 영역">
          {/* TODO: 레시피 카드/리스트/필터 UI 추가 */}
          <div className="placeholder" aria-hidden="true">
            <h1 className="sr-only">레시피</h1>
            <p>레시피 페이지 기본 틀입니다. 컴포넌트를 여기에 추가하세요.</p>
          </div>
        </main>
      </div>

      {/* 하단 탭바 */}
      <TabBar />
    </div>
  );
}
