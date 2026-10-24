import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Tìm kiếm tên thẻ bài (vd: Magician, Dragon...)' }) {
  const [localText, setLocalText] = useState(value || '');

  useEffect(() => {
    setLocalText(value || '');
  }, [value]);

  // Debounce tự động tìm kiếm sau 350ms khi gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localText !== value) {
        onChange(localText);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [localText]);

  const handleClear = () => {
    setLocalText('');
    onChange('');
  };

  return (
    <div className="search-bar-wrap">
      <div className="search-bar">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange(localText);
            }
          }}
          className="search-input"
        />
        {localText && (
          <button className="clear-btn" onClick={handleClear} type="button" title="Xóa tìm kiếm">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
