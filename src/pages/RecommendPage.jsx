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

            <div className="content" role="main">
                <h2>추천 요리 페이지</h2>
            </div>

            <TabBar /> 
        </div>
    </div>
  );
}

export default RecommendPage;