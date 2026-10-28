import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const renderPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(
        <button key={1} className="page-btn" onClick={() => onPageChange(1)}>
          1
        </button>
      );
      if (start > 2) {
        pages.push(<span key="dots-1" className="page-dots">...</span>);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(<span key="dots-2" className="page-dots">...</span>);
      }
      pages.push(
        <button key={totalPages} className="page-btn" onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="pagination">
      <button
        className="page-btn nav-btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        title="Trang trước"
      >
        <ChevronLeft size={16} />
        <span>Trước</span>
      </button>

      <div className="pages-list" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
        {renderPages()}
      </div>

      <button
        className="page-btn nav-btn"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        title="Trang sau"
      >
        <span>Sau</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
