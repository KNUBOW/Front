import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Register from './pages/RegisterPage'
import FindId from './pages/FindId'
import FindIdResult from './pages/FindIdResult'
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TodayWhatEat from './pages/TodayWhatEat'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
       <Route path="/" element={<TodayWhatEat/>}/>
       <Route path="/login" element={<LoginPage/>}/>
       <Route path="/register" element={<Register/>}/>
       <Route path="/find-id" element={<FindId/>}/>
       <Route path="/find-id/result" element={<FindIdResult/>}/>
       <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  )
}

export default App
