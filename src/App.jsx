import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Register from './pages/RegisterPage'
import FindId from './pages/FindId'
import FindIdResult from './pages/FindIdResult'
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
       <Route path="/" element={<LoginPage/>}/>
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
