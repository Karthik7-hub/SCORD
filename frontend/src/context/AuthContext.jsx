import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// --- CONFIGURATION ---
const API_URL = process.env.APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('cricket_pro_user');
        if (savedUser) setUser(JSON.parse(savedUser));
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        console.log(`Attempting login to: ${API_URL}/auth/login`);

        try {
            // FIX: Using API_URL variable
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            console.log("Server Response:", data);

            if (res.ok) {
                const userData = { ...data, email };
                localStorage.setItem('cricket_pro_user', JSON.stringify(userData));
                setUser(userData);
                return { success: true };
            } else {
                return { success: false, msg: data.msg || 'Invalid Credentials' };
            }
        } catch (err) {
            console.error("Login Error:", err);
            return { success: false, msg: 'Server connection failed. Is the backend running?' };
        }
    };

    const logout = () => {
        localStorage.removeItem('cricket_pro_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);