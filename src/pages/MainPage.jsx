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
            <div className="main-wrap">
                <TopBar />
                <div className="main-content" role="main">
                    <section className="main-today-what-eat">
                        <div className="card-icon" aria-hidden="true">🍳</div>
                        <h2 id="todayTitle" className="card-title">오늘 뭐 해먹지?</h2>

                        <form className="search-form" onSubmit={onSubmit} role="search" aria-label="재료 검색">
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
                    <h1>추천 요리</h1>
                    <h1>랭킹</h1>
                    <h1>게시판</h1>
                </div>
                <TabBar />
            </div>
        </div>
    );
}

export default MainPage;