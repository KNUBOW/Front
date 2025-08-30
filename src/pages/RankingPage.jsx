import TopBar from '../components/TopBar';
import TopNav from '../components/TopNav';
import TabBar from '../components/TabBar';
import '../styles/TopShell.css';
import '../styles/RankingPage.css';

const RankingPage = () => {
  // 상단 탭 항목
  const navItems = [
    { label: "오늘 뭐 해먹지?", to: "/" },
    { label: "추천 요리", to: "/recommend" },
    { label: "게시판", to: "/board" },
    { label: "랭킹", to: "/rank" },
  ];

  return (
    <div className="rank-page">
      <div className="rank-wrap layout-grid">
        <TopBar />
        <TopNav items={navItems} />

        <div>
          <h1>랭킹 페이지</h1>
          <p>랭킹 콘텐츠가 여기에 표시됩니다.</p>
        </div>
        <TabBar />
      </div>
    </div>
  );
}

export default RankingPage;