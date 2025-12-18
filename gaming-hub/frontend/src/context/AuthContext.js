import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await authAPI.getCurrentUser();
                const apiUser = response.data.user;
                // Normalize Mongo _id to id so the frontend can consistently use user.id
                const normalizedUser = apiUser && apiUser._id && !apiUser.id
                    ? { ...apiUser, id: apiUser._id }
                    : apiUser;
                setUser(normalizedUser);
            } catch (err) {
                console.error('Session check failed:', err);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setUser(user);
            return { success: true, user };
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Login failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const register = async (username, email, password) => {
        try {
            setError(null);
            const response = await authAPI.register({ username, email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setUser(user);
            return { success: true, user };
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Registration failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        setUser,
        loading,
        error,
        login,
        register,
        logout,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};