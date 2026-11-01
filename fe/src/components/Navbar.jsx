import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isBanlist = location.pathname === '/banlist';
  const isHome = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="brand">
            <img
              src="/yugioh-logo.png"
              alt="Yu-Gi-Oh! Logo"
              className="brand-logo-img"
            />
            <div>
              <div className="brand-title">YGO Price Deck</div>
              <div className="brand-subtitle">Tra cứu bài & Giá thị trường</div>
            </div>
          </div>
        </Link>

        {/* Nút điều hướng giữa Trang Chủ, Trang Banlist và Đăng nhập / Đăng xuất */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/"
            className={`nav-header-btn ${isHome ? 'active' : ''}`}
          >
            <Home size={16} /> Trang chủ
          </Link>
          <Link
            to="/banlist"
            className={`nav-header-btn banlist-nav-btn ${isBanlist ? 'active' : ''}`}
          >
            <ShieldAlert size={16} /> Xem Banlist
          </Link>

          {user ? (
            <>
              <span className="nav-user">
                <User size={16} /> Xin chào, <strong>{user.username}</strong>
              </span>
              <button className="nav-header-btn" onClick={handleLogout} type="button">
                <LogOut size={16} /> Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-header-btn">
              <LogIn size={16} /> Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
