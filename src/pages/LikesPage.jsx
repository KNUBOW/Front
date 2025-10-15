import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import TopNav from "../components/TopNav";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/TopShell.css";
import "../styles/LikesPage.css";

const LikePage = () => {
    return (
        <div className="likes-page">
            <div className="likes-wrap">
                <TopBar />
                <div className="likes-container">
                    <div className="likes-content">
                        <h2>Likes Page</h2>
                        <p>This is the Likes page content.</p>
                    </div>
                </div>
                <TabBar />
            </div>
        </div>
    );
}

export default LikePage;