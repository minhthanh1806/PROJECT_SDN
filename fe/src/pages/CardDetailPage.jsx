import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCardById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Star,
  ShieldAlert,
  Coins,
  Clock,
  Layers
} from 'lucide-react';

export default function CardDetailPage() {
  const { id } = useParams();
  const { user, isCardFavorited, toggleFavorite } = useAuth();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [starLoading, setStarLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCardById(id)
      .then((res) => {
        if (res.data?.success) {
          setCard(res.data.data);
          setIsFavorited(isCardFavorited(res.data.data.id));
        } else {
          setError('Không tìm thấy thông tin thẻ bài');
        }
      })
      .catch((err) => {
        console.error('Error fetching card detail:', err);
        setError('Có lỗi xảy ra khi tải thông tin thẻ bài');
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu thẻ vào bộ sưu tập!');
      return;
    }
    if (starLoading || !card) return;
    setStarLoading(true);
    const res = await toggleFavorite(card.id);
    setStarLoading(false);
    if (res.success) {
      setIsFavorited(res.isFavorited);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Gần đây';
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
          <div className="loading-container">
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Đang tải chi tiết lá bài #{id}...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
          <div className="empty-container">
            <h2>{error || 'Không tìm thấy thẻ bài'}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Thẻ bài có mã số #{id} không tồn tại hoặc đã bị xóa.
            </p>
            <Link to="/" className="btn-primary">
              <ArrowLeft size={16} /> Quay lại trang chủ
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const largeImgSrc =
    card.card_images?.[0]?.image_url ||
    card.card_images?.[0]?.local_image ||
    `/images/cards/${card.id}.jpg`;

  const banStatus = card.banlist_info?.ban_tcg || card.banlist_info?.ban_ocg || 'Unlimited';

  const prices = card.card_prices || {};
  const sets = card.card_sets || [];

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container detail-container">
        {/* Nút quay lại */}
        <div className="detail-top-nav">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} /> Quay lại danh sách
          </Link>
        </div>

        {/* Bố cục trang chi tiết: Trái là ảnh lớn, Phải là thông tin + giá */}
        <div className="detail-layout">
          {/* CỘT TRÁI: Ảnh thẻ bài lớn + Nút lưu bộ sưu tập */}
          <div className="detail-left-col">
            <div className="card-large-wrap">
              <img
                src={largeImgSrc}
                alt={card.name}
                className="card-large-img"
                onError={(e) => {
                  e.target.src = 'https://images.ygoprodeck.com/images/cards/back.jpg';
                }}
              />
            </div>

            <div className="card-passcode">
              Mã thẻ (Passcode): <strong>{card.id}</strong>
            </div>

            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={starLoading}
              className={`detail-fav-btn ${isFavorited ? 'favorited' : ''}`}
            >
              <Star
                size={18}
                fill={isFavorited ? '#fbbf24' : 'none'}
                color={isFavorited ? '#fbbf24' : 'currentColor'}
              />
              <span>
                {isFavorited ? 'Đã lưu trong bộ sưu tập' : 'Lưu vào bộ sưu tập'}
              </span>
            </button>
          </div>

          {/* CỘT PHẢI: Thông tin, Chỉ số, Hiệu ứng, Khối giá 5 nguồn và Bảng bộ thẻ */}
          <div className="detail-right-col">
            <h1 className="detail-card-name">{card.name}</h1>

            {/* Các huy hiệu: Loại thẻ, Chủng loài, Thuộc tính, Tình trạng Banlist */}
            <div className="detail-badges">
              <span className="badge badge-type">{card.type}</span>
              {card.race && <span className="badge badge-race">{card.race}</span>}
              {card.attribute && (
                <span className={`badge badge-attr attr-${card.attribute.toLowerCase()}`}>
                  {card.attribute}
                </span>
              )}
              {card.archetype && (
                <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  Archetype: {card.archetype}
                </span>
              )}
              {banStatus && banStatus !== 'Unlimited' && (
                <span className="badge badge-banned">
                  <ShieldAlert size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                  {banStatus} (TCG)
                </span>
              )}
            </div>

            {/* Chỉ số: Level/Rank/Link, ATK, DEF */}
            {(card.level !== undefined || card.atk !== undefined || card.def !== undefined || card.linkval !== undefined) && (
              <div className="detail-stats-bar">
                {card.level !== undefined && (
                  <div className="stat-pill">
                    <span>Cấp sao: <strong>{card.level}</strong></span>
                  </div>
                )}
                {card.atk !== undefined && (
                  <div className="stat-pill">
                    <span>ATK: <strong>{card.atk}</strong></span>
                  </div>
                )}
                {card.def !== undefined && (
                  <div className="stat-pill">
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
                    <span>Scale: <strong>{card.scale}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Khung mô tả / Hiệu ứng lá bài */}
            <div className="detail-desc-box">
              <div className="desc-title">Hiệu ứng / Mô tả lá bài:</div>
              <div className="desc-content">{card.desc || 'Không có mô tả cho thẻ này.'}</div>
            </div>

            {/* KHỐI GIÁ THỊ TRƯỜNG TỪ 5 NGUỒN (Cardmarket, TCGplayer, eBay, Amazon, CoolStuffInc) */}
            <div className="price-widget-container">
              <div className="price-widget-header">
                <div className="price-widget-title">
                  <Coins className="icon-green" size={20} />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                    Giá Thị Trường (5 Sàn Giao Dịch)
                  </h3>
                </div>
                <div className="price-update-time">
                  <Clock size={14} />
                  <span>Cập nhật: {formatDate(card.price_updated_at)}</span>
                </div>
              </div>

              <div className="price-disclaimer">
                Giá thấp nhất ghi nhận trên từng sàn giao dịch quốc tế:
              </div>

              <div className="price-grid-5">
                {/* 1. Cardmarket (€) */}
                <div className={`price-card ${!prices.cardmarket_price || Number(prices.cardmarket_price) <= 0 ? 'is-out-of-stock' : ''}`}>
                  <div className="price-source-name">Cardmarket</div>
                  <div className={`price-tag-amount ${!prices.cardmarket_price || Number(prices.cardmarket_price) <= 0 ? 'is-na' : ''}`}>
                    {prices.cardmarket_price && Number(prices.cardmarket_price) > 0 ? `€${Number(prices.cardmarket_price).toFixed(2)}` : 'Chưa có hàng'}
                  </div>
                  <div className="price-region">Châu Âu (Euro)</div>
                </div>

                {/* 2. TCGplayer ($) */}
                <div className={`price-card ${!prices.tcgplayer_price || Number(prices.tcgplayer_price) <= 0 ? 'is-out-of-stock' : ''}`}>
                  <div className="price-source-name">TCGplayer</div>
                  <div className={`price-tag-amount ${!prices.tcgplayer_price || Number(prices.tcgplayer_price) <= 0 ? 'is-na' : ''}`}>
                    {prices.tcgplayer_price && Number(prices.tcgplayer_price) > 0 ? `$${Number(prices.tcgplayer_price).toFixed(2)}` : 'Chưa có hàng'}
                  </div>
                  <div className="price-region">Bắc Mỹ (USD)</div>
                </div>

                {/* 3. eBay ($) */}
                <div className={`price-card ${!prices.ebay_price || Number(prices.ebay_price) <= 0 ? 'is-out-of-stock' : ''}`}>
                  <div className="price-source-name">eBay</div>
                  <div className={`price-tag-amount ${!prices.ebay_price || Number(prices.ebay_price) <= 0 ? 'is-na' : ''}`}>
                    {prices.ebay_price && Number(prices.ebay_price) > 0 ? `$${Number(prices.ebay_price).toFixed(2)}` : 'Chưa có hàng'}
                  </div>
                  <div className="price-region">Quốc tế (USD)</div>
                </div>

                {/* 4. Amazon ($) */}
                <div className={`price-card ${!prices.amazon_price || Number(prices.amazon_price) <= 0 ? 'is-out-of-stock' : ''}`}>
                  <div className="price-source-name">Amazon</div>
                  <div className={`price-tag-amount ${!prices.amazon_price || Number(prices.amazon_price) <= 0 ? 'is-na' : ''}`}>
                    {prices.amazon_price && Number(prices.amazon_price) > 0 ? `$${Number(prices.amazon_price).toFixed(2)}` : 'Chưa có hàng'}
                  </div>
                  <div className="price-region">Quốc tế (USD)</div>
                </div>

                {/* 5. CoolStuffInc ($) */}
                <div className={`price-card ${!prices.coolstuffinc_price || Number(prices.coolstuffinc_price) <= 0 ? 'is-out-of-stock' : ''}`}>
                  <div className="price-source-name">CoolStuffInc</div>
                  <div className={`price-tag-amount ${!prices.coolstuffinc_price || Number(prices.coolstuffinc_price) <= 0 ? 'is-na' : ''}`}>
                    {prices.coolstuffinc_price && Number(prices.coolstuffinc_price) > 0 ? `$${Number(prices.coolstuffinc_price).toFixed(2)}` : 'Chưa có hàng'}
                  </div>
                  <div className="price-region">Bắc Mỹ (USD)</div>
                </div>
              </div>

              {/* BẢNG GIÁ THEO TỪNG BỘ THẺ / ĐỘ HIẾM (CARD SETS) */}
              <div className="sets-table-wrap">
                <div className="sets-table-title">
                  <Layers size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                  Xuất hiện trong các bộ thẻ ({sets.length} bộ):
                </div>

                {sets.length > 0 ? (
                  <div className="table-responsive">
                    <table className="sets-table">
                      <thead>
                        <tr>
                          <th>Tên bộ thẻ (Set Name)</th>
                          <th>Mã Set (Code)</th>
                          <th>Độ hiếm (Rarity)</th>
                          <th style={{ textAlign: 'right' }}>Giá ước tính</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sets.map((s, idx) => {
                          const setPriceNum = parseFloat(s.set_price);
                          const hasSetPrice = !isNaN(setPriceNum) && setPriceNum > 0;
                          const fallbackPrice = card.min_price > 0 ? card.min_price : null;

                          return (
                            <tr key={`${s.set_code}-${idx}`}>
                              <td><strong>{s.set_name}</strong></td>
                              <td><span className="set-code-badge">{s.set_code}</span></td>
                              <td>{s.set_rarity} {s.set_rarity_code || ''}</td>
                              <td style={{ textAlign: 'right' }}>
                                {hasSetPrice ? (
                                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                                    ${setPriceNum.toFixed(2)}
                                  </span>
                                ) : fallbackPrice ? (
                                  <span
                                    style={{ fontWeight: 700, color: '#0ea5e9' }}
                                    title="Giá ước tính theo giá thị trường thấp nhất của lá bài này"
                                  >
                                    ~${fallbackPrice.toFixed(2)}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    Chưa có giá
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    Chưa có thông tin bộ thẻ phát hành cho lá bài này.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
