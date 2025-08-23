import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Register from './pages/RegisterPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
       <Route path="/" element={<LoginPage/>}/>
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </Router>
  )
}

export default App
