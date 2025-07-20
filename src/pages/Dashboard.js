import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tripAPI } from '../services/api';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
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
      setTrips(response.data.trips || []);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trip Planner</h1>
              <p className="text-gray-600">Welcome back, {user?.username}!</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Create Trip Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {showCreateForm ? 'Cancel' : 'Create New Trip'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Create Trip Form */}
          {showCreateForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Trip</h2>
              <form onSubmit={handleCreateTrip} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Place Name</label>
                    <input
                      type="text"
                      name="place_name"
                      required
                      value={newTrip.place_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Travel Mode</label>
                    <select
                      name="travel_mode"
                      value={newTrip.travel_mode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="flight">Flight</option>
                      <option value="car">Car</option>
                      <option value="train">Train</option>
                      <option value="bus">Bus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={newTrip.start_date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={newTrip.end_date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Days</label>
                    <input
                      type="number"
                      name="min_days"
                      value={newTrip.min_days}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hotels (comma-separated)</label>
                    <input
                      type="text"
                      name="hotels"
                      value={newTrip.hotels}
                      onChange={handleInputChange}
                      placeholder="Hotel 1, Hotel 2"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={newTrip.tags}
                      onChange={handleInputChange}
                      placeholder="romantic, europe, adventure"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      name="notes"
                      rows="3"
                      value={newTrip.notes}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Create Trip
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Trips List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Your Trips</h2>
            </div>
            {trips.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No trips found. Create your first trip to get started!
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {trips.map((tripData) => (
                  <div
                    key={tripData.trip.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/trip/${tripData.trip.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {tripData.trip.name || 'Untitled Trip'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(tripData.trip.start_date)} - {formatDate(tripData.trip.end_date)}
                        </p>
                        {tripData.trip.travel_mode && (
                          <p className="text-sm text-gray-500 mt-1">
                            Travel by: {tripData.trip.travel_mode}
                          </p>
                        )}
                        {tripData.trip.tags && tripData.trip.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tripData.trip.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;