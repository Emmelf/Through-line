import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactElement } from "react";
import Home from './pages/Home'
import Login from "@/pages/auth/Login.tsx";
import Register from "@/pages/auth/Register.tsx";
import ForgotPassword from "@/pages/auth/ForgotPassword.tsx";
import MainLayout from "@/layouts/MainLayout.tsx";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";

function Protected({ isAuthenticated, children }: Readonly<{ isAuthenticated: boolean; children: ReactElement }>) {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ isAuthenticated, children }: Readonly<{ isAuthenticated: boolean; children: ReactElement }>) {
    return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
    const { loading, user } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    const isAuthenticated = Boolean(user);

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Protected isAuthenticated={isAuthenticated}><Home/></Protected>} />
                <Route path="/login" element={<PublicOnly isAuthenticated={isAuthenticated}><Login/></PublicOnly>} />
                <Route path="/register" element={<PublicOnly isAuthenticated={isAuthenticated}><Register/></PublicOnly>} />
                <Route path="/forgot-password" element={<PublicOnly isAuthenticated={isAuthenticated}><ForgotPassword/></PublicOnly>} />
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
