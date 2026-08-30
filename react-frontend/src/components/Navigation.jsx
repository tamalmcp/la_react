import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-brand">
                    <Link to="/products">MyApp</Link>
                </div>
                <div className="nav-links">
                    <Link 
                        to="/products" 
                        className={location.pathname === '/products' ? 'active' : ''}
                    >
                        Products
                    </Link>
                    {user?.role === 'admin' && (
                        <Link 
                            to="/users" 
                            className={location.pathname === '/users' ? 'active' : ''}
                        >
                            Users
                        </Link>
                    )}
                </div>
                <div className="nav-user">
                    <span>{user.name}</span>
                    {user?.role === 'admin' && (
                        <span className="nav-badge">Admin</span>
                    )}
                    <button onClick={logout} className="nav-logout">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;