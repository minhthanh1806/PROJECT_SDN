import React from 'react';

export default function Navbar() {
  return (
    <header className="header">
      <div className="container header-content">
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
      </div>
    </header>
  );
}
