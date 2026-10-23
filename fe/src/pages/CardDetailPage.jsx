import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Swords, Star, AlertCircle } from 'lucide-react';
import { getCardById } from '../services/api';
import PriceWidget from '../components/PriceWidget';
import { useTheme } from '../context/ThemeContext';

export default function CardDetailPage() {
  const { id } = useParams();
  const { lang } = useTheme();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getCardById(id)
      .then((res) => {
        if (res.data?.success) {
          setCard(res.data.data);
        } else {
          setError('Không tìm thấy thẻ bài.');
        }
      })
      .catch((err) => {
        setError('Có lỗi xảy ra khi tải dữ liệu thẻ bài.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container loading-detail">
        <div className="spinner"></div>
        <p>{lang === 'vi' ? 'Đang tải thông tin chi tiết...' : 'Loading card details...'}</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="container empty-container">
        <AlertCircle size={40} className="icon-red" />
        <h3>{error || (lang === 'vi' ? 'Không tìm thấy thẻ bài' : 'Card Not Found')}</h3>
        <Link to="/" className="btn-primary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
          <span>{lang === 'vi' ? 'Quay lại danh sách' : 'Back to cards'}</span>
        </Link>
      </div>
    );
  }

  const primaryImage = card.card_images?.[0];
  const imgSrc = primaryImage?.local_image || `/images/cards/${card.id}.jpg`;
  const fallbackSrc = primaryImage?.image_url || 'https://images.ygoprodeck.com/images/cards/back.jpg';

  return (
    <div className="container detail-container">
      <div className="detail-top-nav">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          <span>{lang === 'vi' ? 'Quay lại danh sách thẻ' : 'Back to Card List'}</span>
        </Link>
      </div>

      <div className="detail-layout">
        {/* Ảnh thẻ lớn bên trái */}
        <div className="detail-left">
          <div className="card-large-wrap">
            <img
              src={imgSrc}
              alt={card.name}
              onError={(e) => {
                if (e.target.src !== fallbackSrc) {
                  e.target.src = fallbackSrc;
                }
              }}
              className="card-large-img"
            />
          </div>
          <div className="card-passcode">
            <span>Passcode / ID: <strong>{card.id}</strong></span>
          </div>
        </div>

        {/* Thông tin thẻ bên phải */}
        <div className="detail-right">
          <h1 className="detail-card-name">{card.name}</h1>

          <div className="detail-badges">
            <span className="badge badge-type">{card.type}</span>
            {card.attribute && (
              <span className={`badge badge-attr attr-${card.attribute.toLowerCase()}`}>
                {card.attribute}
              </span>
            )}
            {card.race && <span className="badge badge-race">[{card.race}]</span>}
            {card.banlist_info?.ban_tcg && card.banlist_info.ban_tcg !== 'Unlimited' && (
              <span className="badge badge-banned">TCG: {card.banlist_info.ban_tcg}</span>
            )}
          </div>

          {/* Stats Bar (ATK, DEF, Level/Rank/Link) */}
          <div className="detail-stats-bar">
            {card.level !== undefined && (
              <div className="stat-pill">
                <Star size={18} className="icon-star" />
                <span>{lang === 'vi' ? 'Cấp sao' : 'Level / Rank'}: <strong>{card.level}</strong></span>
              </div>
            )}
            {card.atk !== undefined && (
              <div className="stat-pill">
                <Swords size={18} className="icon-atk" />
                <span>ATK: <strong>{card.atk}</strong></span>
              </div>
            )}
            {card.def !== undefined && (
              <div className="stat-pill">
                <Shield size={18} className="icon-def" />
                <span>DEF: <strong>{card.def}</strong></span>
              </div>
            )}
            {card.linkval !== undefined && (
              <div className="stat-pill">
                <span>LINK: <strong>{card.linkval}</strong></span>
              </div>
            )}
            {card.scale !== undefined && (
              <div className="stat-pill">
                <span>Pendulum Scale: <strong>{card.scale}</strong></span>
              </div>
            )}
          </div>

          {/* Mô tả / Hiệu ứng thẻ */}
          <div className="detail-desc-box">
            <h3 className="desc-title">{lang === 'vi' ? 'Hiệu ứng / Mô tả' : 'Card Text / Effect'}</h3>
            <div className="desc-content">{card.desc}</div>
          </div>

          {/* Khối giá (5 nguồn hàng ngang) + Bảng giá theo từng bộ thẻ */}
          <PriceWidget
            prices={card.card_prices}
            updatedAt={card.price_updated_at}
            sets={card.card_sets}
          />
        </div>
      </div>
    </div>
  );
}
