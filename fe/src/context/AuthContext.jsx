import React, { createContext, useContext, useState } from 'react';
import { toggleFavoriteCard } from '../services/api';

const AuthContext = createContext(null);

// Lưu thông tin người dùng đăng nhập trong localStorage để F5 không bị mất
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Toggle favorite một thẻ bài
  const toggleFavorite = async (cardId) => {
    if (!user || !user.id) return { success: false, needLogin: true };
    try {
      const res = await toggleFavoriteCard(user.id, cardId);
      if (res.data?.success) {
        const updatedFavorites = res.data.favorites;
        const updatedUser = { ...user, favorites: updatedFavorites };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, isFavorited: res.data.isFavorited };
      }
    } catch (err) {
      console.error('Error toggle favorite:', err);
      return { success: false, message: err.message };
    }
    return { success: false };
  };

  // Kiểm tra một cardId có trong favorites của user không
  const isCardFavorited = (cardId) => {
    if (!user || !user.favorites) return false;
    return user.favorites.includes(Number(cardId));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, toggleFavorite, isCardFavorited }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
