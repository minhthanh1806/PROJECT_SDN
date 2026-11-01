import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, LogIn, LogOut, User, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isBanlist = location.pathname === '/banlist';
  const isHome = location.pathname === '/';
  const isProfile = location.pathname === '/profile';

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

        {/* Nút điều hướng giữa Trang Chủ, Banlist và Trang cá nhân */}
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
              <Link
                to="/profile"
                className={`nav-header-btn ${isProfile ? 'active' : ''}`}
                title="Xem hồ sơ & Bộ sưu tập thẻ bài"
              >
                <Star size={16} fill={isProfile ? '#fbbf24' : 'none'} color={isProfile ? '#fbbf24' : '#e2e8f0'} />
                <span>Bộ sưu tập ({user.favorites?.length || 0})</span>
              </Link>

              <Link
                to="/profile"
                className="nav-user"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
                title="Trang cá nhân"
              >
                <User size={16} />
                <span><strong>{user.username}</strong></span>
              </Link>

              <button className="nav-header-btn" onClick={handleLogout} type="button" title="Đăng xuất">
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
