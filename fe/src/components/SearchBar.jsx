import React, { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SearchBar({ value, onChange, onOpenFilterDrawer }) {
  const { lang } = useTheme();
  const [localText, setLocalText] = useState(value || '');

  useEffect(() => {
    setLocalText(value || '');
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onChange(localText);
    }
  };

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
          placeholder={lang === 'vi' ? 'Tìm theo tên thẻ bài (vd: Magician, Dragon...)' : 'Search card name (e.g. Magician, Dragon...)'}
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onChange(localText)}
          className="search-input"
        />
        {localText && (
          <button className="clear-btn" onClick={handleClear} type="button">
            <X size={18} />
          </button>
        )}
      </div>

      <button className="mobile-filter-btn" onClick={onOpenFilterDrawer} type="button">
        <SlidersHorizontal size={18} />
        <span>{lang === 'vi' ? 'Bộ lọc' : 'Filters'}</span>
      </button>
    </div>
  );
}
