import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import CardGrid from '../components/CardGrid';
import Pagination from '../components/Pagination';
import { getSampleBannedCards } from '../services/api';
import { ShieldAlert, AlertTriangle, AlertCircle, ArrowLeft } from 'lucide-react';

const CARDS_PER_PAGE = 12;

export default function BanlistPage() {
  const [data, setData] = useState({
    forbidden: [],
    limited: [],
    semiLimited: [],
    stats: { forbiddenCount: 0, limitedCount: 0, semiLimitedCount: 0, totalCount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'forbidden', 'limited', 'semi'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getSampleBannedCards({ format: 'grouped' })
      .then((res) => {
        if (res.data?.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching banlist:', err))
      .finally(() => setLoading(false));
  }, []);

  // Lọc theo Tab được chọn
  const activeCards = useMemo(() => {
    if (activeTab === 'forbidden') return data.forbidden || [];
    if (activeTab === 'limited') return data.limited || [];
    if (activeTab === 'semi') return data.semiLimited || [];
    // 'all': gom cả 3 nhóm
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
        {/* Thanh tiêu đề và nút quay lại */}
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <ShieldAlert size={26} color="#ef4444" />
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
                Danh Sách Thẻ Bài Bị Cấm & Giới Hạn (Banlist)
              </h1>
            </div>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
              Cập nhật quy định thi đấu TCG mới nhất với tổng cộng <strong>{data.stats.totalCount}</strong> lá bài
            </p>
          </div>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              border: '1px solid #334155',
              transition: 'background-color 0.15s',
            }}
          >
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
        </div>

        {/* Các tab chuyển đổi nhanh: Tất cả / Cấm / Hạn chế 1 / Hạn chế 2 */}
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto 1.5rem',
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
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
            <ShieldAlert size={16} /> Bị cấm - Forbidden ({data.stats.forbiddenCount})
          </button>

          <button
            onClick={() => handleTabChange('limited')}
            className={`ban-tab-btn tab-limited ${activeTab === 'limited' ? 'active' : ''}`}
          >
            <AlertTriangle size={16} /> Hạn chế 1 - Limited ({data.stats.limitedCount})
          </button>

          <button
            onClick={() => handleTabChange('semi')}
            className={`ban-tab-btn tab-semi ${activeTab === 'semi' ? 'active' : ''}`}
          >
            <AlertCircle size={16} /> Hạn chế 2 - Semi ({data.stats.semiLimitedCount})
          </button>
        </div>

        {/* Thanh tìm kiếm lá bài trong Banlist */}
        <div style={{ maxWidth: '1000px', margin: '0 auto 1.5rem' }}>
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm thẻ trong danh sách cấm (vd: Pot of Greed, Kashtira, Spright...)"
          />
        </div>

        {/* Thông tin số lượng hiển thị */}
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.9rem',
            color: '#64748b',
          }}
        >
          <span>
            Đang xem: <strong>{paginatedCards.length}</strong> / <strong>{filteredCards.length}</strong> lá bài
          </span>
          <span>
            Trang <strong>{currentPage}</strong> / {totalPages} ({CARDS_PER_PAGE} thẻ/trang)
          </span>
        </div>

        {/* Danh sách thẻ bài hiển thị */}
        <CardGrid cards={paginatedCards} loading={loading} />

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
