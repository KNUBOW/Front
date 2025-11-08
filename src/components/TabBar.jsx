import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import boxIcon from "../assets/box.svg";
import recipeIcon from "../assets/recipe.svg";
import homeIcon from "../assets/home.png";
import likeIcon from "../assets/like.svg";
import settingsIcon from "../assets/settings.svg";
import "../styles/TopShell.css";

const TabBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (to) => pathname === to;

  return (
    <footer className="tabbar" aria-label="하단 탭바">
      <div className="tab-inner">
        <button
          type="button"
          className={`tab-item ${isActive("/receipt") ? "active" : ""}`}
          onClick={() => navigate("/receipt")}
        >
          <div className="tab-icon" aria-hidden="true">
            <img src={boxIcon} alt="" width="36" height="36" />
          </div>
          <span>Receipt</span>
        </button>

        <button
          type="button"
          className={`tab-item ${isActive("/recipes") ? "active" : ""}`}
          onClick={() => navigate("/recipe")}
        >
          <div className="tab-icon" aria-hidden="true">
            <img src={recipeIcon} alt="" width="36" height="36" />
          </div>
          <span>Recipe</span>
        </button>

        <button
          type="button"
          className={`tab-item home-active ${isActive("/") ? "active" : ""}`}
          onClick={() => navigate("/")}
          aria-label="홈으로"
        >
          <div className="tab-icon home-hex" aria-hidden="true">
            <img src={homeIcon} alt="" width="36" height="36" />
          </div>
          <span className="home-hex">Home</span>
        </button>

        <button
          type="button"
          className={`tab-item ${isActive("/likes") ? "active" : ""}`}
          onClick={() => navigate("/likes")}
        >
          <div className="tab-icon" aria-hidden="true">
            <img src={likeIcon} alt="" width="36" height="36" />
          </div>
          <span>Like</span>
        </button>

        <button
          type="button"
          className={`tab-item ${isActive("/settings") ? "active" : ""}`}
          onClick={() => navigate("/settings")}
        >
          <div className="tab-icon" aria-hidden="true">
            <img src={settingsIcon} alt="" width="36" height="36" />
          </div>
          <span>Settings</span>
        </button>
      </div>
    </footer>
  );
}

export default TabBar;