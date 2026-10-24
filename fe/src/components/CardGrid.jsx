import React from 'react';
import CardItem from './CardItem';

export default function CardGrid({ cards, loading }) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tìm kiếm thẻ bài...</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-icon">🎴</div>
        <h3>Không tìm thấy thẻ bài nào</h3>
        <p>Hãy thử tìm bằng từ khóa khác (ví dụ: Magician, Dragon, Dark, Eyes...)</p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
}
