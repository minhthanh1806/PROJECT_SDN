import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CardDetailPage from './pages/CardDetailPage';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-shell">
          <Navbar />
          <main className="main-viewport">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/card/:id" element={<CardDetailPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}
