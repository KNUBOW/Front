import { useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import "../styles/TopShell.css";
import "../styles/BoxPage.css";

const BoxPage = () =>{
  // 더미 데이터
  const initial = Array.from({ length: 9 }).map((_, i) => ({
    id: `item-${i + 1}`,
    name: "재료",
    qty: 1,
    expired: false,
  }));

  const [items, setItems] = useState(initial);
  const [expiredItems, setExpiredItems] = useState([
    { id: "expired-1", name: "재료", qty: 1, expired: true, alert: true },
  ]);

  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid"); // 'grid' | 'list' (아이콘만 자리 차지)
  const [showModal, setShowModal] = useState(false);
  const [expiredOpen, setExpiredOpen] = useState(false);

  // 모달 폼 상태
  const [form, setForm] = useState({
    name: "",
    category: "",
    date: "",
    qty: "",
  });

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter((it) => it.name.includes(q));
  }, [items, query]);

  const inc = (id, isExpired = false) => {
    if (isExpired) {
      setExpiredItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it))
      );
    } else {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it))
      );
    }
  };

  const dec = (id, isExpired = false) => {
    if (isExpired) {
      setExpiredItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, qty: Math.max(0, it.qty - 1) } : it
        )
      );
    } else {
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, qty: Math.max(0, it.qty - 1) } : it
        )
      );
    }
  };

  const removeItem = (id, isExpired = false) => {
    if (isExpired) {
      setExpiredItems((prev) => prev.filter((it) => it.id !== id));
    } else {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setForm({ name: "", category: "", date: "", qty: "" });
  };

  const submitAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setItems((prev) => [
      {
        id: `item-${Date.now()}`,
        name: form.name.trim(),
        qty: Number(form.qty) || 1,
        expired: false,
      },
      ...prev,
    ]);
    closeModal();
  };

  return (
    <div className="box-page">
      <div className="box-wrap">
        <TopBar />

        {/* 검색 + 아이콘들 */}
        <section className="box-search">
          <div className="search-input">
            <input
              type="text"
              placeholder="재료를 입력하세요."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="재료 검색"
            />
            <button type="button" className="search-btn" aria-label="검색">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          <div className="right-icons">
            {/* 추가 버튼 (스샷3의 + 위치) */}
            <button
              className="round-ico"
              aria-label="재료 추가"
              onClick={openModal}
              title="재료 추가"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* 그리드/리스트 스위치 아이콘(자리) */}
            <button
              className="round-ico"
              aria-label="표시 방식 전환"
              onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}
              title="그리드/리스트 전환"
            >
              {view === "grid" ? (
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v3H4zM4 11h16v3H4zM4 16h16v3H4z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        </section>

        {/* 재료 추가 버튼 (스샷1,2에 있는 큰 버튼) */}
        <div className="add-btn-wrap">
          <button className="add-btn" onClick={openModal}>재료 추가</button>
        </div>

        {/* 아이템 그리드 */}
        <section className={`grid-area ${view}`}>
          {filtered.map((it) => (
            <article key={it.id} className="card">
              <div className="thumb">
                <button
                  className="close-x"
                  aria-label="삭제"
                  onClick={() => removeItem(it.id)}
                >
                  ×
                </button>
              </div>
              <div className="title">{it.name}</div>
              <div className="qty-ctrl">
                <button className="sq" onClick={() => inc(it.id)}>＋</button>
                <span className="count">{it.qty}</span>
                <button className="sq" onClick={() => dec(it.id)}>－</button>
              </div>
            </article>
          ))}
        </section>

        {/* 유통기한 지난 재료 */}
        <section className="expired">
          <button
            className="expired-head"
            onClick={() => setExpiredOpen((v) => !v)}
            aria-expanded={expiredOpen}
            aria-controls="expired-panel"
          >
            <span>유통기한 지난 재료 ({expiredItems.length})</span>
            <svg
              className={`chev ${expiredOpen ? "open" : ""}`}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div
            id="expired-panel"
            className={`expired-panel ${expiredOpen ? "show" : ""}`}
          >
            {expiredItems.length === 0 ? (
              <p className="empty">지난 재료가 없습니다.</p>
            ) : (
              <div className="expired-grid">
                {expiredItems.map((it) => (
                  <article key={it.id} className="card">
                    <div className="thumb">
                      <button
                        className="close-x"
                        aria-label="삭제"
                        onClick={() => removeItem(it.id, true)}
                      >
                        ×
                      </button>
                    </div>
                    <div className={`title ${it.alert ? "danger" : ""}`}>
                      {it.name}
                    </div>
                    <div className="qty-ctrl">
                      <button className="sq" onClick={() => inc(it.id, true)}>
                        ＋
                      </button>
                      <span className="count">{it.qty}</span>
                      <button className="sq" onClick={() => dec(it.id, true)}>
                        －
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 하단 탭바 */}
      <TabBar />

      {/* 모달 */}
      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal" onSubmit={submitAdd}>
            <div className="row">
              <label>재료 이름:</label>
              <input
                type="text"
                placeholder="ex) 양파"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="row">
              <label>재료 구분:</label>
              <input
                type="text"
                placeholder="ex) 육류"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              />
            </div>
            <div className="row">
              <label>구입 날짜:</label>
              <input
                type="text"
                placeholder="ex) 250501"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="row">
              <label>수량:</label>
              <input
                type="text"
                placeholder="ex) 1개"
                value={form.qty}
                onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
              />
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn left">재료추가</button>
              <button type="button" className="btn right" onClick={closeModal}>
                창 닫기
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default BoxPage;