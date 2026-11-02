import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CardItem({ card, onFavoriteChange }) {
  const [imgSrc, setImgSrc] = useState(
    card.card_images?.[0]?.local_image_small || 
    `/images/cards/${card.id}_small.jpg`
  );

  const { user, isCardFavorited, toggleFavorite } = useAuth();
  const [isFavorited, setIsFavorited] = useState(isCardFavorited(card.id));
  const [starLoading, setStarLoading] = useState(false);

  React.useEffect(() => {
    setIsFavorited(isCardFavorited(card.id));
  }, [user, card.id]);

  const fallbackRemote = card.card_images?.[0]?.image_url_small || 
    'https://images.ygoprodeck.com/images/cards_small/back.jpg';

  const handleImgError = () => {
    if (imgSrc !== fallbackRemote) {
      setImgSrc(fallbackRemote);
    }
  };

  const handleStarClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Vui lòng đăng nhập để lưu thẻ vào bộ sưu tập!');
      return;
    }
    if (starLoading) return;
    setStarLoading(true);
    const res = await toggleFavorite(card.id);
    setStarLoading(false);
    if (res.success) {
      setIsFavorited(res.isFavorited);
      if (onFavoriteChange) onFavoriteChange(card.id, res.isFavorited);
    }
  };

  const minPrice = card.min_price || 0;

  return (
    <div className="card-item">
      <Link to={`/card/${card.id}`} className="card-item-link" title={`Xem chi tiết thẻ ${card.name}`}>
        <div className="card-img-wrap">
          <img
            src={imgSrc}
            alt={card.name}
            onError={handleImgError}
            loading="lazy"
            className="card-img"
          />

          {/* Nút bấm yêu thích / lưu vào bộ sưu tập */}
          <button
            type="button"
            onClick={handleStarClick}
            className={`card-fav-btn ${isFavorited ? 'favorited' : ''}`}
            title={isFavorited ? 'Bỏ khỏi bộ sưu tập' : 'Lưu vào bộ sưu tập'}
            disabled={starLoading}
          >
            <Star size={16} fill={isFavorited ? '#fbbf24' : 'none'} color={isFavorited ? '#fbbf24' : '#ffffff'} />
          </button>

          {card.level !== undefined && (
            <span className="card-level-badge">⭐ {card.level}</span>
          )}
        </div>

        <div className="card-info">
          <h4 className="card-name" title={card.name}>{card.name}</h4>
          
          {/* Type & Attribute */}
          <div className="card-tags">
            <span className="card-type-tag">{card.type}</span>
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
      </Link>
    </div>
  );
}
