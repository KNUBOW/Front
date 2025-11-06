import { useEffect, useState } from 'react';
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/ReceiptPage.css";

// assets
import money_icon from "../assets/money_icon.png";
import add_button_icon from "../assets/add_button.svg";
import calendar_icon from "../assets/calendar_icon.png";
import arrow_icon from "../assets/arrow_circle_icon.svg";

const ReceiptPage = () => {
  const [receipts, setReceipts] = useState([]); // 날짜별로 그룹화된 영수증 데이터
  const [selectedGroup, setSelectedGroup] = useState(null); // modal에 보여줄 그룹
  const [addReceipt, setAddReceipt] = useState(null); // modal에 보여줄 영수증

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

        console.log(sortedReceipts);
      } catch (error) {
        console.error('Error fetching receipts:', error);
      }
    };

    fetchReceipts();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedGroup(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openGroup = (group) => setSelectedGroup(group);
  const closeGroup = () => setSelectedGroup(null);

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
          <button 
            className="add-receipt-btn"
            type="button"
            onClick={() => setAddReceipt({})}
            aria-label="영수증 추가"
          >
            <img src={add_button_icon} alt="add receipt icon" />
            <div className="add-receipt-btn-text">영수증 추가</div>
          </button>
        </div>

        {/* 날짜별 그룹화된 영수증 목록 렌더링 예시 */}
        <div className="receipt-content" role="list">
          {receipts.map(group => (
            <button
              key={group.date}
              className="receipt-group"
              type="button"
              onClick={() => openGroup(group)}
              aria-label={`영수증 ${group.date} 보기`}
              role="listitem"
            >
              <div className="receipt-group-icon-wrap" aria-hidden="true">
                <img src={calendar_icon} alt="" className="receipt-group-icon" />
              </div>
              <div className="receipt-group-info">
                <h4 className="receipt-date">{group.date}</h4>
                <p className="receipt-count">{group.items.length}개의 품목</p>
              </div>
              <img src={arrow_icon} alt="" className="receipt-arrow-btn" />
            </button>
          ))}
        </div>

        {/* modal: 선택한 날짜의 품목 보기 */}
        {selectedGroup && (
          <div className="receipt-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="receipt-modal-title" onClick={closeGroup}>
            <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
              <header className="receipt-modal-header">
                <h3 id="receipt-modal-title">{selectedGroup.date}</h3>
                <button className="receipt-modal-close" onClick={closeGroup} aria-label="닫기">✕</button>
              </header>
              <div className="receipt-modal-body">
                <ul className="receipt-modal-list">
                  {selectedGroup.items.map(item => (
                    <li key={item.id} className="receipt-modal-item">
                      <div className="receipt-modal-item-name">{item.ingredient_name}</div>
                    </li>
                  ))}
                </ul>
                <div className="receipt-modal-summary">
                  <p className="receipt-modal-summary-text">총 품목 수:</p>
                  <p className="receipt-modal-summary-count">{selectedGroup.items.length}개</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* modal: 추가할 영수증 모달 띄우기 */}
        {addReceipt && (
          <div className="receipt-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-receipt-modal-title" onClick={() => setSelectedReceipt(null)}>
            <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
              <header className="receipt-modal-header">
                <h3 id="add-receipt-modal-title">영수증 추가</h3>
                <button className="receipt-modal-close" onClick={() => setAddReceipt(null)} aria-label="닫기">✕</button>
              </header>
              <div className="receipt-modal-body">
                {/* 영수증 추가 폼 또는 내용 */}
                <div className="receipt-add-date">
                  <p className="purchase-date">등록 날짜:</p>
                  <input type="date" id="purchase-date" name="purchase-date" className="purchase-date-input" />
                </div>
                <div className="receipt-add-items">
                  <div className="receipt-add-items-header">
                    <label>품목 추가:</label>
                    <button 
                      type="button"
                      className="receipt-add-item-btn"
                      onClick={() => { /* 품목 추가 로직 */ }}
                    >
                      + 품목 추가
                    </button>
                  </div>
                  <ul className="receipt-add-items-list">
                    {/* 동적으로 추가된 품목들 */}
                    <li className="receipt-add-item">
                      <input type="text" placeholder="품목 이름" />
                      <input type="number" placeholder="수량" min="1" />
                    </li>
                  </ul>
                </div>
                <div className="receipt-add-actions">
                  <button 
                    type="button" 
                    className="receipt-add-cancel-btn"
                    onClick={() => setAddReceipt(null)}
                  >뒤로가기</button>
                  <button 
                    type="button"
                    className="receipt-add-submit-btn"
                    onClick={() => { /* 영수증 추가 제출 로직 */ }}
                  >영수증 추가</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <TabBar />
    </div>
  );
}

export default ReceiptPage;