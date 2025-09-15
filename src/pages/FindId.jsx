// src/pages/FindId.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import "./../styles/findid.css";
import logo from "./../assets/FoodThing.png";

function maskEmail(email) {
  if (!email || typeof email !== "string") return "";
  if (email.includes("*")) return email;
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 1) return `*@${domain}`;
  if (local.length === 2) return `${local[0]}*@${domain}`;
  const keep = 3;
  const masked = local.slice(0, keep) + "*".repeat(Math.max(0, local.length - keep));
  return `${masked}@${domain}`;
}
function toDashedDate(birth8) {
  if (!/^\d{8}$/.test(birth8)) return "";
  return `${birth8.slice(0, 4)}-${birth8.slice(4, 6)}-${birth8.slice(6, 8)}`;
}
function extractEmail(data) {
  const cand = data?.email ?? data?.user_email;
  if (typeof cand === "string") return cand;
  if (cand && typeof cand === "object") {
    const inner = cand.email ?? cand.user_email;
    return typeof inner === "string" ? inner : "";
  }
  return "";
}

const FindId = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", birth8: "", phone_num: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "birth8") {
      setForm((p) => ({ ...p, birth8: value.replace(/\D/g, "").slice(0, 8) }));
    } else if (name === "phone_num") {
      setForm((p) => ({ ...p, phone_num: value.replace(/\D/g, "").slice(0, 11) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const validate = () => {
    if (!form.name.trim()) return alert("이름을 입력해 주세요."), false;
    if (!/^\d{8}$/.test(form.birth8)) return alert("생년월일 8자리를 YYYYMMDD로 입력해 주세요."), false;
    if (!/^01[016789]\d{7,8}$/.test(form.phone_num))
      return alert("휴대폰 번호를 하이픈 없이 10~11자리로 입력해 주세요. (예: 01012345678)"), false;
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      birth: toDashedDate(form.birth8),
      phone_num: form.phone_num,
    };

    try {
      setLoading(true);
      const { data, status } = await api.post("/users/find-id", payload, {
        headers: { "Content-Type": "application/json", accept: "application/json" },
      });

      console.log("[find-id 응답]", { status, data });

      const rawEmail = extractEmail(data);
      if (status === 200 && typeof rawEmail === "string" && rawEmail) {
        const masked = rawEmail.includes("*") ? rawEmail : maskEmail(rawEmail);
        navigate("/find-id/result", { state: { email: masked } });
      } else {
        console.error("[find-id] Unexpected response shape:", data);
        alert("아이디 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch (err) {
      const status = err?.response?.status;
      const resp = err?.response?.data;
      console.error("[find-id error]", { status, resp });
      const msg =
        resp?.detail ||
        resp?.message ||
        (status ? `요청 실패 (HTTP ${status})` : "네트워크 오류가 발생했습니다.");
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="findid-page">
      {/* ✅ 가운데 정렬을 담당하는 래퍼 */}
      <div className="center-wrap" role="main" aria-label="아이디 찾기">
        <div className="logo-box" role="img" aria-label="FoodThing 로고">
          <img src={logo} alt="FoodThing" className="logo-img" />
        </div>

        <form className="findid-form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="name">이름</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="이름"
            value={form.name}
            onChange={onChange}
            required
          />

          <label className="sr-only" htmlFor="birth8">생년월일</label>
          <input
            id="birth8"
            name="birth8"
            type="text"
            inputMode="numeric"
            placeholder="생년월일(YYYYMMDD)"
            value={form.birth8}
            onChange={onChange}
            maxLength={8}
            required
          />

          <label className="sr-only" htmlFor="phone_num">휴대폰 번호</label>
          <input
            id="phone_num"
            name="phone_num"
            type="tel"
            inputMode="numeric"
            placeholder="휴대폰 번호(하이픈 없이)"
            value={form.phone_num}
            onChange={onChange}
            maxLength={11}
            required
          />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "조회 중..." : "ID조회"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FindId;
