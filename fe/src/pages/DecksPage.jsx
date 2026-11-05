import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import { getDecks, getDeckMeta } from '../services/api';
import {
  Search,
  Layers,
  Filter,
  DollarSign,
  Trophy,
  Flame,
  Eye,
  Heart,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function DecksPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query state từ URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('format') || '');
  const [selectedArchetype, setSelectedArchetype] = useState(searchParams.get('archetype') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('price_max') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data state
  const [decks, setDecks] = useState([]);
  const [meta, setMeta] = useState({ categories: [], formats: [], archetypes: [], featuredDecks: [] });
  const [pagination, setPagination] = useState({ totalDecks: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);

  // Hiển thị khung Advanced Search nếu có param ?search=advanced
  const [showAdvanced, setShowAdvanced] = useState(searchParams.get('search') === 'advanced');

  // Load Metadata (Categories, Formats, Archetypes)
  useEffect(() => {
    getDeckMeta()
      .then((res) => {
        if (res.data?.success) {
          setMeta(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching deck meta:', err));
  }, []);

  // Lắng nghe URL thay đổi (khi bấm link Navbar hoặc Back/Forward)
  useEffect(() => {
    const isAdv = searchParams.get('search') === 'advanced';
    if (isAdv) setShowAdvanced(true);
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
    const fmt = searchParams.get('format');
    if (fmt !== null) setSelectedFormat(fmt);
    const q = searchParams.get('q');
    if (q !== null) setSearchTerm(q);
  }, [searchParams]);

  // Đồng bộ param URL khi người dùng thay đổi bộ lọc (chỉ ghi đè nếu URL thực sự thay đổi)
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedFormat) params.set('format', selectedFormat);
    if (selectedArchetype) params.set('archetype', selectedArchetype);
    if (priceMax) params.set('price_max', priceMax);
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (showAdvanced) params.set('search', 'advanced');

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [searchTerm, selectedCategory, selectedFormat, selectedArchetype, priceMax, sortBy, currentPage, showAdvanced]);

  // Gọi API lấy danh sách Decks
  const fetchDecksData = () => {
    setLoading(true);
    const params = {
      q: searchTerm,
      category: selectedCategory,
      format: selectedFormat,
      archetype: selectedArchetype,
      price_max: priceMax,
      sort: sortBy,
      page: currentPage,
      limit: 12
    };

    getDecks(params)
      .then((res) => {
        if (res.data?.success) {
          setDecks(res.data.data);
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => console.error('Error fetching decks:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDecksData();
  }, [searchTerm, selectedCategory, selectedFormat, selectedArchetype, priceMax, sortBy, currentPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedFormat('');
    setSelectedArchetype('');
    setPriceMax('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Danh mục dùng cho bộ lọc nâng cao
  const categoriesList = [
    { id: '', label: 'Tất cả danh mục' },
    { id: 'Tournament Meta', label: 'Tournament Meta' },
    { id: 'Top Archetype', label: 'Top Archetypes' },
    { id: 'Budget Deck', label: 'Budget Decks' },
    { id: 'Master Duel', label: 'Master Duel' },
    { id: 'Anime Deck', label: 'Anime Decks' }
  ];

  // Format tabs: Tất cả, TCG, OCG, Master Duel, Budget Decks, Anime Decks
  const formatsList = [
    { id: '', label: 'Tất cả' },
    { id: 'TCG', label: 'TCG' },
    { id: 'OCG', label: 'OCG' },
    { id: 'Master Duel', label: 'Master Duel' },
    { id: 'Budget Deck', label: 'Budget Decks', isCategory: true },
    { id: 'Anime Deck', label: 'Anime Decks', isCategory: true }
  ];

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container" style={{ padding: '2rem 1.25rem 3.5rem' }}>
        {/* BANNER HEADER TRANG DECKS */}
        <div className="decks-hero-banner">
          <div className="decks-hero-content">
            <span className="decks-badge-pill">
              <Sparkles size={14} color="#f59e0b" /> Thư viện Decks Yu-Gi-Oh!
            </span>
            <h1 className="decks-hero-title">Khám Phá &amp; Tìm Kiếm Decks</h1>
            <p className="decks-hero-subtitle">
              Tra cứu hàng loạt chiến thuật Meta, Tournament Decks, Top Archetypes và Master Duel. Xem đầy đủ danh sách lá bài và bảng giá thị trường mới nhất.
            </p>

            {/* THANH TÌM KIẾM CHÍNH */}
            <div className="decks-search-bar-wrap">
              <div className="decks-search-input-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tìm kiếm deck theo tên, archetype (Tenpai, Snake-Eye, Kashtira, Purrely...)"
                  className="decks-search-input"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="clear-btn"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`advanced-toggle-btn ${showAdvanced ? 'active' : ''}`}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Filter size={16} />
                <span>Bộ lọc nâng cao</span>
              </button>
            </div>
          </div>
        </div>

        {/* BỘ LỌC NÂNG CAO (ADVANCED DECK SEARCH FILTERS) */}
        {showAdvanced && (
          <div className="advanced-filter-panel">
            <div className="filter-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Filter size={18} color="var(--primary)" />
                <span>Advanced Deck Search (Bộ lọc chuyên sâu)</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="reset-filter-btn"
              >
                <RotateCcw size={14} /> Đặt lại bộ lọc
              </button>
            </div>

            <div className="advanced-filter-grid">
              {/* Lọc Category */}
              <div>
                <label className="filter-field-label">Danh mục (Category)</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select-inline"
                >
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc Format */}
              <div>
                <label className="filter-field-label">Format thi đấu</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => {
                    setSelectedFormat(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select-inline"
                >
                  <option value="">Tất cả format</option>
                  <option value="TCG">TCG (Bắc Mỹ / Châu Âu)</option>
                  <option value="Master Duel">Master Duel</option>
                  <option value="OCG">OCG (Nhật Bản / Châu Á)</option>
                  <option value="GOAT">GOAT Format (2005)</option>
                  <option value="Edison">Edison Format (2010)</option>
                </select>
              </div>

              {/* Lọc Archetype */}
              <div>
                <label className="filter-field-label">Archetype</label>
                <select
                  value={selectedArchetype}
                  onChange={(e) => {
                    setSelectedArchetype(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select-inline"
                >
                  <option value="">Tất cả Archetypes</option>
                  {(meta.archetypes || []).map((arc) => (
                    <option key={arc} value={arc}>
                      {arc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc mức giá cao nhất ($) */}
              <div>
                <label className="filter-field-label">Giá tối đa ($)</label>
                <select
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select-inline"
                >
                  <option value="">Mọi mức giá</option>
                  <option value="20">Dưới $20 (Siêu rẻ / Budget)</option>
                  <option value="35">Dưới $35</option>
                  <option value="50">Dưới $50</option>
                  <option value="100">Dưới $100</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* THANH TÙY CHỌN NHANH FORMAT / CATEGORY TABS & SẮP XẾP */}
        <div className="decks-toolbar">
          <div className="decks-category-chips">
            {formatsList.map((item) => {
              const isActive = item.isCategory
                ? selectedCategory === item.id
                : selectedFormat === item.id && !selectedCategory;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.isCategory) {
                      setSelectedCategory(item.id);
                      setSelectedFormat('');
                    } else {
                      setSelectedFormat(item.id);
                      setSelectedCategory('');
                    }
                    setCurrentPage(1);
                  }}
                  className={`category-chip-btn ${isActive ? 'active' : ''}`}
                >
                  {item.id === 'TCG' && <Trophy size={14} color="#3b82f6" />}
                  {item.id === 'OCG' && <Sparkles size={14} color="#ef4444" />}
                  {item.id === 'Master Duel' && <Flame size={14} color="#f97316" />}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Sắp xếp */}
          <div className="decks-sort-box">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="decks-sort-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="views">Lượt xem nhiều</option>
              <option value="likes">Yêu thích nhất</option>
              <option value="price_asc">Giá: Thấp → Cao</option>
              <option value="price_desc">Giá: Cao → Thấp</option>
            </select>
          </div>
        </div>

        {/* DANH SÁCH DECKS */}
        {loading ? (
          <div className="loading-container" style={{ padding: '4rem 1rem' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Đang tải danh sách bộ bài...
            </p>
          </div>
        ) : decks.length === 0 ? (
          <div className="empty-container" style={{ padding: '4rem 1rem', background: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <Layers size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Không tìm thấy bộ bài nào</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Hãy thử tìm kiếm với từ khóa khác hoặc bấm đặt lại bộ lọc.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-primary"
            >
              <RotateCcw size={16} /> Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="decks-grid">
            {decks.map((deck) => {
              const coverImg =
                deck.cover_image_url ||
                `https://images.ygoprodeck.com/images/cards/${deck.cover_card_id}.jpg`;

              return (
                <div key={deck._id} className="deck-card-item">
                  <Link to={`/deck/${deck.slug || deck._id}`} className="deck-cover-link">
                    <div className="deck-cover-wrap">
                      <img
                        src={coverImg}
                        alt={deck.name}
                        className="deck-cover-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.ygoprodeck.com/images/cards/back.jpg';
                        }}
                      />
                      <div className="deck-format-badge">
                        {deck.format}
                      </div>
                      <div className="deck-price-tag">
                        <DollarSign size={13} style={{ display: 'inline', verticalAlign: '-1px' }} />
                        {Number(deck.stats?.total_price || 0).toFixed(2)}
                      </div>
                    </div>
                  </Link>

                  <div className="deck-card-body">
                    <div className="deck-category-tag">
                      {deck.category}
                    </div>

                    <Link to={`/deck/${deck.slug || deck._id}`} className="deck-title-link">
                      <h3 className="deck-title">{deck.name}</h3>
                    </Link>

                    {deck.tournament && (
                      <div className="deck-tournament-label">
                        <Trophy size={13} color="#f59e0b" />
                        <span>{deck.tournament}</span>
                      </div>
                    )}

                    <div className="deck-meta-info">
                      <span>Bởi <strong>{deck.author || 'YGO Pro Deck'}</strong></span>
                      {deck.archetype && <span className="deck-archetype-pill">{deck.archetype}</span>}
                    </div>

                    {/* Thanh thống kê số thẻ: Main, Extra, Side */}
                    <div className="deck-counts-bar">
                      <div className="count-pill">
                        Main: <strong>{deck.stats?.main_count || 40}</strong>
                      </div>
                      <div className="count-pill">
                        Extra: <strong>{deck.stats?.extra_count || 0}</strong>
                      </div>
                      <div className="count-pill">
                        Side: <strong>{deck.stats?.side_count || 0}</strong>
                      </div>
                    </div>

                    <div className="deck-card-footer">
                      <div className="deck-stats-views">
                        <span><Eye size={13} /> {deck.views || 0}</span>
                        <span><Heart size={13} color="#ef4444" /> {deck.likes || 0}</span>
                      </div>

                      <Link to={`/deck/${deck.slug || deck._id}`} className="view-deck-btn">
                        Xem Deck &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PHÂN TRANG */}
        {pagination.totalPages > 1 && (
          <div style={{ marginTop: '2.5rem' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
