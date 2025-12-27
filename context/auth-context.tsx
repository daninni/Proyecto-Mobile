import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/auth-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    token: string | null;
    userEmail: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const rehydrateSession = async () => {
            try {
                const [storedToken, storedEmail] = await Promise.all([
                    AsyncStorage.getItem('token'),
                    AsyncStorage.getItem('userEmail'),
                ]);

                if (storedToken) {
                    setToken(storedToken);
                }
                if (storedEmail) {
                    setUserEmail(storedEmail);
                }
            } finally {
                setLoading(false);
            }
        };

        rehydrateSession();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await authService.login({ email, password });
            setToken(response.data.token);
            setUserEmail(email);
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('userEmail', email);
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await authService.register({ email, password });
            setToken(response.data.token);
            setUserEmail(email);
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('userEmail', email);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setToken(null);
        setUserEmail(null);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userEmail');
    };

    return (
        <AuthContext.Provider value={{ token, userEmail, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}