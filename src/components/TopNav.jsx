import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/TopShell.css";

/** TopNav
 * @param {Array<{label: string, to: string, match?: (pathname:string)=>boolean}>} items
 *   - label: 탭에 보일 텍스트
 *   - to: 이동 경로
 *   - match: (선택) 커스텀 활성화 판정 함수 (중첩 라우트 등)
 */

export default function TopNav({ items = [] }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (item) => {
    if (typeof item.match === "function") return item.match(pathname);
    // 기본: 정확히 일치
    return pathname === item.to;
  };

  return (
    <nav className="topnav-bar" aria-label="상단 메뉴">
      <div className="topnav" role="tablist" aria-label="탭 메뉴">
        {items.map((item) => (
          <button
            key={item.to}
            type="button"
            role="tab"
            aria-selected={isActive(item)}
            className={`topnav-item ${isActive(item) ? "active" : ""}`}
            onClick={() => navigate(item.to)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
