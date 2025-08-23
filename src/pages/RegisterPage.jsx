import { useState } from "react";
import "../styles/RegisterPage.css";
import logo from "./../assets/foodthing-logo.png"; // 로고 경로만 맞추세요

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    nickname: "",
    phone: "",
    birth8: "",
    gender: "", // "M" | "F"
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSelectGender = (g) => setForm((prev) => ({ ...prev, gender: g }));

  const validate = () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return alert("이메일 형식을 확인해 주세요.");
    if (form.password.length < 6) return alert("비밀번호는 6자 이상 입력해 주세요.");
    if (!form.name.trim()) return alert("이름을 입력해 주세요.");
    if (!form.nickname.trim()) return alert("닉네임을 입력해 주세요.");
    if (!/^\d{10,11}$/.test(form.phone)) return alert("전화번호는 하이픈 없이 10~11자리 숫자만 입력해 주세요.");
    if (!/^\d{8}$/.test(form.birth8)) return alert("생년월일 8자리를 YYYYMMDD로 입력해 주세요.");
    if (!form.gender) return alert("성별을 선택해 주세요.");
    return true;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: 회원가입 API 연동
    console.log("register submit", form);
    alert("회원가입 요청 전송 (콘솔 확인)");
  };

  return (
    <div className="register-page">
      <div className="register-wrap">
        <div className="logo-box" role="img" aria-label="FoodThing 로고">
          <img src={logo} alt="FoodThing" className="logo-img" />
        </div>

        <form className="register-form" onSubmit={onSubmit} autoComplete="on">
          <label className="sr-only" htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email" placeholder="Email"
            value={form.email} onChange={onChange} required
          />

          <label className="sr-only" htmlFor="password">비밀번호</label>
          <input
            id="password" name="password" type="password" placeholder="비밀번호"
            value={form.password} onChange={onChange} required minLength={6}
          />

          <label className="sr-only" htmlFor="name">이름</label>
          <input
            id="name" name="name" type="text" placeholder="이름"
            value={form.name} onChange={onChange} required
          />

          <label className="sr-only" htmlFor="nickname">닉네임</label>
          <input
            id="nickname" name="nickname" type="text" placeholder="닉네임"
            value={form.nickname} onChange={onChange} required
          />

          <label className="sr-only" htmlFor="phone">전화번호</label>
          <input
            id="phone" name="phone" type="tel" inputMode="numeric" placeholder="전화번호"
            value={form.phone}
            onChange={(e) => {
              const onlyNum = e.target.value.replace(/\D/g, "");
              setForm((p) => ({ ...p, phone: onlyNum }));
            }}
            maxLength={11} required
          />

          <label className="sr-only" htmlFor="birth8">생년월일 8자리</label>
          <input
            id="birth8" name="birth8" type="text" inputMode="numeric" placeholder="생년월일 8자리"
            value={form.birth8}
            onChange={(e) => {
              const onlyNum = e.target.value.replace(/\D/g, "").slice(0, 8);
              setForm((p) => ({ ...p, birth8: onlyNum }));
            }}
            maxLength={8} required
          />

          <div className="gender-row" role="group" aria-label="성별 선택">
            <button
              type="button"
              className={`gender-btn ${form.gender === "M" ? "active" : ""}`}
              onClick={() => onSelectGender("M")}
              aria-pressed={form.gender === "M"}
            >남자</button>
            <button
              type="button"
              className={`gender-btn ${form.gender === "F" ? "active" : ""}`}
              onClick={() => onSelectGender("F")}
              aria-pressed={form.gender === "F"}
            >여자</button>
          </div>

          <button type="submit" className="btn-register">회원가입</button>
        </form>
      </div>
    </div>
  );
}

export default Register;