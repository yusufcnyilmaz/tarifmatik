import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3001/api'
  : 'http://localhost:3001/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
};

export const recipeAPI = {
  getAll: (params) => api.get('/recipes', { params }),
  getById: (id) => api.get(`/recipes/${id}`),
  suggest: (ingredientIds) => api.post('/recipes/suggest', { ingredientIds }),
};

export const ingredientAPI = {
  getAll: (params) => api.get('/ingredients', { params }),
  getCategories: () => api.get('/ingredients/categories'),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

export const userAPI = {
  getPantry: () => api.get('/users/pantry'),
  addToPantry: (ingredientId) => api.post('/users/pantry', { ingredientId }),
  bulkPantry: (ingredientIds) => api.post('/users/pantry/bulk', { ingredientIds }),
  removeFromPantry: (ingredientId) => api.delete(`/users/pantry/${ingredientId}`),
  clearPantry: () => api.delete('/users/pantry'),
};

export default api;
