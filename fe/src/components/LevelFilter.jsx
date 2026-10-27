import React from 'react';

export default function LevelFilter({ levels = [], selectedLevel, onLevelChange }) {
  return (
    <div className="filter-box">
      <select
        value={selectedLevel}
        onChange={(e) => onLevelChange(e.target.value)}
        className="filter-select-inline"
        aria-label="Lọc theo cấp sao"
      >
        <option value="">-- Cấp sao (⭐) --</option>
        {levels.map((lvl) => (
          <option key={lvl} value={lvl}>
            ⭐ {lvl} sao
          </option>
        ))}
      </select>
    </div>
  );
}
