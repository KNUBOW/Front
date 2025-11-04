import { useEffect, useState } from 'react';
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/ReceiptPage.css";

// assets
import money_icon from "../assets/money_icon.png";
import add_button_icon from "../assets/add_button.svg";

const ReceiptPage = () => {
  const [receipts, setReceipts] = useState([]); // 날짜별로 그룹화된 영수증 데이터

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await api.get('/ingredients/detail', {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          }
        });

        // 날짜별로 그룹화
        const groupedByDate = response.data.ingredients.reduce((acc, curr) => {
          const date = curr.purchase_date;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(curr);
          return acc;
        }, {});

        // 날짜별로 정렬된 배열로 변환
        const sortedReceipts = Object.entries(groupedByDate)
          .map(([date, items]) => ({
            date,
            items
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신 날짜순 정렬

        setReceipts(sortedReceipts);
      } catch (error) {
        console.error('Error fetching receipts:', error);
      }
    };

    fetchReceipts();
  }, []);

  return (
    <div className="receipt-page">
      <div className="receipt-wrap">
        <div className="receipt-header">
          <div className="receipt-header-icon">
            <img src={money_icon} alt="money icon" />
          </div>
          <div className="receipt-header-text">
            <h3>재료 보관함</h3>
            <p>{receipts.length}개의 영수증</p>
          </div>
          <div className="add-receipt-wrap">
            <img src={add_button_icon} alt="add receipt icon" />
            <button className="add-receipt-btn">영수증 추가</button>
          </div>
        </div>

        {/* 날짜별 그룹화된 영수증 목록 렌더링 예시 */}
        <div className="receipt-content">
          {receipts.map(group => (
            <div key={group.date} className="receipt-group">
              <h4 className="receipt-date">{group.date}</h4>
              <ul className="receipt-list">
                {group.items.map(item => (
                  <li key={item.id} className="receipt-item">
                    {item.ingredient_name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <TabBar />
    </div>
  );
}

export default ReceiptPage;