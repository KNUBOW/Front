// src/pages/BoxPage.jsx
import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api"; // ← 토큰 포함된 axios 인스턴스
import "../styles/TopShell.css";
import "../styles/BoxPage.css";

const BoxPage = () => {
  // 서버 데이터
  const [items, setItems] = useState([]);           // 정상(미만료) + 만료 모두 일단 원천 저장
  const [expiredItems, setExpiredItems] = useState([]); // 만료 항목 분리 저장
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // UI 상태
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid"); // 'grid' | 'list'
  const [showModal, setShowModal] = useState(false);
  const [expiredOpen, setExpiredOpen] = useState(false);

  // 모달 폼 상태 (로컬 추가는 일단 클라이언트 상태에만 반영)
  const [form, setForm] = useState({
    name: "",
    category: "",
    date: "",
    qty: "",
  });

  // 날짜 문자열 → 만료 판정 (가능한 포맷: ISO 또는 'YYMMDD'/'YYYYMMDD')
  const isDateExpired = (v) => {
    if (!v) return false;
    try {
      let d;
      const s = String(v).trim();
      if (/^\d{8}$/.test(s)) {
        // YYYYMMDD
        d = new Date(
          Number(s.slice(0, 4)),
          Number(s.slice(4, 6)) - 1,
          Number(s.slice(6, 8))
        );
      } else if (/^\d{6}$/.test(s)) {
        // YYMMDD → 20YY 가정
        const year = 2000 + Number(s.slice(0, 2));
        d = new Date(year, Number(s.slice(2, 4)) - 1, Number(s.slice(4, 6)));
      } else {
        d = new Date(s); // ISO 등
      }
      if (Number.isNaN(d.getTime())) return false;
      // 오늘 23:59:59 기준 만료
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      return d.getTime() < now.getTime();
    } catch {
      return false;
    }
  };

  // 서버 → 클라이언트 UI용 정규화
  const normalize = (rows) =>
    (rows ?? []).map((r, i) => {
      const id =
        r.id ??
        r.ingredientId ??
        r.uuid ??
        `item-${Date.now()}-${i}`;
      const name = r.name ?? r.title ?? "재료";
      const qty =
        r.qty ?? r.quantity ?? r.count ?? 1;
      const expired =
        r.expired ??
        r.isExpired ??
        isDateExpired(r.expirationDate ?? r.expireDate ?? r.date);
      const alert = r.alert ?? expired; // 만료시 강조
      return { id, name, qty: Number(qty) || 1, expired: !!expired, alert: !!alert };
    });

  const splitByExpired = (rows) => {
    const a = [];
    const b = [];
    rows.forEach((it) => (it.expired ? b.push(it) : a.push(it)));
    return [a, b];
  };

  const fetchIngredients = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // 토큰은 api 인스턴스에서 자동 첨부됨
      const { data } = await api.get("/ingredients", {
        headers: { accept: "application/json" },
      });
      const normalized = normalize(Array.isArray(data) ? data : data?.items);
      const [actives, expireds] = splitByExpired(normalized);
      setItems(actives);
      setExpiredItems(expireds);
    } catch (err) {
      console.error("[재료 목록 실패]", err);
      setErrorMsg("재료 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
      setItems([]);
      setExpiredItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 검색 필터 (미만료만)
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter((it) => it.name?.toLowerCase().includes(q.toLowerCase()));
  }, [items, query]);

  // 수량 증가/감소/삭제 (로컬 상태만 변경 — 서버 연동은 추후)
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
    // 지금은 클라 상태만 추가 (POST 연동 필요 시 알려줘!)
    const newItem = {
      id: `item-${Date.now()}`,
      name: form.name.trim(),
      qty: Number(form.qty) || 1,
      expired: false,
    };
    setItems((prev) => [newItem, ...prev]);
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
              disabled={loading}
            />
            <button
              type="button"
              className="search-btn"
              aria-label="검색"
              disabled
              title="검색은 입력 즉시 적용됩니다"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          <div className="right-icons">
            {/* 추가 버튼 */}
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

            {/* 그리드/리스트 전환 */}
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

        {/* 재료 추가 큰 버튼 */}
        <div className="add-btn-wrap">
          <button className="add-btn" onClick={openModal} disabled={loading}>
            재료 추가
          </button>
        </div>

        {/* 로딩/에러 상태 */}
        {loading && <p className="status">불러오는 중…</p>}
        {!loading && errorMsg && <p className="status error">{errorMsg}</p>}

        {/* 아이템 그리드 (미만료 + 검색 필터) */}
        {!loading && !errorMsg && (
          <section className={`grid-area ${view}`}>
            {filtered.length === 0 ? (
              <p className="empty"></p>
            ) : (
              filtered.map((it) => (
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
              ))
            )}
          </section>
        )}

        {/* 유통기한 지난 재료 */}
        {!loading && !errorMsg && (
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
        )}
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
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
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
};

export default BoxPage;
