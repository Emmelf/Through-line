import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from "@/pages/auth/Login.tsx";
import Register from "@/pages/auth/Register.tsx";
import ForgotPassword from "@/pages/auth/ForgotPassword.tsx";
import MainLayout from "@/layouts/MainLayout.tsx";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";

function AppRoutes() {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/forgot-password" element={<ForgotPassword/>} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}

export default App
