import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import CardFilter from './components/CardFilter';
import CardSort from './components/CardSort';
import CardGrid from './components/CardGrid';
import { getCards } from './services/api';

export default function App() {
  const [initialCards, setInitialCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Tải danh sách 40 thẻ ban đầu từ server (thêm 10 dữ liệu)
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

  // Lọc và sắp xếp trực tiếp từ 40 thẻ
  const displayedCards = useMemo(() => {
    return initialCards
      .filter((card) => {
        const matchesSearch =
          !searchTerm.trim() ||
          card.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
        const matchesType = !selectedType || card.type === selectedType;
        return matchesSearch && matchesType;
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
  }, [initialCards, searchTerm, selectedType, sortBy]);

  return (
    <div className="app-shell">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="container" style={{ padding: '2rem 1.25rem 3rem' }}>
        {/* Thanh điều khiển: Tìm kiếm + Lọc loại thẻ + Sắp xếp theo giá */}
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto 2rem',
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1', minWidth: '260px' }}>
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div style={{ width: '210px', minWidth: '170px' }}>
            <CardFilter
              types={availableTypes}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </div>
          <div style={{ width: '190px', minWidth: '160px' }}>
            <CardSort sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>

        {/* Danh sách thẻ bài hiển thị */}
        <CardGrid cards={displayedCards} loading={loading} />
      </main>
    </div>
  );
}
