import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, signOut as apiSignOut, type User } from '../lib/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkSession();
    }, []);

    async function checkSession() {
        try {
            const response = await getSession();
            if (response.success && response.user) {
                setUser(response.user);
            }
        } catch (error) {
            console.error('Session check failed:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function logout() {
        await apiSignOut();
        setUser(null);
    }

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        setUser,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
