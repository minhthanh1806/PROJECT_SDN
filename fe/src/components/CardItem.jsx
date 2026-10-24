import React, { useState } from 'react';

export default function CardItem({ card }) {
  const [imgSrc, setImgSrc] = useState(
    card.card_images?.[0]?.local_image_small || 
    `/images/cards/${card.id}_small.jpg`
  );

  const fallbackRemote = card.card_images?.[0]?.image_url_small || 
    'https://images.ygoprodeck.com/images/cards_small/back.jpg';

  const handleImgError = () => {
    if (imgSrc !== fallbackRemote) {
      setImgSrc(fallbackRemote);
    }
  };

  const minPrice = card.min_price || 0;

  return (
    <div className="card-item">
      <div className="card-img-wrap">
        <img
          src={imgSrc}
          alt={card.name}
          onError={handleImgError}
          loading="lazy"
          className="card-img"
        />
        {card.level !== undefined && (
          <span className="card-level-badge">⭐ {card.level}</span>
        )}
      </div>

      <div className="card-info">
        <h4 className="card-name" title={card.name}>{card.name}</h4>
        
        {/* Type & Attribute */}
        <div className="card-tags">
          <span className="card-type-tag">{card.race || card.type}</span>
          {card.attribute && (
            <span className={`card-attr-tag attr-${card.attribute.toLowerCase()}`}>
              {card.attribute}
            </span>
          )}
        </div>

        {/* Stats (ATK / DEF / LINK) */}
        {(card.atk !== undefined || card.linkval !== undefined) && (
          <div className="card-stats-row">
            {card.atk !== undefined && <span>ATK: <strong>{card.atk}</strong></span>}
            {card.def !== undefined && <span>DEF: <strong>{card.def}</strong></span>}
            {card.linkval !== undefined && <span>LINK: <strong>{card.linkval}</strong></span>}
          </div>
        )}

        {/* Lowest Price */}
        <div className="card-price-bottom">
          <span className="price-label">Giá thấp nhất:</span>
          <span className="price-value">
            {minPrice > 0 ? `$${minPrice.toFixed(2)}` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
