import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tripAPI } from '../services/api';

const TripDetails = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTripDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      // Since the backend doesn't have a specific endpoint for single trip details,
      // we'll fetch all trips and find the one we need
      const response = await tripAPI.getAllTrips();
      const trips = response.data.trips || [];
      const foundTrip = trips.find(t => t.trip.id === tripId);
      
      if (foundTrip) {
        setTrip(foundTrip);
      } else {
        setError('Trip not found');
      }
    } catch (error) {
      setError('Failed to fetch trip details');
      console.error('Error fetching trip details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading trip details...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || 'Trip not found'}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { trip: tripData, user: tripOwner } = trip;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {tripData.name || 'Trip Details'}
                </h1>
                <p className="text-gray-600">Created by {tripOwner?.username}</p>
              </div>
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
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Trip Overview */}
            <div className="px-6 py-8 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Duration</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {formatDate(tripData.start_date)} - {formatDate(tripData.end_date)}
                  </p>
                  {tripData.min_days && (
                    <p className="text-sm text-gray-600">Minimum {tripData.min_days} days</p>
                  )}
                </div>
                
                {tripData.travel_mode && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Travel Mode</h3>
                    <p className="mt-1 text-lg text-gray-900 capitalize">{tripData.travel_mode}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created</h3>
                  <p className="mt-1 text-lg text-gray-900">{formatDateTime(tripData.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Trip Notes */}
            {tripData.notes && (
              <div className="px-6 py-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{tripData.notes}</p>
              </div>
            )}

            {/* Hotels */}
            {tripData.hotels && tripData.hotels.length > 0 && (
              <div className="px-6 py-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Hotels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tripData.hotels.map((hotel, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-gray-900">{hotel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tripData.tags && tripData.tags.length > 0 && (
              <div className="px-6 py-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tripData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trip Metadata */}
            <div className="px-6 py-6 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Trip Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Trip ID:</span>
                  <span className="ml-2 text-gray-900 font-mono">{tripData.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Last Updated:</span>
                  <span className="ml-2 text-gray-900">{formatDateTime(tripData.updated_at)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Owner:</span>
                  <span className="ml-2 text-gray-900">{tripOwner?.username}</span>
                </div>
                {tripOwner?.email && (
                  <div>
                    <span className="font-medium text-gray-500">Owner Email:</span>
                    <span className="ml-2 text-gray-900">{tripOwner.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-white flex justify-between items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Back to Dashboard
              </button>
              
              <div className="space-x-3">
                <button
                  onClick={() => {
                    // Future: Edit trip functionality
                    alert('Edit functionality coming soon!');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Edit Trip
                </button>
                <button
                  onClick={() => {
                    // Future: Share trip functionality
                    navigator.clipboard.writeText(window.location.href);
                    alert('Trip link copied to clipboard!');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Share Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TripDetails;