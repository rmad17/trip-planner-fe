import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tripAPI } from '../services/api';
import PlaceSearchInput from '../components/PlaceSearchInput';
import AITripModal from '../components/AITripModal';
import {
  Plus,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
  Car,
  Train,
  Bus,
  ChevronRight,
  Search,
  Bell,
  Settings,
  LogOut,
  Filter,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [newTrip, setNewTrip] = useState({
    place_name: '',
    start_date: '',
    end_date: '',
    min_days: '',
    travel_mode: 'flight',
    notes: '',
    hotels: '',
    tags: ''
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getAllTrips();
      setTrips(response.data.trip_plans || []);
    } catch (error) {
      setError('Failed to fetch trips');
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      const tripData = {
        ...newTrip,
        min_days: newTrip.min_days ? parseInt(newTrip.min_days) : null,
        start_date: newTrip.start_date ? new Date(newTrip.start_date).toISOString() : null,
        end_date: newTrip.end_date ? new Date(newTrip.end_date).toISOString() : null,
        hotels: newTrip.hotels ? newTrip.hotels.split(',').map(h => h.trim()) : [],
        tags: newTrip.tags ? newTrip.tags.split(',').map(t => t.trim()) : []
      };
      
      await tripAPI.createTrip(tripData);
      setShowCreateForm(false);
      setNewTrip({
        place_name: '',
        start_date: '',
        end_date: '',
        min_days: '',
        travel_mode: 'flight',
        notes: '',
        hotels: '',
        tags: ''
      });
      fetchTrips();
    } catch (error) {
      setError('Failed to create trip');
      console.error('Error creating trip:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewTrip({
      ...newTrip,
      [e.target.name]: e.target.value
    });
  };

  const handleAITripCreated = async (tripId) => {
    // Refresh trips and navigate to the new trip
    await fetchTrips();
    navigate(`/trip/${tripId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getTravelIcon = (travelMode) => {
    const iconClass = "h-4 w-4";
    switch (travelMode) {
      case 'flight': return <Plane className={iconClass} />;
      case 'car': return <Car className={iconClass} />;
      case 'train': return <Train className={iconClass} />;
      case 'bus': return <Bus className={iconClass} />;
      default: return <MapPin className={iconClass} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your adventures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-white font-display">TripCraft</h1>
                <p className="text-gray-300">Welcome back, {user?.username}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-primary-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold text-white font-display mb-2">
                Plan Your Perfect Journey
              </h2>
              <p className="text-lg text-primary-100 max-w-2xl">
                Organize trips, manage expenses, collaborate with travelers, and store documents all in one premium platform.
              </p>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowAIModal(true)}
                className="btn-accent flex items-center justify-center space-x-2 text-lg px-8 py-4 bg-gradient-to-r from-accent to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg"
              >
                <Sparkles className="h-5 w-5" />
                <span>AI Trip Planner</span>
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-secondary flex items-center justify-center space-x-2 text-lg px-8 py-4 bg-white text-primary-700 hover:bg-gray-50"
              >
                <Plus className="h-5 w-5" />
                <span>Manual Create</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Trip Form */}
        {showCreateForm && (
          <div className="card mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 font-display">Create New Trip</h3>
              <p className="text-gray-600">Start planning your next adventure</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateTrip} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trip Name / Destination
                    </label>
                    <PlaceSearchInput
                      value={newTrip.place_name}
                      onChange={(value) => {
                        setNewTrip(prev => ({ ...prev, place_name: value }));
                      }}
                      onPlaceSelect={(place) => {
                        const placeName = place.description || place.name || place.formatted_address || '';
                        setNewTrip(prev => ({
                          ...prev,
                          place_name: placeName,
                          destination: place
                        }));
                      }}
                      placeholder="e.g., Paris, Tokyo, European Adventure"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Primary Travel Mode
                    </label>
                    <select
                      name="travel_mode"
                      value={newTrip.travel_mode}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="flight">✈️ Flight</option>
                      <option value="car">🚗 Car</option>
                      <option value="train">🚆 Train</option>
                      <option value="bus">🚌 Bus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={newTrip.start_date}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={newTrip.end_date}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Minimum Days
                    </label>
                    <input
                      type="number"
                      name="min_days"
                      value={newTrip.min_days}
                      onChange={handleInputChange}
                      placeholder="7"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hotels & Accommodations
                    </label>
                    <input
                      type="text"
                      name="hotels"
                      value={newTrip.hotels}
                      onChange={handleInputChange}
                      placeholder="Grand Hotel, Resort Paradise"
                      className="input-field"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trip Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={newTrip.tags}
                      onChange={handleInputChange}
                      placeholder="romantic, adventure, cultural, family"
                      className="input-field"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trip Notes
                    </label>
                    <textarea
                      name="notes"
                      rows="4"
                      value={newTrip.notes}
                      onChange={handleInputChange}
                      placeholder="Special occasions, preferences, or important details..."
                      className="input-field resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Trip
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search trips..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <MapPin className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start your journey by creating your first trip. Plan itineraries, manage expenses, and collaborate with fellow travelers.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Trip</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="card-hover cursor-pointer transform hover:scale-105 transition-all duration-200"
                onClick={() => navigate(`/trip/${trip.id}`)}
              >
                <div className="h-48 bg-accent-400 relative overflow-hidden">
                  <div className="absolute inset-0 bg-opacity-20"></div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white bg-opacity-90 rounded-full p-2">
                      {getTravelIcon(trip.travel_mode)}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold font-display mb-1">
                      {trip.name || 'Untitled Trip'}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(trip.start_date)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      {trip.start_date && trip.end_date && (
                        <span>
                          {Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24))} days
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  {trip.tags && trip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {trip.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {trip.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          +{trip.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>1</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Budget</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* AI Trip Planning Modal */}
      <AITripModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onTripCreated={handleAITripCreated}
      />
    </div>
  );
};

export default Dashboard;
