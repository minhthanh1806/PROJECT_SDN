import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BanlistPage from './pages/BanlistPage';
import DecksPage from './pages/DecksPage';
import DeckDetailPage from './pages/DeckDetailPage';
import DeckBuilderPage from './pages/DeckBuilderPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import CardDetailPage from './pages/CardDetailPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/card/:id" element={<CardDetailPage />} />
            <Route path="/decks" element={<DecksPage />} />
            <Route path="/deck-builder" element={<DeckBuilderPage />} />
            <Route path="/deck/:id" element={<DeckDetailPage />} />
            <Route path="/banlist" element={<BanlistPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
