import React from 'react';

export default function CardSort({ sortBy, onSortChange }) {
  return (
    <div className="filter-box">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="filter-select-inline"
        aria-label="Sắp xếp theo giá"
      >
        <option value="name">Tên: A → Z</option>
        <option value="price_asc">Giá: Thấp → Cao 📈</option>
        <option value="price_desc">Giá: Cao → Thấp 📉</option>
      </select>
    </div>
  );
}
