import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/TopShell.css";
import "../styles/MainPage.css";

const MainPage = () => {
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const navigate = useNavigate();

    // 샘플 추천 리스트 (백엔드 연동 시 상태로 교체)
    const sampleRecommendations = [
        { food: "된장찌개", time: "30분", ingredients: "두부, 호박, 양파, 된장" },
        { food: "김치 볶음밥", time: "20분", ingredients: "밥, 김치, 계란" },
        { food: "닭갈비", time: "40분", ingredients: "닭고기, 고구마, 양배추" },
        { food: "불고기", time: "35분", ingredients: "소고기, 양파, 당근" },
        { food: "오므라이스", time: "25분", ingredients: "밥, 계란, 케찹" },
    ];

    // 샘플 랭킹 (나중에 API로 교체)
    const sampleRanking = [
        { title: "비빔밥", score: 5 },
        { title: "라면", score: 4 },
        { title: "잡채", score: 5 },
        { title: "찌개", score: 3 },
        { title: "김밥", score: 3 },
    ];

    // 샘플 게시판 (나중에 API로 교체)
    const sampleBoard = [
        { title: "맛집 추천", author: "홍길동", summary: "최근 방문한 맛집과 후기입니다." },
        { title: "새로운 레시피", author: "김영희", summary: "간단하게 만들 수 있는 디저트 레시피 공유합니다." },
        { title: "다이어트 식단", author: "이순신", summary: "수개월간의 다이어트 성공 후기입니다." },
        { title: "최고의 국물", author: "박사장", summary: "국물 맛이 뛰어난 집을 추천합니다." },
        { title: "가족과의 저녁", author: "최지우", summary: "가족과 함께한 맛있는 저녁 후기입니다." },
    ];

    // 오늘 뭐 해먹지
    const onSubmitTodayWhatEat = async (e) => {
        e.preventDefault();
        setErr("");
        const chat = q.trim();

        if (!chat) return;

        try {
            setLoading(true);

            const res = await api.post(
                "/recipe/ingredient-cook",
                { chat },
                {
                    headers: {
                        accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            )

            navigate("/recommend/result", { state: { result: res.data, query: chat } });
        } catch (e) {
            console.error("[ingredient-cook 실패]", e);
            setErr("추천 요청에 실패했어요. 잠시 후 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="main-page">
            {/* main-wrap을 화면 전체 높이로 잡아 TopBar/TabBar 사이의 영역을 flex로 분배 */}
            <div className="main-wrap" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <TopBar />
                {/* main-content는 TopBar/TabBar 사이의 영역을 차지, 내부는 열 방향, overflow hidden */}
                <div
                    className="main-content"
                    role="main"
                    style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, flex: 1, overflow: 'auto' }}
                >
                    <section className="main-today-what-eat">
                        <div className="card-icon" aria-hidden="true">🍳</div>
                        <h2 id="todayTitle" className="card-title">오늘 뭐 해먹지?</h2>

                        <form className="search-form" onSubmit={onSubmitTodayWhatEat} role="search" aria-label="재료 검색">
                            <div className="search-field">
                                {/* 좌측 돋보기 (input 내부, absolute) */}
                                <svg className="icon-left" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        d="M10 2a8 8 0 015.66 13.66l3.34 3.34a1 1 0 11-1.41 1.41l-3.34-3.34A8 8 0 1110 2zm0 2a6 6 0 100 12A6 6 0 0010 4z"
                                        fill="currentColor"
                                    />
                                </svg>

                                <input
                                    type="text"
                                    name="ingredients"
                                    placeholder="재료를 입력해 보세요 (예: 양파, 베이컨, 새우)"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    autoComplete="off"
                                    inputMode="text"
                                    aria-label="재료 입력"
                                    disabled={loading}
                                />

                                {/* 우측 제출 버튼 (input 내부, absolute) */}
                                <button type="submit" className="icon-right" aria-label="레시피 추천 검색" disabled={loading}>
                                    {loading ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="spin">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
                                            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" fill="none" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M2 21l19-9L2 3v7l13 2-13 2v7z" fill="currentColor" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </form>

                        {err && <p className="error-text" role="alert">{err}</p>}
                    </section>

                    {/* 추천 카드: 남은 공간 중 1/3 (flex 설정으로 동일 비율 분배), 내부 스크롤 가능 */}
                    <div className="recommend-card main-card" style={{ flex: '0 0 auto' }}>
                        <div className="badge">추천 요리</div>
                        <ul className="recommend-list" role="list">
                            {sampleRecommendations.map((it, idx) => (
                                <li className="recommend-item" key={idx} role="listitem" onClick={() => { /* 상세 이동 등 */ }}>
                                    <div className="item-left">
                                        <div className="title">{it.food}</div>
                                        <div className="sub">조리 시간: <span className="time">{it.time}</span></div>
                                    </div>
                                    <div className="item-right">
                                        {it.ingredients}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* 랭킹 카드: 내부 스크롤 가능 */}
                    <div className="ranking-card main-card" style={{ flex: '0 0 auto' }}>
                        <div className="badge">랭킹</div>
                        <ul className="ranking-list" role="list">
                            {sampleRanking.map((it, idx) => (
                                <li key={idx} className="ranking-item" role="listitem">
                                    <div className="rank-left">
                                        <div className="rank-title">{idx + 1}위: {it.title}</div>
                                        <div className="rank-sub">별점: <span className="stars">{'★'.repeat(it.score)}</span></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
 
                    {/* 게시판 카드: 내부 스크롤 가능 */}
                    <div className="board-card main-card" style={{ flex: '0 0 auto' }}>
                        <div className="badge">게시판</div>
                        <ul className="board-list" role="list">
                            {sampleBoard.map((it, idx) => (
                                <li key={idx} className="board-item" role="listitem">
                                    <div className="board-left">
                                        <div className="board-title">{it.title}</div>
                                        <div className="board-author">작성자: {it.author}</div>
                                    </div>
                                    <div className="board-right">
                                        <div className="board-summary">{it.summary}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>  
                </div>
                <TabBar />
            </div>
        </div>
    );
}

export default MainPage;