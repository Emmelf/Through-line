import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import axios from '@/lib/axios';

interface User {
    id: string;
    email: string;
    username: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = Readonly<{ children?: ReactNode }>;

export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUser = useCallback(async () => {
        try {
            const response = await axios.get('/api/me');
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch user once on mount
    useEffect(() => {
        // call and surface any unexpected errors
        fetchUser().catch((err) => console.error('fetchUser effect error:', err));
    }, [fetchUser]);

    const setAuthUser = useCallback((u: User | null) => {
        setUser(u);
        setLoading(false);
    }, []);

    const refetchUser = useCallback(async () => {
        setLoading(true);
        await fetchUser();
    }, [fetchUser]);

    const logout = useCallback(async () => {
        try {
            await axios.post('/api/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, []);

    const value = useMemo(
        () => ({ user, loading, logout, setUser: setAuthUser, refetchUser }),
        [user, loading, logout, setAuthUser, refetchUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
