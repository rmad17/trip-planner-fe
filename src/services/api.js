import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getUserProfile: () => api.get('/user/profile'),
  googleLogin: () => `${API_BASE_URL}/auth/google/login`,
};

// Trip APIs
export const tripAPI = {
  createTrip: (tripData) => api.post('/trips/create', tripData),
  getAllTrips: () => api.get('/trips'),
};

// Places APIs
export const placesAPI = {
  searchPlaces: (query) => api.get(`/places/autocomplete/search?q=${query}`),
  getPlaceDetails: (placeId) => api.get(`/places/details?place_id=${placeId}`),
};

export default api;