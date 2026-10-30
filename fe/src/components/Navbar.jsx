import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isBanlist = location.pathname === '/banlist';

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

        {/* Nút điều hướng giữa Trang Chủ và Trang Banlist */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/"
            className={`nav-header-btn ${!isBanlist ? 'active' : ''}`}
          >
            <Home size={16} /> Trang chủ
          </Link>
          <Link
            to="/banlist"
            className={`nav-header-btn banlist-nav-btn ${isBanlist ? 'active' : ''}`}
          >
            <ShieldAlert size={16} /> Xem Banlist
          </Link>
        </nav>
      </div>
    </header>
  );
}
