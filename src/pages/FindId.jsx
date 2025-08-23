import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/findid.css";
import logo from "./../assets/foodthing-logo.png";

const FindId = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", birth8: "" });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "birth8" ? value.replace(/\D/g, "").slice(0, 8) : value }));
  };

  const validate = () => {
    if (!form.name.trim()) return alert("이름을 입력해 주세요.");
    if (!/^\d{8}$/.test(form.birth8)) return alert("생년월일 8자리를 YYYYMMDD로 입력해 주세요.");
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("이름을 입력해 주세요.");
    if (!/^\d{8}$/.test(form.birth8)) return alert("생년월일 8자리를 입력해 주세요.");

    // TODO: 실제 API 호출 후 이메일 받아오기
    const foundEmail = "abcdefg@naver.com";

    // ✅ 결과 페이지로 이동 + state로 값 전달
    navigate("/find-id/result", { state: { email: foundEmail } });
  };

  return (
    <div className="findid-page">
      <div className="findid-wrap">
        <div className="logo-box" role="img" aria-label="FoodThing 로고">
          <img src={logo} alt="FoodThing" className="logo-img" />
        </div>

        <form className="findid-form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="name">이름</label>
          <input
            id="name" name="name" type="text" placeholder="이름"
            value={form.name} onChange={onChange} required
          />

          <label className="sr-only" htmlFor="birth8">생년월일</label>
          <input
            id="birth8" name="birth8" type="text" inputMode="numeric" placeholder="생년월일"
            value={form.birth8} onChange={onChange} maxLength={8} required
          />

          <button type="submit" className="btn-primary">ID조회</button>
        </form>
      </div>
    </div>
  );
}

export default FindId;