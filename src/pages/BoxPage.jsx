import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api"; // 토큰 포함된 axios 인스턴스
import "../styles/TopShell.css";
import "../styles/BoxPage.css";

const CATEGORIES = [
  { id: "1", name: "곡류·빵류" }, { id: "2", name: "채소류" }, { id: "3", name: "과일류" },
  { id: "4", name: "육류" }, { id: "5", name: "어패류" }, { id: "6", name: "달걀·난류" },
  { id: "7", name: "유제품" }, { id: "8", name: "콩·두부·견과류" }, { id: "9", name: "가공·즉석식품" },
  { id: "10", name: "양념·조미료" }, { id: "11", name: "기름·드레싱" }, { id: "12", name: "음료류" },
  { id: "13", name: "간식·디저트" }, { id: "14", name: "건어물·저장식품" }, { id: "15", name: "기타" },
];

const BoxPage = () => {
  // 서버 데이터
  const [items, setItems] = useState([]);               // 미만료
  const [expiredItems, setExpiredItems] = useState([]); // 만료
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // UI 상태
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid"); // 'grid' | 'list'

  // 추가 모달
  const [showAddModal, setShowAddModal] = useState(false);

  // 삭제 확인 모달
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);

  const [expiredOpen, setExpiredOpen] = useState(false);

  // 모달 폼 상태 (API 규격에 맞춤)
  const [form, setForm] = useState({
    ingredient_name: "",  // 재료 이름
    category_id: "",      // 카테고리 id (select)
    purchase_date: "",    // YYYY-MM-DD
  });
  const [submitting, setSubmitting] = useState(false);

  // 날짜 문자열 → 만료 판정 (현재 정책상 false 권장)
  const isDateExpired = (_v) => false;

  // /ingredients/detail 응답 정규화
  const normalizeFromDetail = (rows) =>
    (Array.isArray(rows) ? rows : []).map((r, i) => {
      const id = r.id ?? `item-${Date.now()}-${i}`;
      const name = r.ingredient_name ?? "재료";
      const qty = 1; // 서버 수량 개념 없음 → 표시용
      const expired = isDateExpired(r.purchase_date);
      const alert = expired;
      return { id, name, qty, expired, alert };
    });

  const splitByExpired = (rows) => {
    const active = [], expired = [];
    for (const it of rows) (it.expired ? expired : active).push(it);
    return [active, expired];
  };

  // ✅ 조회: /ingredients/detail
  const fetchIngredients = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data } = await api.get("/ingredients/detail", {
        headers: { accept: "application/json" },
      });

      const list = data?.ingredients ?? [];
      if (!Array.isArray(list)) throw new Error("Invalid response: ingredients is not an array");

      const normalized = normalizeFromDetail(list);
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

  // ❌ 로컬 제거(미사용). 서버 삭제 성공 후 재조회로 일원화
  const removeItemLocal = (id, isExpired = false) => {
    if (isExpired) setExpiredItems((prev) => prev.filter((it) => it.id !== id));
    else setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // === 삭제 모달 열기/닫기 ===
  const openDeleteModal = (id, name) => {
    setDeleteTarget({ id, name });
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    if (deleting) return; // 진행 중에는 닫기 방지
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // ✅ 삭제 확정: DELETE /ingredients?ingredient_id={id}
  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      await api.delete("/ingredients", {
        params: { ingredient_id: deleteTarget.id },
        headers: { accept: "application/json" },
      });
      await fetchIngredients();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("[재료 삭제 실패]", err);
      alert("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeleting(false);
    }
  };

  // === 추가 모달 열기/닫기 ===
  const openAddModal = () => {
    setForm({ ingredient_name: "", category_id: "", purchase_date: "" });
    setShowAddModal(true);
  };
  const closeAddModal = () => {
    if (submitting) return;
    setShowAddModal(false);
    setSubmitting(false);
  };

  // ✅ 추가: POST /ingredients → 성공 후 재조회
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

      if (res?.status >= 200 && res?.status < 300) {
        setQuery("");
        await fetchIngredients();
        closeAddModal();
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
              onClick={openAddModal}
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
          <button className="add-btn" onClick={openAddModal} disabled={loading}>
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
              <p className="empty">등록된 재료가 없어요. 우측 상단 + 버튼으로 추가하세요.</p>
            ) : (
              filtered.map((it) => (
                <article key={it.id} className="card">
                  <div className="thumb">
                    <button
                      className="close-x"
                      aria-label="삭제"
                      onClick={() => openDeleteModal(it.id, it.name)}
                      title="삭제"
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
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div id="expired-panel" className={`expired-panel ${expiredOpen ? "show" : ""}`}>
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
                          onClick={() => openDeleteModal(it.id, it.name)}
                          title="삭제"
                        >
                          ×
                        </button>
                      </div>
                      <div className={`title ${it.alert ? "danger" : ""}`}>{it.name}</div>
                      <div className="qty-ctrl">
                        <button className="sq" onClick={() => inc(it.id, true)}>＋</button>
                        <span className="count">{it.qty}</span>
                        <button className="sq" onClick={() => dec(it.id, true)}>－</button>
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

      {/* ========== 추가 모달 ========== */}
      {showAddModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
          <form className="modal" onSubmit={submitAdd}>
            <h2 id="add-modal-title" className="modal-title">재료 추가</h2>

            <div className="row">
              <label>재료 이름:</label>
              <input
                type="text"
                placeholder="ex) 피망"
                value={form.ingredient_name}
                onChange={(e) => setForm((f) => ({ ...f, ingredient_name: e.target.value }))}
                required
              />
            </div>

            <div className="row">
              <label>재료 구분:</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                required
                style={{
                  flex: 1, height: 38, borderRadius: 12, border: "1px solid #e3d7b5",
                  background: "#fff", padding: "0 12px", fontSize: 16, outline: "none", color: "#000",
                }}
              >
                <option value="" disabled>선택하세요</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="row">
              <label>구입 날짜:</label>
              <input
                type="date"
                value={form.purchase_date}
                onChange={(e) => setForm((f) => ({ ...f, purchase_date: e.target.value }))}
                required
              />
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn left" disabled={submitting}>
                {submitting ? "추가 중…" : "재료추가"}
              </button>
              <button type="button" className="btn right" onClick={closeAddModal} disabled={submitting}>
                창 닫기
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========== 삭제 확인 모달 ========== */}
      {showDeleteModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="modal">
            <h2 id="delete-modal-title" className="modal-title">재료 삭제</h2>
            <p className="modal-desc">
              <strong>{deleteTarget?.name}</strong> 재료를 삭제할까요? <br />
              삭제 후에는 복구할 수 없습니다.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn left danger"
                onClick={confirmDelete}
                disabled={deleting}
                aria-busy={deleting}
              >
                {deleting ? "삭제 중…" : "삭제"}
              </button>
              <button
                type="button"
                className="btn right"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxPage;
