import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, LogIn, LogOut, User, Star, ChevronDown, Layers, ArrowRight, Search, Trophy, ShieldCheck, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const [decksDropdownOpen, setDecksDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isHome = location.pathname === '/';
  const isBanlist = location.pathname === '/banlist';
  const isDecks = location.pathname.startsWith('/decks') || location.pathname.startsWith('/deck/');
  const isProfile = location.pathname === '/profile';
  const isAdminPage = location.pathname.startsWith('/admin');

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDecksDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng dropdown khi chuyển trang
  useEffect(() => {
    setDecksDropdownOpen(false);
  }, [location.pathname]);

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

        {/* Nút điều hướng: Trang Chủ, Decks (Dropdown phong cách YGOPRODeck), Banlist và Profile */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link
            to="/"
            className={`nav-header-btn ${isHome ? 'active' : ''}`}
          >
            <Home size={16} /> Trang chủ
          </Link>

          {/* DROPDOWN DECKS (THEO MẪU ẢNH NGƯỜI DÙNG CUNG CẤP) */}
          <div className="nav-dropdown-wrap" ref={dropdownRef}>
            <button
              type="button"
              className={`nav-header-btn nav-dropdown-btn ${isDecks ? 'active' : ''}`}
              onClick={() => setDecksDropdownOpen(!decksDropdownOpen)}
              aria-expanded={decksDropdownOpen}
            >
              <Layers size={16} />
              <span>Decks</span>
              <ChevronDown
                size={14}
                style={{
                  transform: decksDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {decksDropdownOpen && (
              <div className="decks-dropdown-menu">
                {/* 1. Deck Categories */}
                <Link
                  to="/decks"
                  className="dropdown-item-block"
                  onClick={() => setDecksDropdownOpen(false)}
                >
                  <div className="dropdown-item-icon">
                    <Layers size={18} />
                  </div>
                  <div className="dropdown-item-text">
                    <div className="item-title">
                      <span>Deck Categories</span>
                      <ArrowRight size={14} className="arrow-icon" />
                    </div>
                    <div className="item-desc">Browse tournament and meta decks</div>
                  </div>
                </Link>

                {/* 2. Advanced Deck Search */}
                <Link
                  to="/decks?search=advanced"
                  className="dropdown-item-block"
                  onClick={() => setDecksDropdownOpen(false)}
                >
                  <div className="dropdown-item-icon">
                    <Search size={18} />
                  </div>
                  <div className="dropdown-item-text">
                    <div className="item-title">
                      <span>Advanced Deck Search</span>
                      <ArrowRight size={14} className="arrow-icon" />
                    </div>
                    <div className="item-desc">Use advanced filters to search decks</div>
                  </div>
                </Link>

                {/* 3. Master Duel Decks */}
                <Link
                  to="/decks?format=Master Duel"
                  className="dropdown-item-block highlight-md"
                  onClick={() => setDecksDropdownOpen(false)}
                >
                  <div className="dropdown-item-icon">
                    <Trophy size={18} color="#f97316" />
                  </div>
                  <div className="dropdown-item-text">
                    <div className="item-title text-orange">
                      <span>Master Duel</span>
                      <ArrowRight size={14} className="arrow-icon" />
                    </div>
                    <div className="item-desc">Browse the tier list and decks</div>
                  </div>
                </Link>

                {/* 4. Deck Builder / Tạo Deck Mới */}
                <Link
                  to="/deck-builder"
                  className="dropdown-item-block"
                  style={{ borderTop: '1px solid var(--border-color)', marginTop: '4px', paddingTop: '8px' }}
                  onClick={() => setDecksDropdownOpen(false)}
                >
                  <div className="dropdown-item-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                    <PlusCircle size={18} />
                  </div>
                  <div className="dropdown-item-text">
                    <div className="item-title text-blue" style={{ color: '#3b82f6' }}>
                      <span>Deck Builder (Tạo Deck)</span>
                      <ArrowRight size={14} className="arrow-icon" />
                    </div>
                    <div className="item-desc">Xây dựng &amp; quản lý bộ bài cá nhân</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/banlist"
            className={`nav-header-btn banlist-nav-btn ${isBanlist ? 'active' : ''}`}
          >
            <ShieldAlert size={16} /> Xem Banlist
          </Link>

          {/* NÚT DÀNH RIÊNG CHO QUẢN TRỊ VIÊN */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-header-btn nav-admin-btn ${isAdminPage ? 'active' : ''}`}
              title="Bảng điều khiển Quản trị viên"
            >
              <ShieldCheck size={16} color="#38bdf8" /> Quản trị
            </Link>
          )}

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
