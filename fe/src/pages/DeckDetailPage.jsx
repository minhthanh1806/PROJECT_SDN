import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getDeckById, likeDeck } from '../services/api';
import {
  ArrowLeft,
  Layers,
  Trophy,
  Download,
  Copy,
  Check,
  Heart,
  Eye,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function DeckDetailPage() {
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [copied, setCopied] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDeckById(id)
      .then((res) => {
        if (res.data?.success) {
          setDeck(res.data.data);
          setLikesCount(res.data.data.likes || 0);
          if (res.data.data.main_deck?.length > 0) {
            setSelectedCard(res.data.data.main_deck[0]);
          }
        } else {
          setError('Không tìm thấy thông tin bộ bài này');
        }
      })
      .catch((err) => {
        console.error('Error fetching deck detail:', err);
        setError('Có lỗi xảy ra khi tải thông tin bộ bài');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (hasLiked || !deck) return;
    try {
      setHasLiked(true);
      setLikesCount((prev) => prev + 1);
      await likeDeck(deck._id);
    } catch (err) {
      console.error('Error liking deck:', err);
    }
  };

  // Tạo và tải file .YDK chuẩn EDOPro / YGO Omega / Master Duel simulator
  const handleDownloadYDK = () => {
    if (!deck) return;
    let ydkContent = '#created by YGO Price Deck\n#main\n';

    (deck.main_deck || []).forEach((c) => {
      for (let i = 0; i < c.quantity; i++) {
        ydkContent += `${c.card_id}\n`;
      }
    });

    ydkContent += '#extra\n';
    (deck.extra_deck || []).forEach((c) => {
      for (let i = 0; i < c.quantity; i++) {
        ydkContent += `${c.card_id}\n`;
      }
    });

    ydkContent += '!side\n';
    (deck.side_deck || []).forEach((c) => {
      for (let i = 0; i < c.quantity; i++) {
        ydkContent += `${c.card_id}\n`;
      }
    });

    const blob = new Blob([ydkContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.ydk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Sao chép Text List của bộ bài
  const handleCopyTextList = () => {
    if (!deck) return;
    let text = `=== ${deck.name} ===\nFormat: ${deck.format} | Giá ước tính: $${deck.stats?.total_price || 0}\n\n`;

    text += `--- MAIN DECK (${deck.stats?.main_count || 0}) ---\n`;
    (deck.main_deck || []).forEach((c) => {
      text += `${c.quantity}x ${c.name}\n`;
    });

    text += `\n--- EXTRA DECK (${deck.stats?.extra_count || 0}) ---\n`;
    (deck.extra_deck || []).forEach((c) => {
      text += `${c.quantity}x ${c.name}\n`;
    });

    text += `\n--- SIDE DECK (${deck.stats?.side_count || 0}) ---\n`;
    (deck.side_deck || []).forEach((c) => {
      text += `${c.quantity}x ${c.name}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
          <div className="loading-container">
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Đang tải bộ bài...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
          <div className="empty-container">
            <h2>{error || 'Không tìm thấy bộ bài'}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Bộ bài bạn yêu cầu không tồn tại hoặc đã bị xóa.
            </p>
            <Link to="/decks" className="btn-primary">
              <ArrowLeft size={16} /> Quay lại danh sách Decks
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Danh sách thẻ bài trong từng phần
  const mainCards = deck.main_deck || [];
  const extraCards = deck.extra_deck || [];
  const sideCards = deck.side_deck || [];

  // Phân loại thẻ trong Main Deck thành Monsters, Spells, Traps
  const monsters = mainCards.filter((c) => {
    const t = (c.card_type || '').toLowerCase();
    return !t.includes('spell') && !t.includes('trap');
  });
  const spells = mainCards.filter((c) => (c.card_type || '').toLowerCase().includes('spell'));
  const traps = mainCards.filter((c) => (c.card_type || '').toLowerCase().includes('trap'));

  // Tính toán số lượng và thống kê chính xác, chống NaN
  const monsterCount = monsters.reduce((s, c) => s + (c.quantity || 1), 0) || (deck.stats?.monster_count || 0);
  const spellCount = spells.reduce((s, c) => s + (c.quantity || 1), 0) || (deck.stats?.spell_count || 0);
  const trapCount = traps.reduce((s, c) => s + (c.quantity || 1), 0) || (deck.stats?.trap_count || 0);
  const mainCount = mainCards.reduce((s, c) => s + (c.quantity || 1), 0) || (deck.stats?.main_count || 0);
  const extraCount = extraCards.reduce((s, c) => s + (c.quantity || 1), 0) || (deck.stats?.extra_count || 0);
  const sideCount = sideCards.reduce((s, c) => s + (c.quantity || 1), 0) || (deck.stats?.side_count || 0);
  const totalCardsCount = mainCount + extraCount + sideCount;

  const calculatedPrice = [...mainCards, ...extraCards, ...sideCards].reduce(
    (sum, c) => sum + (Number(c.price) || 0) * (c.quantity || 1),
    0
  );
  const displayPrice = calculatedPrice > 0 ? calculatedPrice : (Number(deck.stats?.total_price) || 0);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container" style={{ padding: '1.5rem 1.25rem 3.5rem' }}>
        {/* Nút quay lại */}
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/decks" className="back-link">
            <ArrowLeft size={18} /> Quay lại thư viện Decks
          </Link>
        </div>

        {/* HEADER CHI TIẾT DECK */}
        <div className="deck-detail-header-card">
          <div className="deck-detail-top">
            <div className="deck-detail-info">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <span className="deck-category-badge">{deck.category}</span>
                <span className="deck-format-badge-large">{deck.format}</span>
                {deck.archetype && <span className="deck-archetype-badge">{deck.archetype}</span>}
              </div>

              <h1 className="deck-detail-title">{deck.name}</h1>

              {deck.tournament && (
                <div className="deck-tournament-highlight">
                  <Trophy size={16} color="#f59e0b" />
                  <span>{deck.tournament}</span>
                </div>
              )}

              {deck.description && (
                <p className="deck-detail-desc">{deck.description}</p>
              )}

              <div className="deck-author-meta">
                <span>Tác giả: <strong>{deck.author || 'YGO Pro Deck'}</strong></span>
                <span>•</span>
                <span><Eye size={14} style={{ display: 'inline', verticalAlign: '-1px' }} /> {deck.views || 0} lượt xem</span>
              </div>
            </div>

            {/* HỘP TỔNG GIÁ VÀ HÀNH ĐỘNG */}
            <div className="deck-actions-box">
              <div className="deck-price-box">
                <div className="price-box-label">Ước tính giá thị trường (TCG)</div>
                <div className="price-box-amount">
                  ${Number(displayPrice).toFixed(2)}
                </div>
                <div className="price-box-note">
                  Tổng {totalCardsCount} lá bài
                </div>
              </div>

              <div className="deck-action-buttons">
                <button
                  type="button"
                  onClick={handleDownloadYDK}
                  className="action-btn-primary"
                  title="Tải file .ydk chuẩn để nhập vào EDOPro, YGO Omega, DuelingBook"
                >
                  <Download size={16} /> Tải file .YDK
                </button>

                <button
                  type="button"
                  onClick={handleCopyTextList}
                  className="action-btn-secondary"
                  title="Sao chép danh sách thẻ vào Clipboard"
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  <span>{copied ? 'Đã sao chép!' : 'Copy Text List'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLike}
                  className={`action-btn-like ${hasLiked ? 'liked' : ''}`}
                >
                  <Heart size={16} fill={hasLiked ? '#ef4444' : 'none'} color={hasLiked ? '#ef4444' : 'currentColor'} />
                  <span>{likesCount}</span>
                </button>
              </div>
            </div>
          </div>

          {/* THANH THỐNG KÊ CHI TIẾT MAIN / EXTRA / SIDE */}
          <div className="deck-stats-strip">
            <div className="stat-strip-item">
              <span className="stat-num">{mainCount}</span>
              <span className="stat-lbl">Main Deck</span>
            </div>
            <div className="stat-strip-item">
              <span className="stat-num">{monsterCount}</span>
              <span className="stat-lbl">Quái thú (Monster)</span>
            </div>
            <div className="stat-strip-item">
              <span className="stat-num">{spellCount}</span>
              <span className="stat-lbl">Phép (Spell)</span>
            </div>
            <div className="stat-strip-item">
              <span className="stat-num">{trapCount}</span>
              <span className="stat-lbl">Bẫy (Trap)</span>
            </div>
            <div className="stat-strip-item">
              <span className="stat-num">{extraCount}</span>
              <span className="stat-lbl">Extra Deck</span>
            </div>
            <div className="stat-strip-item">
              <span className="stat-num">{sideCount}</span>
              <span className="stat-lbl">Side Deck</span>
            </div>
          </div>
        </div>

        {/* BỐ CỤC CHÍNH: BẢNG SƠ ĐỒ DECK TRỰC QUAN (CHUẨN YGOPRODECK) */}
        <div className="deck-builder-layout">
          {/* CỘT TRÁI: KHUNG XEM TRƯỚC THẺ BÀI ĐANG CHỌN (PREVIEW CARD) */}
          <div className="deck-preview-sidebar">
            {selectedCard ? (
              <div className="card-preview-card">
                <div className="preview-img-wrap">
                  <img
                    src={selectedCard.image_url || `https://images.ygoprodeck.com/images/cards/${selectedCard.card_id}.jpg`}
                    alt={selectedCard.name}
                    className="preview-img"
                    onError={(e) => {
                      e.target.src = 'https://images.ygoprodeck.com/images/cards/back.jpg';
                    }}
                  />
                  {selectedCard.ban_status && (
                    <div className={`preview-ban-overlay status-${selectedCard.ban_status.toLowerCase().replace(/[^a-z]/g, '')}`}>
                      <ShieldAlert size={14} />
                      <span>{selectedCard.ban_status === 'Forbidden' ? 'BỊ CẤM' : selectedCard.ban_status === 'Limited' ? 'GIỚI HẠN 1' : 'GIỚI HẠN 2'}</span>
                    </div>
                  )}
                </div>
                <h4 className="preview-card-name">{selectedCard.name}</h4>
                <div className="preview-card-meta">
                  <span>{selectedCard.card_type}</span>
                  <span className={`preview-price-tag ${selectedCard.price > 0 ? '' : 'is-na'}`}>
                    {selectedCard.price > 0 ? `$${selectedCard.price.toFixed(2)}` : 'Chưa có giá'}
                  </span>
                </div>
                <Link
                  to={`/card/${selectedCard.card_id}`}
                  className="preview-detail-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={14} /> Xem thông tin chi tiết lá bài
                </Link>
              </div>
            ) : (
              <div className="card-preview-placeholder">
                <Layers size={32} color="var(--text-secondary)" />
                <p>Rê chuột hoặc chạm vào lá bài để xem thông tin chi tiết</p>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: KHUNG HIỂN THỊ CÁC KHỐI MAIN, EXTRA, SIDE */}
          <div className="deck-cards-container">
            {/* 1. MAIN DECK */}
            <div className="deck-section-block">
              <div className="deck-section-header">
                <div className="section-title">
                  <Layers size={18} color="var(--primary)" />
                  <span>Main Deck ({mainCount} lá)</span>
                </div>
                <div className="section-counts-breakdown">
                  <span>Monster: {monsterCount}</span>
                  <span>•</span>
                  <span>Spell: {spellCount}</span>
                  <span>•</span>
                  <span>Trap: {trapCount}</span>
                </div>
              </div>

              {/* Thông báo nếu chưa có lá bài nào trong Main Deck */}
              {monsters.length === 0 && spells.length === 0 && traps.length === 0 && (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Layers size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '0.4rem' }}>
                    Bộ bài này chưa có lá bài nào trong Main Deck
                  </div>
                  <div style={{ fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                    Bộ bài vừa được tạo mới hoặc chưa cập nhật danh sách thẻ bài. Bạn có thể thêm thẻ bằng cách chỉnh sửa bộ bài trong trang Quản Trị.
                  </div>
                  <Link to="/admin" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    Đi đến trang Quản Trị (Admin)
                  </Link>
                </div>
              )}

              {/* Danh sách quái thú */}
              {monsters.length > 0 && (
                <div className="deck-subsection">
                  <div className="subsection-title">Quái thú ({monsters.reduce((s, c) => s + c.quantity, 0)})</div>
                  <div className="deck-cards-grid">
                    {monsters.map((c) => (
                      <DeckCardThumbnail
                        key={`m-${c.card_id}`}
                        card={c}
                        deckFormat={deck.format}
                        isSelected={selectedCard?.card_id === c.card_id}
                        onSelect={() => setSelectedCard(c)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách Phép */}
              {spells.length > 0 && (
                <div className="deck-subsection">
                  <div className="subsection-title">Phép (Spells) ({spells.reduce((s, c) => s + c.quantity, 0)})</div>
                  <div className="deck-cards-grid">
                    {spells.map((c) => (
                      <DeckCardThumbnail
                        key={`s-${c.card_id}`}
                        card={c}
                        deckFormat={deck.format}
                        isSelected={selectedCard?.card_id === c.card_id}
                        onSelect={() => setSelectedCard(c)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách Bẫy */}
              {traps.length > 0 && (
                <div className="deck-subsection">
                  <div className="subsection-title">Bẫy (Traps) ({traps.reduce((s, c) => s + c.quantity, 0)})</div>
                  <div className="deck-cards-grid">
                    {traps.map((c) => (
                      <DeckCardThumbnail
                        key={`t-${c.card_id}`}
                        card={c}
                        deckFormat={deck.format}
                        isSelected={selectedCard?.card_id === c.card_id}
                        onSelect={() => setSelectedCard(c)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. EXTRA DECK */}
            {(deck.extra_deck || []).length > 0 && (
              <div className="deck-section-block">
                <div className="deck-section-header">
                  <div className="section-title">
                    <Sparkles size={18} color="#a855f7" />
                    <span>Extra Deck ({deck.stats?.extra_count || 0} lá)</span>
                  </div>
                </div>

                <div className="deck-cards-grid">
                  {deck.extra_deck.map((c) => (
                    <DeckCardThumbnail
                      key={`extra-${c.card_id}`}
                      card={c}
                      deckFormat={deck.format}
                      isSelected={selectedCard?.card_id === c.card_id}
                      onSelect={() => setSelectedCard(c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. SIDE DECK */}
            {(deck.side_deck || []).length > 0 && (
              <div className="deck-section-block">
                <div className="deck-section-header">
                  <div className="section-title">
                    <Layers size={18} color="#10b981" />
                    <span>Side Deck ({deck.stats?.side_count || 0} lá)</span>
                  </div>
                </div>

                <div className="deck-cards-grid">
                  {deck.side_deck.map((c) => (
                    <DeckCardThumbnail
                      key={`side-${c.card_id}`}
                      card={c}
                      deckFormat={deck.format}
                      isSelected={selectedCard?.card_id === c.card_id}
                      onSelect={() => setSelectedCard(c)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Component hiển thị thẻ bài nhỏ trong khung bộ bài với badge số lượng (1x, 2x, 3x) và huy hiệu Banlist (Cấm / Hạn chế)
function DeckCardThumbnail({ card, deckFormat = 'TCG', isSelected, onSelect }) {
  const thumbUrl =
    card.image_url_small ||
    card.image_url ||
    `https://images.ygoprodeck.com/images/cards_small/${card.card_id}.jpg`;

  const banStatus = card.ban_status;

  return (
    <div
      className={`deck-thumb-box ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      onMouseEnter={onSelect}
      title={`${card.name} (${card.quantity}x)${banStatus ? ` [${banStatus} - ${deckFormat}]` : ''} - $${(card.price * card.quantity).toFixed(2)}`}
    >
      <img
        src={thumbUrl}
        alt={card.name}
        className="deck-thumb-img"
        loading="lazy"
        onError={(e) => {
          e.target.src = 'https://images.ygoprodeck.com/images/cards_small/back.jpg';
        }}
      />

      {/* Huy hiệu Banlist trên góc lá bài theo chuẩn format của Deck */}
      {banStatus === 'Forbidden' && (
        <span className="deck-card-ban-pill ban-pill-forbidden" title={`Bị cấm trong ${deckFormat} Banlist`}>
          CẤM
        </span>
      )}
      {banStatus === 'Limited' && (
        <span className="deck-card-ban-pill ban-pill-limited" title={`Bị giới hạn 1 lá trong ${deckFormat} Banlist`}>
          L1
        </span>
      )}
      {banStatus === 'Semi-Limited' && (
        <span className="deck-card-ban-pill ban-pill-semi" title={`Bị giới hạn 2 lá trong ${deckFormat} Banlist`}>
          L2
        </span>
      )}

      {/* Badge số lượng thẻ trong deck */}
      {card.quantity > 1 && (
        <span className="deck-thumb-qty-badge">{card.quantity}x</span>
      )}
    </div>
  );
}
