import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import CardGrid from './components/CardGrid';
import { getCards } from './services/api';

export default function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCards = async (query) => {
    setLoading(true);
    try {
      const params = { limit: 30 };
      if (query && query.trim() !== '') {
        params.fname = query.trim();
      }
      const res = await getCards(params);
      if (res.data?.success) {
        setCards(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(searchTerm);
  }, [searchTerm]);

  return (
    <div className="app-shell">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="container" style={{ padding: '2rem 1.25rem 3rem' }}>
        {/* Ô tìm kiếm */}
        <div style={{ maxWidth: '640px', margin: '0 auto 2rem' }}>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        {/* Danh sách thẻ bài */}
        <CardGrid cards={cards} loading={loading} />
      </main>
    </div>
  );
}
