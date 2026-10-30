import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

export const getCards = (params) => API.get('/cards', { params });
export const getSampleBannedCards = (params) => API.get('/cards/sample/banned', { params });
export const getCardById = (id) => API.get(`/cards/${id}`);
export const getFilterOptions = () => API.get('/cards/meta/filters');
export const getCardsBySet = (setCode) => API.get(`/cards/set/${setCode}`);

export default API;
