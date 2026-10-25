import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import CardFilter from './components/CardFilter';
import CardGrid from './components/CardGrid';
import { getCards } from './services/api';

export default function App() {
  const [initialCards, setInitialCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Tải danh sách 30 thẻ ban đầu từ server
  useEffect(() => {
    setLoading(true);
    getCards({ limit: 30 })
      .then((res) => {
        if (res.data?.success) {
          setInitialCards((res.data.data || []).slice(0, 30));
        }
      })
      .catch((err) => console.error('Error fetching cards:', err))
      .finally(() => setLoading(false));
  }, []);

  // Danh sách các loại thẻ (type) chỉ trích xuất từ đúng 30 thẻ đang có
  const availableTypes = useMemo(() => {
    return Array.from(
      new Set(initialCards.map((card) => card.type).filter(Boolean))
    ).sort();
  }, [initialCards]);

  // Lọc trực tiếp từ 30 thẻ ban đầu theo từ khóa tìm kiếm và loại thẻ đã chọn
  const filteredCards = useMemo(() => {
    return initialCards.filter((card) => {
      const matchesSearch =
        !searchTerm.trim() ||
        card.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesType = !selectedType || card.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [initialCards, searchTerm, selectedType]);

  return (
    <div className="app-shell">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="container" style={{ padding: '2rem 1.25rem 3rem' }}>
        {/* Thanh điều khiển: Tìm kiếm + 1 Bộ lọc loại thẻ (khớp với 30 thẻ) */}
        <div
          style={{
            maxWidth: '780px',
            margin: '0 auto 2rem',
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1', minWidth: '280px' }}>
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div style={{ width: '220px', minWidth: '180px' }}>
            <CardFilter
              types={availableTypes}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </div>
        </div>

        {/* Danh sách thẻ bài sau khi lọc từ 30 thẻ */}
        <CardGrid cards={filteredCards} loading={loading} />
      </main>
    </div>
  );
}
