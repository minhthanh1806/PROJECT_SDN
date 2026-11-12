import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import CardFilter from '../components/CardFilter';
import LevelFilter from '../components/LevelFilter';
import CardSort from '../components/CardSort';
import CardGrid from '../components/CardGrid';
import Pagination from '../components/Pagination';
import { getCards } from '../services/api';

const CARDS_PER_PAGE = 12; // Mỗi trang hiển thị 12 thẻ

// Danh sách đầy đủ các loại thẻ Yu-Gi-Oh chuẩn
const AVAILABLE_TYPES = [
  'Normal Monster',
  'Effect Monster',
  'Tuner Monster',
  'Flip Effect Monster',
  'Ritual Monster',
  'Ritual Effect Monster',
  'Fusion Monster',
  'Synchro Monster',
  'Synchro Tuner Monster',
  'XYZ Monster',
  'Pendulum Effect Monster',
  'Link Monster',
  'Spell Card',
  'Trap Card'
];

// Cấp sao từ 1 đến 12
const AVAILABLE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function HomePage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Tải danh sách thẻ bài phân trang và lọc trực tiếp từ toàn bộ kho dữ liệu Database
  useEffect(() => {
    setLoading(true);
    const params = {
      fname: searchTerm.trim() || undefined,
      type: selectedType || undefined,
      level: selectedLevel || undefined,
      sort: sortBy,
      page: currentPage,
      limit: CARDS_PER_PAGE
    };

    getCards(params)
      .then((res) => {
        if (res.data?.success) {
          setCards(res.data.data || []);
          if (res.data.pagination) {
            setTotalCards(res.data.pagination.totalCards || 0);
            setTotalPages(res.data.pagination.totalPages || 1);
          }
        }
      })
      .catch((err) => console.error('Error fetching cards:', err))
      .finally(() => setLoading(false));
  }, [searchTerm, selectedType, selectedLevel, sortBy, currentPage]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="container" style={{ padding: '2rem 1.25rem 3rem' }}>
        {/* Thanh điều khiển: Tìm kiếm + Lọc loại thẻ + Lọc cấp sao + Sắp xếp giá */}
        <div className="home-control-bar">
          <div className="control-search">
            <SearchBar value={searchTerm} onChange={handleSearchChange} />
          </div>
          <div className="control-filter">
            <CardFilter
              types={AVAILABLE_TYPES}
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
            />
          </div>
          <div className="control-filter">
            <LevelFilter
              levels={AVAILABLE_LEVELS}
              selectedLevel={selectedLevel}
              onLevelChange={handleLevelChange}
            />
          </div>
          <div className="control-filter">
            <CardSort sortBy={sortBy} onSortChange={handleSortChange} />
          </div>
        </div>

        {/* Thông tin số lượng thẻ & trang hiện tại */}
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
            Đang hiển thị: <strong>{cards.length}</strong> / <strong>{totalCards.toLocaleString()}</strong> lá bài Meta hiện tại
          </span>
          <span>
            Trang <strong>{currentPage}</strong> / {totalPages.toLocaleString()} ({CARDS_PER_PAGE} thẻ/trang)
          </span>
        </div>

        {/* Danh sách thẻ bài của trang hiện tại */}
        <CardGrid cards={cards} loading={loading} />

        {/* Thanh phân trang */}
        {totalPages > 1 && (
          <div style={{ marginTop: '2.5rem' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}
