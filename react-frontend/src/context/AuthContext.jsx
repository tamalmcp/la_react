import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "../api/axiosConfig";

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
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [permissions, setPermissions] = useState([]);

    // Set up axios intercepter for token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await axios.get('/user');
                    // setUser(response.data);
                    setUser(response.data.user);
                    // Store permissions in state or localStorage
                    setPermissions(response.data.permissions);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/login', { email, password });
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (name, email, password, password_confirmation) => {
        try {
            const response = await axios.post('/register', {
                name,
                email,
                password,
                password_confirmation
            });
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await axios.post('/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    // Check if the user has a single permission
    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    // Check if the user has at least one of the given permissions
    const hasAnyPermission = (permissionList = []) => {
        return permissionList.some((permission) => permissions.includes(permission));
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
        permissions,
        hasPermission,
        hasAnyPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}