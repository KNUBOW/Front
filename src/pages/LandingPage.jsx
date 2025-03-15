import React, { useState } from 'react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  // Login Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);  // 애니메이션 중 상태 관리

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
              <input type="text" className="user-name" placeholder="Username" required />
              <input type="password" className="password" placeholder="Password" required />

              {/* 회원가입, 비밀번호 찾기 버튼 */}
              <div className="modal-actions">
                <button type="button" className="register-button">Sign Up</button>
                <button type="button" className="forgot-password-button">Forgot Password?</button>
              </div>
            </form>
            
            <button type="submit" className="login-button">Log In</button>

            <hr className="cross-line"></hr>

            <button className="close-modal" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
