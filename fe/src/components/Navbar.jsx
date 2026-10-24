import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="brand">
          <div className="brand-logo">
            <Sparkles size={20} className="brand-icon" />
          </div>
          <div>
            <div className="brand-title">YGO Price Deck</div>
            <div className="brand-subtitle">Tra cứu bài & Giá thị trường</div>
          </div>
        </div>
      </div>
    </header>
  );
}
