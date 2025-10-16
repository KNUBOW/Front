// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import Register from './pages/RegisterPage';
import FindId from './pages/FindId';
import FindIdResult from './pages/FindIdResult';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import TodayWhatEat from './pages/TodayWhatEat';
import Recommend from './pages/RecommendPage';
import Board from './pages/BoardPage';
import Ranking from './pages/RankingPage';
import SettingsPage from './pages/SettingsPage';
import BoxPage from './pages/BoxPage';
import RecipePage from './pages/RecipePage';
import RecommendResultPage from './pages/RecommendResultPage';
import BoardWritePage from './pages/BoardWritePage';
import LikesPage from './pages/LikesPage';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import './App.css';

function App() {
  // 모바일 100vh / 100vw 이슈 대응: --vh / --vw 변수 설정
  const setScreenSize = () => {
    const vh = window.innerHeight * 0.01;
    const vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
  };

  useEffect(() => {
    setScreenSize(); // 최초 1회
    window.addEventListener('resize', setScreenSize);
    window.addEventListener('orientationchange', setScreenSize);
    return () => {
      window.removeEventListener('resize', setScreenSize);
      window.removeEventListener('orientationchange', setScreenSize);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/find-id" element={<FindId />} />
          <Route path="/find-id/result" element={<FindIdResult />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 보호 라우트(로그인 필요) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TodayWhatEat />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/board" element={<Board />} />
            <Route path="/rank" element={<Ranking />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/box" element={<BoxPage />} />
            <Route path="/recipe" element={<RecipePage />} />
            <Route path="/recommend/result" element={<RecommendResultPage />} />
            <Route path="/board/write" element={<BoardWritePage />} />
            <Route path="/likes" element={<LikesPage />} />
          </Route>

          {/* 404 등 필요시 추가 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
