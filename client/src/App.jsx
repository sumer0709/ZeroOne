import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Arena from './pages/Arena'
import Admin from './pages/Admin'
import Display from './pages/Display'
import Blocked from './pages/Blocked'
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/arena" element={<PrivateRoute><Arena /></PrivateRoute>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/display" element={<Display />} />
        <Route path="/blocked" element={<Blocked />} />
      </Routes>
    </BrowserRouter>
  )
}