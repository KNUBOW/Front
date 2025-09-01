import TopBar from '../components/TopBar';
import TopNav from '../components/TopNav';
import TabBar from '../components/TabBar';
import '../styles/TopShell.css';
import '../styles/BoardPage.css';

const BoardPage = () => {

    const navItems = [
        { label: "오늘 뭐 해먹지?", to: "/" },
        { label: "추천 요리", to: "/recommend" },
        { label: "게시판", to: "/board" },
        { label: "랭킹", to: "/rank" },
    ];

    return (
        <div className="board-page">
            <div className="board-wrap layout-grid">
                <TopBar />
                <TopNav items={navItems} />

                <div>
                    <h1>게시판 페이지</h1>
                </div>
                <TabBar />
            </div>
        </div>
    );
}

export default BoardPage;