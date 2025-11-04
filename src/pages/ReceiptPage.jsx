import { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/ReceiptPage.css";

// assets
import money_icon from "../assets/money_icon.png";
import add_button_icon from "../assets/add_button.svg";

const ReceiptPage = () => {
  return (
    <div className="receipt-page">
      <div className="receipt-wrap">
        <div className="receipt-header">
          <div className="receipt-header-icon">
            <img src={money_icon} alt="money icon" />
          </div>
          <div className="receipt-header-text">
            <h3>재료 보관함</h3>
            <p>n개의 영수증</p>
          </div>
          <div className="add-receipt-wrap">
            <img src={add_button_icon} alt="add receipt icon" />
            <button className="add-receipt-btn">영수증 추가</button>
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}

export default ReceiptPage;