// src/pages/BoxPage.jsx
import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api"; // 토큰 포함된 axios 인스턴스
import "../styles/TopShell.css";
import "../styles/BoxPage.css";

const CATEGORIES = [
  { id: "1", name: "곡류·빵류" },
  { id: "2", name: "채소류" },
  { id: "3", name: "과일류" },
  { id: "4", name: "육류" },
  { id: "5", name: "어패류" },
  { id: "6", name: "달걀·난류" },
  { id: "7", name: "유제품" },
  { id: "8", name: "콩·두부·견과류" },
  { id: "9", name: "가공·즉석식품" },
  { id: "10", name: "양념·조미료" },
  { id: "11", name: "기름·드레싱" },
  { id: "12", name: "음료류" },
  { id: "13", name: "간식·디저트" },
  { id: "14", name: "건어물·저장식품" },
  { id: "15", name: "기타" },
];

const BoxPage = () => {
  // 서버 데이터
  const [items, setItems] = useState([]);              // 미만료
  const [expiredItems, setExpiredItems] = useState([]); // 만료
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // UI 상태
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid"); // 'grid' | 'list'
  const [showModal, setShowModal] = useState(false);
  const [expiredOpen, setExpiredOpen] = useState(false);

  // 모달 폼 상태 (API 규격에 맞춤)
  const [form, setForm] = useState({
    ingredient_name: "",  // 재료 이름
    category_id: "",      // 카테고리 id (select)
    purchase_date: "",    // YYYY-MM-DD (date input)
  });
  const [submitting, setSubmitting] = useState(false);

  // 날짜 문자열 → 만료 판정
  const isDateExpired = (v) => {
    if (!v) return false;
    try {
      const d = new Date(String(v).trim());
      if (Number.isNaN(d.getTime())) return false;
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      return d.getTime() < now.getTime();
    } catch {
      return false;
    }
  };

  // 서버 → 클라이언트 UI 정규화
  const normalize = (rows) =>
    (rows ?? []).map((r, i) => {
      const id = r.id ?? r.ingredientId ?? r.uuid ?? `item-${Date.now()}-${i}`;
      const name = r.name ?? r.ingredient_name ?? r.title ?? "재료";
      const qty = r.qty ?? r.quantity ?? r.count ?? 1;
      const expired =
        r.expired ??
        r.isExpired ??
        isDateExpired(r.expirationDate ?? r.expireDate ?? r.purchase_date ?? r.date);
      const alert = r.alert ?? expired;
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
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.name?.toLowerCase().includes(q));
  }, [items, query]);

  // 수량 컨트롤(로컬)
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
        prev.map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty - 1) } : it))
      );
    } else {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty - 1) } : it))
      );
    }
  };
  const removeItem = (id, isExpired = false) => {
    if (isExpired) setExpiredItems((prev) => prev.filter((it) => it.id !== id));
    else setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const openModal = () => {
    setForm({ ingredient_name: "", category_id: "", purchase_date: "" });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSubmitting(false);
  };

  // ✅ POST 성공 시 항상 최신 목록을 다시 GET 해서 보여주기
  const submitAdd = async (e) => {
    e.preventDefault();
    if (!form.ingredient_name.trim()) return;
    if (!form.category_id) return;
    if (!form.purchase_date) return;

    try {
      setSubmitting(true);
      const res = await api.post(
        "/ingredients",
        {
          ingredient_name: form.ingredient_name.trim(),
          category_id: String(form.category_id),
          purchase_date: form.purchase_date, // YYYY-MM-DD
        },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      // 2xx 응답만 성공으로 간주
      if (res?.status >= 200 && res?.status < 300) {
        // 검색어 초기화하여 전체 목록이 바로 보이도록
        setQuery("");
        // 최신 목록 재요청
        await fetchIngredients();
        // 모달 닫기
        closeModal();
      } else {
        throw new Error(`Unexpected status: ${res?.status}`);
      }
    } catch (err) {
      console.error("[재료 추가 실패]", err);
      alert("재료 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
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

      {/* 모달: 카테고리 셀렉트 + 날짜(YYYY-MM-DD) */}
      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal" onSubmit={submitAdd}>
            <div className="row">
              <label>재료 이름:</label>
              <input
                type="text"
                placeholder="ex) 피망"
                value={form.ingredient_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ingredient_name: e.target.value }))
                }
                required
              />
            </div>

            <div className="row">
              <label>재료 구분:</label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category_id: e.target.value }))
                }
                required
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 12,
                  border: "1px solid #e3d7b5",
                  background: "#fff",
                  padding: "0 12px",
                  fontSize: 16,
                  outline: "none",
                  color: "#000",
                }}
              >
                <option value="" disabled>
                  선택하세요
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <label>구입 날짜:</label>
              <input
                type="date"
                value={form.purchase_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, purchase_date: e.target.value }))
                }
                required
              />
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn left" disabled={submitting}>
                {submitting ? "추가 중…" : "재료추가"}
              </button>
              <button type="button" className="btn right" onClick={closeModal} disabled={submitting}>
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
