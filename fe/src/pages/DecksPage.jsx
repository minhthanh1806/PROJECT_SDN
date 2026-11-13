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
  Sparkles,
  PlusCircle
} from 'lucide-react';

export default function DecksPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy giá trị bộ lọc từ URL
  const searchTerm = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedFormat = searchParams.get('format') || '';
  const selectedArchetype = searchParams.get('archetype') || '';
  const priceMax = searchParams.get('price_max') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const showAdvanced = searchParams.get('search') === 'advanced';

  // State cục bộ cho ô input search để gõ phím mượt mà
  const [searchInput, setSearchInput] = useState(searchTerm);

  // Data state
  const [decks, setDecks] = useState([]);
  const [meta, setMeta] = useState({ categories: [], formats: [], archetypes: [], featuredDecks: [] });
  const [pagination, setPagination] = useState({ totalDecks: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);

  // Khi search term trong URL đổi (vd back/forward hoặc reset), đồng bộ lại input
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

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

  // Cập nhật URLSearchParams một cách nhất quán
  const updateUrl = (patch) => {
    const current = {
      q: searchTerm,
      category: selectedCategory,
      format: selectedFormat,
      archetype: selectedArchetype,
      price_max: priceMax,
      sort: sortBy,
      page: currentPage,
      search: showAdvanced ? 'advanced' : '',
      ...patch
    };

    const next = new URLSearchParams();
    if (current.q) next.set('q', current.q);
    if (current.category) next.set('category', current.category);
    if (current.format) next.set('format', current.format);
    if (current.archetype) next.set('archetype', current.archetype);
    if (current.price_max) next.set('price_max', current.price_max);
    if (current.sort && current.sort !== 'newest') next.set('sort', current.sort);
    if (current.page && current.page > 1) next.set('page', String(current.page));
    if (current.search === 'advanced') next.set('search', 'advanced');

    setSearchParams(next);
  };

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
    setSearchInput('');
    setSearchParams(showAdvanced ? { search: 'advanced' } : {});
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      updateUrl({ q: searchInput, page: 1 });
    }
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
        {/* Header trang Decks */}
        <div className="decks-hero-banner">
          <div className="decks-hero-content">
            <h1 className="decks-hero-title">Thư Viện Decks Yu-Gi-Oh!</h1>
            <p className="decks-hero-subtitle">
              Tra cứu các bộ bài theo Format TCG, OCG, Master Duel kèm danh sách thẻ bài và ước tính giá thị trường.
            </p>

            {/* Thanh tìm kiếm */}
            <div className="decks-search-bar-wrap">
              <div className="decks-search-input-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  placeholder="Tìm kiếm deck theo tên, archetype (nhấn Enter để tìm)..."
                  className="decks-search-input"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateUrl({ q: '', page: 1 });
                    }}
                    className="clear-btn"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`advanced-toggle-btn ${showAdvanced ? 'active' : ''}`}
                onClick={() => updateUrl({ search: showAdvanced ? '' : 'advanced' })}
              >
                <Filter size={16} />
                <span>Bộ lọc nâng cao</span>
              </button>

              <Link
                to="/deck-builder"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  textDecoration: 'none',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                <PlusCircle size={17} /> Tạo Deck Mới
              </Link>
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
                  onChange={(e) => updateUrl({ category: e.target.value, page: 1 })}
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
                  onChange={(e) => updateUrl({ format: e.target.value, page: 1 })}
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
                  onChange={(e) => updateUrl({ archetype: e.target.value, page: 1 })}
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
                  onChange={(e) => updateUrl({ price_max: e.target.value, page: 1 })}
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
                      updateUrl({ category: item.id, format: '', page: 1 });
                    } else {
                      updateUrl({ format: item.id, category: '', page: 1 });
                    }
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
              onChange={(e) => updateUrl({ sort: e.target.value, page: 1 })}
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
                        Main: <strong>{deck.stats?.main_count ?? 0}</strong>
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
                updateUrl({ page });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
