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
  getTripById: (tripId) => api.get(`/trip/${tripId}`),
  updateTrip: (tripId, tripData) => api.put(`/trip/${tripId}`, tripData),
  deleteTrip: (tripId) => api.delete(`/trip/${tripId}`),
};

// Trip Hop APIs
export const tripHopAPI = {
  createTripHop: (tripId, hopData) => api.post(`/trip/${tripId}/hops`, hopData),
  getTripHops: (tripId) => api.get(`/trip/${tripId}/hops`),
  updateTripHop: (tripId, hopId, hopData) => api.put(`/trip/${tripId}/hops/${hopId}`, hopData),
  deleteTripHop: (tripId, hopId) => api.delete(`/trip/${tripId}/hops/${hopId}`),
};

// Trip Day APIs
export const tripDayAPI = {
  createTripDay: (tripId, dayData) => api.post(`/trip/${tripId}/days`, dayData),
  getTripDays: (tripId) => api.get(`/trip/${tripId}/days`),
  updateTripDay: (tripId, dayId, dayData) => api.put(`/trip/${tripId}/days/${dayId}`, dayData),
  deleteTripDay: (tripId, dayId) => api.delete(`/trip/${tripId}/days/${dayId}`),
};

// Itinerary APIs
export const itineraryAPI = {
  createItinerary: (tripId, itineraryData) => api.post(`/trip/${tripId}/itinerary`, itineraryData),
  getItinerary: (tripId) => api.get(`/trip/${tripId}/itinerary`),
  updateItinerary: (tripId, itineraryId, itineraryData) => api.put(`/trip/${tripId}/itinerary/${itineraryId}`, itineraryData),
  deleteItinerary: (tripId, itineraryId) => api.delete(`/trip/${tripId}/itinerary/${itineraryId}`),
};

// Document Upload APIs
export const documentAPI = {
  uploadDocument: (tripId, formData) => api.post(`/trip/${tripId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocuments: (tripId) => api.get(`/trip/${tripId}/documents`),
  deleteDocument: (tripId, documentId) => api.delete(`/trip/${tripId}/documents/${documentId}`),
  downloadDocument: (tripId, documentId) => api.get(`/trip/${tripId}/documents/${documentId}/download`, {
    responseType: 'blob'
  }),
};

// Stays APIs
export const staysAPI = {
  createStay: (tripId, stayData) => api.post(`/trip/${tripId}/stays`, stayData),
  getStays: (tripId) => api.get(`/trip/${tripId}/stays`),
  updateStay: (tripId, stayId, stayData) => api.put(`/trip/${tripId}/stays/${stayId}`, stayData),
  deleteStay: (tripId, stayId) => api.delete(`/trip/${tripId}/stays/${stayId}`),
};

// Expenses APIs
export const expensesAPI = {
  createExpense: (tripId, expenseData) => api.post(`/trip/${tripId}/expenses`, expenseData),
  getExpenses: (tripId) => api.get(`/trip/${tripId}/expenses`),
  updateExpense: (tripId, expenseId, expenseData) => api.put(`/trip/${tripId}/expenses/${expenseId}`, expenseData),
  deleteExpense: (tripId, expenseId) => api.delete(`/trip/${tripId}/expenses/${expenseId}`),
  getExpensesSummary: (tripId) => api.get(`/trip/${tripId}/expenses/summary`),
};

// Places APIs with enhanced search
export const placesAPI = {
  searchPlaces: (query) => api.get(`/places/autocomplete/search?q=${query}`),
  getPlaceDetails: (placeId) => api.get(`/places/details?place_id=${placeId}`),
  getPlaceSuggestions: (lat, lng, type = 'tourist_attraction') => 
    api.get(`/places/nearby?lat=${lat}&lng=${lng}&type=${type}`),
};

export default api;
