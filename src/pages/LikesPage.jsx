import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import TopNav from "../components/TopNav";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/TopShell.css";
import "../styles/LikesPage.css";

//assets
import arrow_circle_icon from "../assets/arrow_circle_icon.svg";

const LikePage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get("/recipe/like");
                const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
                if (mounted) setItems(data);
            } catch (err) {
                console.error("GET /recipe/like error:", err?.response || err);
                if (mounted) setError(err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    const openDetail = (item) => {
        // id가 있다면 상세 페이지로 이동. 없으면 콘솔/추후 구현.
        if (item?.id) navigate(`/recipe/${item.id}`, { state: { result: item }});
        else console.info("open detail:", item);
    };

    return (
        <div className="likes-page">
            <div className="likes-wrap">
                <TopBar />
                <div className="likes-container">
                    <h2 className="likes-title">좋아요</h2>

                    {error && (
                        <div className="likes-error">목록을 불러오는 중 오류가 발생했습니다.</div>
                    )}

                    <div className="likes-list" role="list">
                        {loading
                            ? // 로딩 시 기본 5개 플레이스홀더
                              Array.from({ length: 5 }).map((_, i) => (
                                <div className="like-card skeleton" key={`s-${i}`} />
                              ))
                            : items.length === 0
                              ? <div className="likes-empty">아직 좋아요한 레시피가 없습니다.</div>
                              : items.map((it, idx) => (
                                <button
                                    key={it.id || `${it.food}-${idx}`}
                                    className="like-card"
                                    type="button"
                                    onClick={() => openDetail(it)}
                                    role="listitem"
                                >
                                    <div className="like-card-left">
                                        <div className="rank">{idx + 1}</div>
                                    </div>
                                    <div className="like-card-content">
                                        <div className="food">{it.recipe.food || "무명 레시피"}</div>
                                        <div className="meta">
                                            {(it.recipe.use_ingredients || [])
                                              .slice(0, 2)
                                              .map(i => (typeof i === "string" ? i : i?.name))
                                              .filter(Boolean)
                                              .join(", ")}
                                        </div>
                                    </div>
                                    <div className="like-card-right">
                                        <img 
                                            src={arrow_circle_icon}  
                                            className="like-card-image" 
                                        />
                                    </div>
                                </button>
                              ))
                        }
                    </div>
                </div>
                <TabBar />
            </div>
        </div>
    );
}

export default LikePage;