import React from 'react';

export default function CardFilter({ types = [], selectedType, onTypeChange }) {
  return (
    <div className="filter-box">
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        className="filter-select-inline"
        aria-label="Lọc theo loại thẻ"
      >
        <option value="">-- Tất cả loại thẻ --</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}
