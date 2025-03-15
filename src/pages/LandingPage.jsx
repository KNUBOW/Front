import React, { useState } from 'react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  // Login Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);  // 애니메이션 중 상태 관리

  // Email과 Password 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');  // 로그인 실패 에러 상태

  // Open Login Modal Function
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close Login Modal Function with animation
  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 300);
  };

  // Email 유효성 검사
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

    
  // 일방적인 로그인 처리 (사용자 이메일과 비밀번호를 통한 로그인)
  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email (e.g., xxx@domain.com)');
      return;
    }
  
    setEmailError(''); // 에러 메시지 초기화
    setLoginError('');  // 로그인 에러 초기화
  
    try {
      const response = await fetch('http://3.37.142.74:8000/users/log-in', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data);
          
        // 로그인 성공 시 accessToken을 로컬 스토리지에 저장
        localStorage.setItem("accessToken", data.accessToken);
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message || 'Login failed');  // 로그인 실패 시 에러 메시지 출력
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred during login');
    }
  };

  const handleNaverLogin = async () => {
    try {
      const response = await fetch('http://3.37.142.74:8000/users/naver', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if(response.ok) {
        const data = await response.json();
        console.log(data);
      }

      localStorage.setItem("accessToken", data.accessToken);

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="landing-container">
      <h1 className="landing-title">Welcome to FoodThing</h1>
      <p className="landing-description">
        Discover the best food near you. Find and explore amazing dishes from various cuisines.
      </p>
      <button className="landing-button" onClick={openModal}>Get Started</button>

      {/* Login Modal */}
      {isModalOpen && (
        <div className={`modal-overlay ${isClosing ? 'modal-closing' : ''}`} onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-name">Login</h2>
            <form>
              <input 
                type="text" className="user-email" placeholder="Email" required 
                value={email} onChange={(e) => setEmail(e.target.value)}/>
                {emailError && <p className="error-message">{emailError}</p>}
                
              <input 
                type="password" className="password" placeholder="Password" required 
                value={password} onChange={(e) => setPassword(e.target.value)}/>

              {/* 회원가입, 비밀번호 찾기 버튼 */}
              <div className="modal-actions">
                <button type="button" className="register-button">Sign Up</button>
                <button type="button" className="forgot-password-button">Forgot Password?</button>
              </div>
            </form>
            
            <button type="submit" className="login-button" onClick={handleLogin}>Log In</button>
            {loginError && <p className="error-message">{loginError}</p>}

            <button type="button" className="naver-login-button" onClick={handleNaverLogin}>Naver-Login</button>
            <button type="button" className="kakao-login-button">Kakao-Login</button>

            <hr className="cross-line"></hr>

            <button className="close-modal" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
