import React from "react";
import logo from "../assets/FoodThing.png";
import "../styles/TopShell.css";

const TopBar = () => {
  return (
    <header className="topbar" aria-label="브랜드 헤더">
      <div className="brand">
        <img src={logo} alt="FoodThing" />
      </div>
    </header>
  );
}

export default TopBar;
