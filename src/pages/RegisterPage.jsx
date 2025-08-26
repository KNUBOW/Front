import { useState } from "react";
import axios from "axios";
import "../styles/RegisterPage.css";
import logo from "./../assets/foodthing-logo.png"; // 로고 경로 맞추기

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    checked_password: "", // 확인용
    name: "",
    nickname: "",
    phone: "",
    birth8: "",
    gender: "", // "male" | "female"
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSelectGender = (g) => setForm((prev) => ({ ...prev, gender: g }));

  const validate = () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return alert("이메일 형식을 확인해 주세요.");
    if (form.password.length < 8 || form.password.length > 20)
      return alert("비밀번호는 8~20자 사이여야 합니다.");
    if (!form.checked_password) return alert("비밀번호 확인을 입력해 주세요.");
    if (form.password !== form.checked_password)
      return alert("비밀번호와 비밀번호 확인이 다릅니다.");
    if (!form.name.trim()) return alert("이름을 입력해 주세요.");
    if (!form.nickname.trim()) return alert("닉네임을 입력해 주세요.");
    if (!/^\d{10,11}$/.test(form.phone))
      return alert("전화번호는 하이픈 없이 10~11자리 숫자만 입력해 주세요.");
    if (!/^\d{8}$/.test(form.birth8))
      return alert("생년월일 8자리를 YYYYMMDD로 입력해 주세요.");
    if (!form.gender) return alert("성별을 선택해 주세요.");
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // YYYYMMDD → YYYY-MM-DD 변환
    const birth =
      form.birth8.slice(0, 4) +
      "-" +
      form.birth8.slice(4, 6) +
      "-" +
      form.birth8.slice(6, 8);

    try {
      const res = await axios.post("https://augustzero.mooo.com/users/sign-up", {
        email: form.email,
        password: form.password,
        checked_password: form.checked_password,
        name: form.name,
        nickname: form.nickname,
        phone_num: form.phone,
        birth,
        gender: form.gender === "M" ? "male" : "female", // 백엔드 조건 맞추기
      });

      console.log("[회원가입 성공]", res.data);
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      // TODO: react-router-dom의 useNavigate 사용
      // navigate("/login");
    } catch (err) {
      console.error("[회원가입 실패]", err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "회원가입 중 오류가 발생했습니다.";
      alert(msg);
    }
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
            value={form.password} onChange={onChange} required minLength={8} maxLength={20}
          />

          <label className="sr-only" htmlFor="checked_password">비밀번호 확인</label>
          <input
            id="checked_password" name="checked_password" type="password" placeholder="비밀번호 확인"
            value={form.checked_password} onChange={onChange} required minLength={8} maxLength={20}
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
