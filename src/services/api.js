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

// Trip APIs - Updated to match backend routing structure
export const tripAPI = {
  createTrip: (tripData) => api.post('/trips/create', tripData),
  getAllTrips: () => api.get('/trips'), // Uses /trips GET endpoint
  getTripById: (tripId) => api.get(`/trip/${tripId}`), // Uses /trip/:id
  getTripComplete: (tripId) => api.get(`/trip/${tripId}/complete`), // Uses /trip/:id/complete
  updateTrip: (tripId, tripData) => api.put(`/trip/${tripId}`, tripData), // Uses /trip/:id
  deleteTrip: (tripId) => api.delete(`/trip/${tripId}`), // Uses /trip/:id

  // AI-powered trip generation
  generateTrip: (generationData) => api.post('/trip/generate', generationData),
  confirmAITrip: (tripPlan) => api.post('/trip/generate/confirm', tripPlan),
  getMultiCitySuggestions: (source, destination, duration, preferences) =>
    api.get(`/trip/suggest-cities?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&duration=${duration}&preferences=${encodeURIComponent(preferences || '')}`),
};

// Trip Hop APIs - Updated to match backend structure
export const tripHopAPI = {
  createTripHop: (tripId, hopData) => api.post(`/trip/${tripId}/hops`, hopData),
  getTripHops: (tripId) => api.get(`/trip/${tripId}/hops`),
  updateTripHop: (hopId, hopData) => api.put(`/hops/${hopId}`, hopData), // Individual hop endpoint
  deleteTripHop: (hopId) => api.delete(`/hops/${hopId}`), // Individual hop endpoint
};

// Trip Day APIs - Updated to match backend structure
export const tripDayAPI = {
  createTripDay: (tripId, dayData) => api.post(`/trip/${tripId}/days`, dayData),
  getTripDays: (tripId) => api.get(`/trip/${tripId}/days`),
  getTripDay: (dayId) => api.get(`/days/${dayId}`), // Individual day endpoint
  updateTripDay: (dayId, dayData) => api.put(`/days/${dayId}`, dayData), // Individual day endpoint
  deleteTripDay: (dayId) => api.delete(`/days/${dayId}`), // Individual day endpoint
};

// Itinerary APIs - Updated to match backend structure  
export const itineraryAPI = {
  getItinerary: (tripId) => api.get(`/trip/${tripId}/itinerary`),
  getItineraryByDay: (tripId, dayNumber) => api.get(`/trip/${tripId}/itinerary/day/${dayNumber}`),
  getItineraryByDate: (tripId, date) => api.get(`/trip/${tripId}/itinerary?date=${date}`),
};

// Activity APIs - Updated to match backend structure
export const activityAPI = {
  createActivity: (tripId, activityData) => api.post(`/trip/${tripId}/activities`, activityData),
  getActivities: (tripId) => api.get(`/trip/${tripId}/activities`),
  updateActivity: (activityId, activityData) => api.put(`/activities/${activityId}`, activityData),
  deleteActivity: (activityId) => api.delete(`/activities/${activityId}`),
};

// Document Upload APIs - Keep as is for now (may need backend implementation)
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

// Stays APIs - Updated to match backend structure
export const staysAPI = {
  createStay: (hopId, stayData) => api.post(`/hops/${hopId}/stays`, stayData), // Stays are nested under hops
  getStays: (hopId) => api.get(`/hops/${hopId}/stays`), // Get stays for a specific hop
  getStay: (stayId) => api.get(`/stays/${stayId}`), // Individual stay endpoint
  updateStay: (stayId, stayData) => api.put(`/stays/${stayId}`, stayData), // Individual stay endpoint
  deleteStay: (stayId) => api.delete(`/stays/${stayId}`), // Individual stay endpoint
};

// Expenses APIs - Updated to match backend structure  
export const expensesAPI = {
  createExpense: (tripId, expenseData) => api.post(`/trip/${tripId}/expenses`, expenseData),
  getExpenses: (tripId) => api.get(`/trip/${tripId}/expenses`),
  updateExpense: (expenseId, expenseData) => api.put(`/expenses/${expenseId}`, expenseData), // Individual expense endpoint
  deleteExpense: (expenseId) => api.delete(`/expenses/${expenseId}`), // Individual expense endpoint
  getExpensesSummary: (tripId) => api.get(`/trip/${tripId}/expense-summary`),
};

// Places APIs with enhanced search
export const placesAPI = {
  autocompleteSearch: (query) => api.get(`/places/autocomplete/search?query=${encodeURIComponent(query)}`),
  searchPlaces: (query) => api.get(`/places/search?search_text=${query}`),
  getPlaceDetails: (placeId) => api.get(`/places/details?place_id=${placeId}`),
  getPlaceSuggestions: (lat, lng, type = 'tourist_attraction') => 
    api.get(`/places/nearby?lat=${lat}&lng=${lng}&type=${type}`),
};

export default api;
