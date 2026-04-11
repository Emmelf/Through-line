import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from "@/pages/auth/Login.tsx";
import Register from "@/pages/auth/Register.tsx";
import ForgotPassword from "@/pages/auth/ForgotPassword.tsx";
function App() {

    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/forgot-password" element={<ForgotPassword/>} />
        </Routes>
    )
}

export default App
