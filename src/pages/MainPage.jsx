import React from 'react';
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/TopShell.css";
import "../styles/MainPage.css";

const MainPage = () => {
    return (
        <div className="main-page">
            <div className="main-wrap">
                <TopBar />
                <div className="main-content" role="main">
                    <h1>오늘 뭐 해먹지?</h1>
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