import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

// Tự động đính kèm ID người dùng / Admin vào header nếu đã đăng nhập
API.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('user') || localStorage.getItem('ygo_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id) {
        config.headers['x-user-id'] = parsed.id;
        // Chỉ gắn x-admin-id nếu user có quyền admin
        if (parsed.role === 'admin') {
          config.headers['x-admin-id'] = parsed.id;
        }
      }
    }
  } catch (err) {
    // Không làm gián đoạn request
  }
  return config;
});

export const getCards = (params) => API.get('/cards', { params });
export const getSampleBannedCards = (params) => API.get('/cards/sample/banned', { params });
export const getCardById = (id) => API.get(`/cards/${id}`);
export const translateCardEffect = (id, force = false) => API.get(`/cards/${id}/translate${force ? '?force=true' : ''}`);

// Auth & User Profile
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getUserProfile = (userId) => API.get(`/auth/profile/${userId}`);
export const changePassword = (userId, data) => API.put(`/auth/change-password/${userId}`, data);
export const toggleFavoriteCard = (userId, cardId) => API.post(`/auth/favorite/${userId}`, { cardId });

// Decks
export const getDecks = (params) => API.get('/decks', { params });
export const getDeckById = (id) => API.get(`/decks/${id}`);
export const getDeckMeta = () => API.get('/decks/meta');
export const likeDeck = (id) => API.post(`/decks/${id}/like`);

// Admin APIs
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminDecks = (params) => API.get('/admin/decks', { params });
export const createAdminDeck = (data) => API.post('/admin/decks', data);
export const updateAdminDeck = (id, data) => API.put(`/admin/decks/${id}`, data);
export const deleteAdminDeck = (id) => API.delete(`/admin/decks/${id}`);

export const getAdminCards = (params) => API.get('/admin/cards', { params });
export const createAdminCard = (data) => API.post('/admin/cards', data);
export const updateAdminCard = (id, data) => API.put(`/admin/cards/${id}`, data);
export const updateCardPrice = (id, data) => API.put(`/admin/cards/${id}/price`, data);
export const deleteAdminCard = (id) => API.delete(`/admin/cards/${id}`);

export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const updateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

export default API;
