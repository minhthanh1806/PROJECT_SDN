import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import CardFilter from './components/CardFilter';
import LevelFilter from './components/LevelFilter';
import CardSort from './components/CardSort';
import CardGrid from './components/CardGrid';
import Pagination from './components/Pagination';
import { getCards } from './services/api';

const CARDS_PER_PAGE = 10; // Mỗi trang hiển thị 10 thẻ (40 thẻ chia thành 4 trang)

export default function App() {
  const [initialCards, setInitialCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);

  // Tải danh sách 40 thẻ ban đầu từ server
  useEffect(() => {
    setLoading(true);
    getCards({ limit: 40 })
      .then((res) => {
        if (res.data?.success) {
          setInitialCards((res.data.data || []).slice(0, 40));
        }
      })
      .catch((err) => console.error('Error fetching cards:', err))
      .finally(() => setLoading(false));
  }, []);

  // Danh sách các loại thẻ (type) chỉ trích xuất từ đúng 40 thẻ đang có
  const availableTypes = useMemo(() => {
    return Array.from(
      new Set(initialCards.map((card) => card.type).filter(Boolean))
    ).sort();
  }, [initialCards]);

  // Danh sách cấp sao (level) chỉ trích xuất từ đúng 40 thẻ đang có
  const availableLevels = useMemo(() => {
    return Array.from(
      new Set(
        initialCards
          .map((card) => card.level)
          .filter((lvl) => lvl !== undefined && lvl !== null)
      )
    ).sort((a, b) => a - b);
  }, [initialCards]);

  // Lọc và sắp xếp trực tiếp từ 40 thẻ hiện tại
  const filteredAndSortedCards = useMemo(() => {
    return initialCards
      .filter((card) => {
        const matchesSearch =
          !searchTerm.trim() ||
          card.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
        const matchesType = !selectedType || card.type === selectedType;
        const matchesLevel =
          !selectedLevel || String(card.level) === String(selectedLevel);
        return matchesSearch && matchesType && matchesLevel;
      })
      .slice()
      .sort((a, b) => {
        if (sortBy === 'price_asc') {
          return (a.min_price || 0) - (b.min_price || 0);
        }
        if (sortBy === 'price_desc') {
          return (b.min_price || 0) - (a.min_price || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [initialCards, searchTerm, selectedType, selectedLevel, sortBy]);

  // Tính toán tổng số trang dựa trên số lượng card hiện tại
  const totalPages = Math.ceil(filteredAndSortedCards.length / CARDS_PER_PAGE) || 1;

  // Lấy danh sách thẻ bài của đúng trang hiện tại
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    return filteredAndSortedCards.slice(start, start + CARDS_PER_PAGE);
  }, [filteredAndSortedCards, currentPage]);

  // Tự động quay về trang 1 khi tìm kiếm, đổi lọc hoặc đổi sắp xếp
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
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto 1.5rem',
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1', minWidth: '240px' }}>
            <SearchBar value={searchTerm} onChange={handleSearchChange} />
          </div>
          <div style={{ width: '190px', minWidth: '150px' }}>
            <CardFilter
              types={availableTypes}
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
            />
          </div>
          <div style={{ width: '170px', minWidth: '140px' }}>
            <LevelFilter
              levels={availableLevels}
              selectedLevel={selectedLevel}
              onLevelChange={handleLevelChange}
            />
          </div>
          <div style={{ width: '180px', minWidth: '150px' }}>
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
            Đang hiển thị: <strong>{paginatedCards.length}</strong> / <strong>{filteredAndSortedCards.length}</strong> lá bài
          </span>
          <span>
            Trang <strong>{currentPage}</strong> / {totalPages} ({CARDS_PER_PAGE} thẻ/trang)
          </span>
        </div>

        {/* Danh sách thẻ bài của trang hiện tại */}
        <CardGrid cards={paginatedCards} loading={loading} />

        {/* Thanh phân trang (chỉ tính trên số lượng card hiện tại) */}
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
