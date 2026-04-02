import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = JSON.parse(localStorage.getItem('user'));
                    setUser(userData);
                } catch (err) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    // Smart Polling for Approval Status
    useEffect(() => {
        let interval;
        if (user && !user.isEmailVerified) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get('/auth/profile');
                    if (res.data.isEmailVerified) {
                        updateUser({ isEmailVerified: true });
                        // Optional: showToast('success', 'Your account has been approved! Redirecting...');
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 15000); // Poll every 15 seconds
        }
        return () => clearInterval(interval);
    }, [user]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return res.data;
    };

    const register = async (name, email, password, role, whatsapp) => {
        const res = await api.post('/auth/register', { name, email, password, role, whatsapp });
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        localStorage.setItem('user', JSON.stringify(newUser));
        if (updatedData.token) {
            localStorage.setItem('token', updatedData.token);
        }
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
