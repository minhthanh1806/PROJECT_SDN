import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import CardGrid from '../components/CardGrid';
import Pagination from '../components/Pagination';
import { getSampleBannedCards } from '../services/api';
import { formatVND } from '../utils/currency';

const CARDS_PER_PAGE = 12;

// Định dạng chuỗi YYYY-MM sang "Tháng MM/YYYY"
function formatMonthLabel(monthStr) {
  if (!monthStr) return '';
  if (monthStr === 'pre-2022' || monthStr === '2021-01') return 'Trước năm 2022 (Cổ điển)';
  const [y, m] = monthStr.split('-');
  return `Tháng ${m}/${y}`;
}

// Định dạng ngày YYYY-MM-DD sang "DD/MM/YYYY"
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export default function BanlistPage() {
  const [banFormat, setBanFormat] = useState('TCG'); // 'TCG', 'OCG', 'Master Duel'
  const [data, setData] = useState({
    forbidden: [],
    limited: [],
    semiLimited: [],
    monthSummaries: [],
    availableMonths: [],
    stats: { forbiddenCount: 0, limitedCount: 0, semiLimitedCount: 0, totalCount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'forbidden', 'limited', 'semi'
  const [selectedYear, setSelectedYear] = useState('all'); // 'all', '2026', '2025', '2024', '2023', '2022'
  const [selectedMonth, setSelectedMonth] = useState(''); // Mặc định rỗng = xem tất cả lá hiện tại
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'list'

  // Tải dữ liệu từ server theo format và tháng
  const fetchBanlistData = (formatParam = 'TCG', monthParam = '') => {
    setLoading(true);
    const params = { format: 'grouped', mode: 'changes', ban_format: formatParam };
    if (monthParam) params.month = monthParam;

    getSampleBannedCards(params)
      .then((res) => {
        if (res.data?.success) {
          setData({
            ...res.data.data,
            monthSummaries: res.data.data.monthSummaries || [],
            availableMonths: res.data.data.availableMonths || []
          });
        }
      })
      .catch((err) => console.error('Error fetching banlist:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanlistData(banFormat, selectedMonth);
  }, [banFormat, selectedMonth]);

  const handleFormatChange = (newFormat) => {
    setBanFormat(newFormat);
    setSelectedMonth('');
    setSelectedYear('all');
    setCurrentPage(1);
  };

  // Lọc danh sách các tháng hiển thị trên thanh Timeline theo Năm đang chọn
  const visibleMonthSummaries = useMemo(() => {
    const list = data.monthSummaries || [];
    if (selectedYear === 'all') return list;
    return list.filter((item) => String(item.year) === String(selectedYear));
  }, [data.monthSummaries, selectedYear]);

  // Lọc theo Tab được chọn
  const activeCards = useMemo(() => {
    if (activeTab === 'forbidden') return data.forbidden || [];
    if (activeTab === 'limited') return data.limited || [];
    if (activeTab === 'semi') return data.semiLimited || [];
    return [...(data.forbidden || []), ...(data.limited || []), ...(data.semiLimited || [])];
  }, [data, activeTab]);

  // Lọc theo ô tìm kiếm
  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) return activeCards;
    const term = searchTerm.trim().toLowerCase();
    return activeCards.filter((card) =>
      card.name?.toLowerCase().includes(term) ||
      card.type?.toLowerCase().includes(term) ||
      card.race?.toLowerCase().includes(term)
    );
  }, [activeCards, searchTerm]);

  // Phân trang
  const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE) || 1;
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    return filteredCards.slice(start, start + CARDS_PER_PAGE);
  }, [filteredCards, currentPage]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setCurrentPage(1);
  };

  const handleYearFilter = (year) => {
    setSelectedYear(year);
    if (year !== 'all' && selectedMonth && !selectedMonth.startsWith(year)) {
      const firstMonthOfYear = data.monthSummaries?.find((m) => String(m.year) === String(year));
      if (firstMonthOfYear) {
        setSelectedMonth(firstMonthOfYear.month);
        setCurrentPage(1);
      }
    }
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container" style={{ padding: '2rem 1.25rem 3rem' }}>
        {/* Tiêu đề trang & Chọn Format Banlist: TCG, OCG, Master Duel */}
        <div style={{ maxWidth: '1100px', margin: '0 auto 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.4rem' }}>
                Lịch Sử Banlist {banFormat} (2022 - 2026)
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                Đồng bộ dữ liệu chính thức từ <strong>YGOPRODeck Banlist ({banFormat})</strong>. Chọn Format bên dưới để tra cứu chi tiết.
              </p>
            </div>

            {/* TAB CHUYỂN ĐỔI FORMAT: TCG, OCG, MASTER DUEL */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              {[
                { id: 'TCG', label: 'TCG Banlist', color: '#3b82f6' },
                { id: 'OCG', label: 'OCG Banlist', color: '#ef4444' },
                { id: 'Master Duel', label: 'Master Duel Banlist', color: '#f97316' }
              ].map((fmt) => {
                const isActive = banFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => handleFormatChange(fmt.id)}
                    style={{
                      padding: '0.55rem 1.15rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? fmt.color : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {fmt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bộ lọc chọn Banlist theo năm và đợt tháng */}
        <div style={{ maxWidth: '1100px', margin: '0 auto 1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            {/* Select Năm cập nhật */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <label
                htmlFor="banlist-year-select"
                style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}
              >
                Năm cập nhật:
              </label>
              <select
                id="banlist-year-select"
                value={selectedYear}
                onChange={(e) => handleYearFilter(e.target.value)}
                className="filter-select"
                style={{
                  width: 'auto',
                  minWidth: '185px',
                  padding: '0.45rem 2rem 0.45rem 0.85rem',
                  fontSize: '0.86rem',
                  fontWeight: 700
                }}
              >
                <option value="all">Tất cả (2022 - 2026)</option>
                <option value="2026">Năm 2026</option>
                <option value="2025">Năm 2025</option>
                <option value="2024">Năm 2024</option>
                <option value="2023">Năm 2023</option>
                <option value="2022">Năm 2022</option>
              </select>
            </div>

            {/* Select Đợt / Tháng cập nhật */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <label
                htmlFor="banlist-month-select"
                style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}
              >
                Đợt Banlist:
              </label>
              <select
                id="banlist-month-select"
                value={selectedMonth}
                onChange={(e) => handleMonthSelect(e.target.value)}
                className="filter-select"
                style={{
                  width: 'auto',
                  minWidth: '280px',
                  padding: '0.45rem 2rem 0.45rem 0.85rem',
                  fontSize: '0.86rem',
                  fontWeight: 700
                }}
              >
                <option value="">
                  Banlist Hiện Hành — Tất Cả {banFormat} ({data.stats?.totalCount || 0} Lá)
                </option>
                {visibleMonthSummaries.map((item) => {
                  const exactDate = item.dates?.[0] ? formatShortDate(item.dates[0]) : '';
                  const changeCount = item.changeStats?.totalCount ?? item.totalCount;
                  return (
                    <option key={item.month} value={item.month}>
                      {formatMonthLabel(item.month)}{exactDate ? ` (Hiệu lực: ${exactDate})` : ''} — {changeCount} lá
                    </option>
                  );
                })}
                {selectedYear === 'all' && (
                  <option value="pre-2022">
                    Trước năm 2022 (Lịch sử cổ điển)
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Thanh lọc trạng thái và chế độ hiển thị */}
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Các tab chuyển đổi nhanh: Tất cả / Cấm / Hạn chế 1 / Hạn chế 2 */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleTabChange('all')}
              className={`ban-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            >
              Tất cả ({data.stats.totalCount})
            </button>

            <button
              onClick={() => handleTabChange('forbidden')}
              className={`ban-tab-btn tab-forbidden ${activeTab === 'forbidden' ? 'active' : ''}`}
            >
              Bị cấm ({data.stats.forbiddenCount})
            </button>

            <button
              onClick={() => handleTabChange('limited')}
              className={`ban-tab-btn tab-limited ${activeTab === 'limited' ? 'active' : ''}`}
            >
              Giới hạn 1 ({data.stats.limitedCount})
            </button>

            <button
              onClick={() => handleTabChange('semi')}
              className={`ban-tab-btn tab-semi ${activeTab === 'semi' ? 'active' : ''}`}
            >
              Giới hạn 2 ({data.stats.semiLimitedCount})
            </button>
          </div>

          {/* Nút chuyển đổi giao diện: Lưới (Grid) hoặc Danh sách (List/Table) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '3px' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.4rem 0.75rem',
                border: 'none',
                borderRadius: '6px',
                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Xem dạng thẻ ảnh"
            >
              Dạng lưới
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.4rem 0.75rem',
                border: 'none',
                borderRadius: '6px',
                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Xem dạng bảng danh sách"
            >
              Dạng danh sách
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm thẻ bài */}
        <div style={{ maxWidth: '1100px', margin: '0 auto 1.25rem' }}>
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={
              selectedMonth
                ? `Tìm kiếm lá bài trong ${formatMonthLabel(selectedMonth)}...`
                : 'Tìm kiếm thẻ trong Banlist (vd: Barrier Statue, Fossil Dyna, Baronne, Apollousa, Ryzeal...)'
            }
          />
        </div>

        {/* Thông tin số lượng hiển thị */}
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span>
            Đang hiển thị: <strong>{paginatedCards.length}</strong> / <strong>{filteredCards.length}</strong> lá bài
            {selectedMonth && (
              <span style={{ marginLeft: 6, color: '#3b82f6', fontWeight: 600 }}>
                • {formatMonthLabel(selectedMonth)}
              </span>
            )}
          </span>
          <span>
            Trang <strong>{currentPage}</strong> / {totalPages} ({CARDS_PER_PAGE} thẻ/trang)
          </span>
        </div>

        {/* Danh sách thẻ bài */}
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {viewMode === 'grid' ? (
            <CardGrid cards={paginatedCards} loading={loading} />
          ) : (
            <div className="table-responsive">
              <table className="banlist-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                    <th style={{ width: '70px', textAlign: 'center' }}>Ảnh</th>
                    <th>Tên lá bài</th>
                    <th>Loại / Tộc</th>
                    <th style={{ width: '160px', textAlign: 'center' }}>Án phạt</th>
                    <th style={{ width: '175px' }}>Tháng cập nhật</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Giá rẻ nhất</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCards.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                        Không tìm thấy lá bài nào khớp với bộ lọc
                      </td>
                    </tr>
                  ) : (
                    paginatedCards.map((card, index) => {
                      const stt = (currentPage - 1) * CARDS_PER_PAGE + index + 1;
                      const banStatus = card.banlist_info?.ban_tcg;
                      const cardDate = card.ban_date ? card.ban_date.slice(0, 10) : '';
                      const cardYear = cardDate ? Number(cardDate.slice(0, 4)) : 0;
                      const isLegacy = cardYear > 0 && cardYear < 2022;
                      const cardMonth = isLegacy ? 'pre-2022' : (cardDate ? cardDate.slice(0, 7) : selectedMonth);
                      const thumbUrl = card.card_images?.[0]?.image_url_small || `/images/cards/${card.id}_small.jpg`;

                      return (
                        <tr key={card.id}>
                          <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {stt}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Link to={`/card/${card.id}`}>
                              <img
                                src={thumbUrl}
                                alt={card.name}
                                className="banlist-thumb"
                                onError={(e) => {
                                  e.target.src = 'https://images.ygoprodeck.com/images/cards_small/back.jpg';
                                }}
                              />
                            </Link>
                          </td>
                          <td>
                            <Link to={`/card/${card.id}`} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {card.name}
                            </Link>
                            {card.level !== undefined && (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: 8 }}>
                                (Lv.{card.level})
                              </span>
                            )}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <div>{card.type}</div>
                            {card.race && <span style={{ opacity: 0.8 }}>({card.race})</span>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {banStatus === 'Forbidden' && (
                              <span className="card-ban-badge ban-forbidden" style={{ position: 'static' }}>
                                CẤM
                              </span>
                            )}
                            {banStatus === 'Limited' && (
                              <span className="card-ban-badge ban-limited" style={{ position: 'static' }}>
                                HẠN CHẾ 1
                              </span>
                            )}
                            {banStatus === 'Semi-Limited' && (
                              <span className="card-ban-badge ban-semilimited" style={{ position: 'static' }}>
                                HẠN CHẾ 2
                              </span>
                            )}
                            {card.is_ban_change && card.prev_ban_status && (
                              <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: 4, fontWeight: 600 }}>
                                (Từ {card.prev_ban_status})
                              </div>
                            )}
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {isLegacy ? (
                              <div>
                                <strong style={{ color: 'var(--text-primary)' }}>Trước năm 2022</strong>
                                <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>(Banlist cổ điển)</div>
                              </div>
                            ) : cardMonth ? (
                              <div>
                                <strong style={{ color: 'var(--text-primary)' }}>{formatMonthLabel(cardMonth)}</strong>
                                {cardDate && (
                                  <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                                    (Hiệu lực: {formatShortDate(cardDate)})
                                  </div>
                                )}
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {card.min_price > 0 ? (
                              <div>
                                <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                                  ${card.min_price.toFixed(2)}
                                </span>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                                  ~{formatVND(card.min_price)}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                Chưa có giá
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Link
                              to={`/card/${card.id}`}
                              className="nav-header-btn"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'inline-block' }}
                            >
                              Chi tiết
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Phân trang */}
        <div style={{ marginTop: '2.5rem' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
}
