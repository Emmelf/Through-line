import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from "@/pages/auth/Login.tsx";
import Register from "@/pages/auth/Register.tsx";
import ForgotPassword from "@/pages/auth/ForgotPassword.tsx";
import MainLayout from "@/layouts/MainLayout.tsx";
function App() {

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/forgot-password" element={<ForgotPassword/>} />
            </Route>
        </Routes>
    )
}

export default App
