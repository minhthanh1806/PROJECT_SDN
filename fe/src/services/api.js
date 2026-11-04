import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

export const getCards = (params) => API.get('/cards', { params });
export const getSampleBannedCards = (params) => API.get('/cards/sample/banned', { params });
export const getCardById = (id) => API.get(`/cards/${id}`);

// Auth & User Profile
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getUserProfile = (userId) => API.get(`/auth/profile/${userId}`);
export const changePassword = (userId, data) => API.put(`/auth/change-password/${userId}`, data);
export const toggleFavoriteCard = (userId, cardId) => API.post(`/auth/favorite/${userId}`, { cardId });

export default API;
