import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BanlistPage from './pages/BanlistPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/banlist" element={<BanlistPage />} />
      </Routes>
    </BrowserRouter>
  );
}
