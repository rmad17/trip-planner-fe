import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PlaceSearchInput from '../components/PlaceSearchInput';
import { 
  tripAPI, 
  tripHopAPI, 
  tripDayAPI, 
  itineraryAPI, 
  documentAPI, 
  staysAPI, 
  expensesAPI,
  placesAPI,
  activityAPI
} from '../services/api';
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Plane,
  Car,
  Train,
  Bus,
  Upload,
  Download,
  FileText,
  Hotel,
  CreditCard,
  Navigation
} from 'lucide-react';

const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Trip data
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit modes
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [editedTrip, setEditedTrip] = useState({});
  
  // Sections data
  const [tripHops, setTripHops] = useState([]);
  const [tripDays, setTripDays] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [selectedDayItinerary, setSelectedDayItinerary] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [stays, setStays] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expensesSummary, setExpensesSummary] = useState(null);
  
  // UI states
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddForms, setShowAddForms] = useState({});
  const [itineraryViewMode, setItineraryViewMode] = useState('all'); // 'all' or 'day'
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Form states for hop management
  const [editingHop, setEditingHop] = useState(null);
  const [newHopData, setNewHopData] = useState({
    name: '',
    description: '',
    city: '',
    country: '',
    start_date: '',
    end_date: '',
    estimated_budget: '',
    place_id: ''
  });
  
  // Form states for day management
  const [editingDay, setEditingDay] = useState(null);
  const [newDayData, setNewDayData] = useState({
    date: '',
    title: '',
    day_type: 'explore',
    notes: '',
    estimated_budget: ''
  });
  
  // Form states for activity management
  const [newActivityData, setNewActivityData] = useState({
    name: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    estimated_cost: '',
    activity_type: 'sightseeing',
    notes: '',
    day_id: ''
  });

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch complete trip details
      const tripResponse = await tripAPI.getTripComplete(tripId);
      const tripData = tripResponse.data;
      
      // Set main trip data
      setTrip(tripData);
      setEditedTrip(tripData || {});
      
      // Set related data from the complete response if available
      if (tripData.trip_hops) {
        setTripHops(tripData.trip_hops);
      }
      if (tripData.trip_days) {
        setTripDays(tripData.trip_days);
      }
      
      // First fetch hops and days, then fetch dependent data
      await Promise.all([
        fetchTripHops(), // Ensure we have the latest hops
        fetchTripDays(), // Ensure we have the latest days
      ]);
      
      // Then fetch data that depends on hops/days
      await Promise.all([
        fetchItinerary(), // Will build from days if backend endpoint not available
        fetchDocuments(),
        fetchStays(), // Now depends on hops being loaded
        fetchExpenses(),
      ]);
    } catch (error) {
      setError('Failed to fetch trip details');
      console.error('Error fetching trip details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripHops = async () => {
    try {
      const response = await tripHopAPI.getTripHops(tripId);
      setTripHops(response.data.trip_hops || []);
    } catch (error) {
      console.error('Error fetching trip hops:', error);
    }
  };

  const fetchTripDays = async () => {
    try {
      const response = await tripDayAPI.getTripDays(tripId);
      setTripDays(response.data.trip_days || []);
    } catch (error) {
      console.error('Error fetching trip days:', error);
    }
  };

  const fetchItinerary = async () => {
    try {
      // Get itinerary from backend
      const response = await itineraryAPI.getItinerary(tripId);
      
      // Backend returns: {"itinerary": [...], "summary": {...}}
      const itineraryData = response.data.itinerary || [];
      setItinerary(itineraryData);
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      setItinerary([]);
    }
  };

  const fetchDayItinerary = async (dayNumber) => {
    try {
      const response = await itineraryAPI.getItineraryByDay(tripId, dayNumber);
      
      // Backend returns the day data directly
      setSelectedDayItinerary({
        dayNumber,
        data: response.data
      });
    } catch (error) {
      console.error(`Error fetching itinerary for day ${dayNumber}:`, error);
      // Fallback to finding the day in the general itinerary
      const dayItinerary = itinerary.find(item => item.day_number === dayNumber);
      setSelectedDayItinerary({
        dayNumber,
        data: dayItinerary || null
      });
    }
  };


  const fetchDocuments = async () => {
    try {
      const response = await documentAPI.getDocuments(tripId);
      
      // Handle different response formats
      let documentsData = response.data;
      if (documentsData.documents) {
        documentsData = documentsData.documents;
      } else if (documentsData.data) {
        documentsData = documentsData.data;
      }
      
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  };

  const fetchStays = async () => {
    try {
      // Stays are associated with trip hops, so we need to collect them from all hops
      if (tripHops.length > 0) {
        const staysPromises = tripHops.map(async (hop) => {
          try {
            const response = await staysAPI.getStays(hop.id);
            // Handle different response formats
            let staysData = response.data;
            if (staysData.stays) {
              staysData = staysData.stays;
            } else if (staysData.data) {
              staysData = staysData.data;
            }
            
            // Add hop reference to each stay for easier display
            return (Array.isArray(staysData) ? staysData : []).map(stay => ({
              ...stay,
              hop_info: hop
            }));
          } catch (error) {
            console.error(`Error fetching stays for hop ${hop.id} (${hop.name}):`, error);
            return [];
          }
        });
        
        const staysResponses = await Promise.all(staysPromises);
        const allStays = staysResponses.flat();
        setStays(allStays);
      } else {
        setStays([]);
      }
    } catch (error) {
      console.error('Error fetching stays:', error);
      setStays([]);
    }
  };

  const fetchExpenses = async () => {
    try {
      const [expensesResponse, summaryResponse] = await Promise.all([
        expensesAPI.getExpenses(tripId).catch(error => {
          console.error('Error fetching expenses list:', error);
          return { data: { expenses: [] } };
        }),
        expensesAPI.getExpensesSummary(tripId).catch(error => {
          console.error('Error fetching expenses summary:', error);
          return { data: null };
        })
      ]);
      
      // Handle different response formats
      let expensesData = expensesResponse.data;
      if (expensesData.expenses) {
        expensesData = expensesData.expenses;
      } else if (expensesData.data) {
        expensesData = expensesData.data;
      }
      
      let summaryData = summaryResponse.data;
      if (summaryData && summaryData.summary) {
        summaryData = summaryData.summary;
      } else if (summaryData && summaryData.data) {
        summaryData = summaryData.data;
      }
      
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setExpensesSummary(summaryData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
      setExpensesSummary(null);
    }
  };

  const handleUpdateTrip = async () => {
    try {
      await tripAPI.updateTrip(tripId, editedTrip);
      setTrip(editedTrip);
      setIsEditingTrip(false);
    } catch (error) {
      setError('Failed to update trip');
      console.error('Error updating trip:', error);
    }
  };

  // Note: handlePlaceSearch can be implemented when needed for place suggestions
  // const handlePlaceSearch = async (query) => { /* implementation */ };

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('file', file); // Some APIs might expect 'file' instead
      formData.append('name', file.name);
      formData.append('filename', file.name); // Alternative field name
      formData.append('category', 'travel'); // More specific default category
      formData.append('document_type', 'travel'); // Alternative field name
      formData.append('entity_type', 'trip_plan');
      formData.append('entity_id', tripId);
      formData.append('trip_id', tripId); // Alternative field name
      
      await documentAPI.uploadDocument(tripId, formData);
      
      // Show success message briefly
      setError('Document uploaded successfully!');
      setTimeout(() => setError(''), 3000);
      
      await fetchDocuments(); // Refresh documents list
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload document';
      setError(`Upload failed: ${errorMessage}`);
      console.error('Error uploading document:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDocumentDownload = async (documentId, fileName) => {
    try {
      const response = await documentAPI.downloadDocument(tripId, documentId);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download document');
      console.error('Error downloading document:', error);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDocumentDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await documentAPI.deleteDocument(tripId, documentId);
      await fetchDocuments(); // Refresh documents list
    } catch (error) {
      setError('Failed to delete document');
      console.error('Error deleting document:', error);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Trip Hop CRUD functions
  const handleCreateHop = async () => {
    try {
      const hopData = {
        ...newHopData,
        estimated_budget: newHopData.estimated_budget ? parseFloat(newHopData.estimated_budget) : null,
        start_date: newHopData.start_date ? new Date(newHopData.start_date).toISOString() : null,
        end_date: newHopData.end_date ? new Date(newHopData.end_date).toISOString() : null,
      };
      
      await tripHopAPI.createTripHop(tripId, hopData);
      
      // Reset form and close
      setNewHopData({
        name: '',
        description: '',
        city: '',
        country: '',
        start_date: '',
        end_date: '',
        estimated_budget: '',
        place_id: ''
      });
      setShowAddForms(prev => ({ ...prev, hop: false }));
      
      // Refresh data
      await fetchTripHops();
    } catch (error) {
      setError('Failed to create hop');
      console.error('Error creating hop:', error);
    }
  };

  const handleUpdateHop = async (hopId, updatedData) => {
    try {
      const hopData = {
        ...updatedData,
        estimated_budget: updatedData.estimated_budget ? parseFloat(updatedData.estimated_budget) : null,
        start_date: updatedData.start_date ? new Date(updatedData.start_date).toISOString() : null,
        end_date: updatedData.end_date ? new Date(updatedData.end_date).toISOString() : null,
      };
      
      await tripHopAPI.updateTripHop(hopId, hopData);
      setEditingHop(null);
      await fetchTripHops();
    } catch (error) {
      setError('Failed to update hop');
      console.error('Error updating hop:', error);
    }
  };

  const handleDeleteHop = async (hopId) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) return;
    
    try {
      await tripHopAPI.deleteTripHop(hopId);
      await fetchTripHops();
    } catch (error) {
      setError('Failed to delete hop');
      console.error('Error deleting hop:', error);
    }
  };

  // Trip Day CRUD functions
  const handleCreateDay = async () => {
    try {
      const dayNumber = tripDays.length + 1; // Auto-calculate day number
      const dayData = {
        ...newDayData,
        day_number: dayNumber,
        date: newDayData.date ? new Date(newDayData.date).toISOString().split('T')[0] : null,
        estimated_budget: newDayData.estimated_budget ? parseFloat(newDayData.estimated_budget) : null,
      };
      
      await tripDayAPI.createTripDay(tripId, dayData);
      
      // Reset form and close
      setNewDayData({
        date: '',
        title: '',
        day_type: 'explore',
        notes: '',
        estimated_budget: ''
      });
      setShowAddForms(prev => ({ ...prev, day: false }));
      
      // Refresh data
      await fetchTripDays();
      await fetchItinerary(); // Refresh itinerary as well
    } catch (error) {
      setError('Failed to create day');
      console.error('Error creating day:', error);
    }
  };

  const handleUpdateDay = async (dayId, updatedData) => {
    try {
      const dayData = {
        ...updatedData,
        date: updatedData.date ? new Date(updatedData.date).toISOString().split('T')[0] : null,
        estimated_budget: updatedData.estimated_budget ? parseFloat(updatedData.estimated_budget) : null,
      };
      
      await tripDayAPI.updateTripDay(dayId, dayData);
      setEditingDay(null);
      await fetchTripDays();
      await fetchItinerary(); // Refresh itinerary as well
    } catch (error) {
      setError('Failed to update day');
      console.error('Error updating day:', error);
    }
  };

  const handleDeleteDay = async (dayId) => {
    if (!window.confirm('Are you sure you want to delete this day? All activities will be removed.')) return;
    
    try {
      await tripDayAPI.deleteTripDay(dayId);
      await fetchTripDays();
      await fetchItinerary(); // Refresh itinerary as well
    } catch (error) {
      setError('Failed to delete day');
      console.error('Error deleting day:', error);
    }
  };

  // Activity CRUD functions
  const handleCreateActivity = async () => {
    console.log('Activity form data:', newActivityData);
    console.log('Trip days available:', tripDays.length);
    
    if (!newActivityData.day_id || !newActivityData.name) {
      setError('Please select a day and enter activity name');
      return;
    }

    try {
      const activityData = {
        name: newActivityData.name,
        description: newActivityData.description,
        location: newActivityData.location,
        activity_type: newActivityData.activity_type,
        notes: newActivityData.notes,
        trip_day_id: newActivityData.day_id, // Maps day_id from form to trip_day_id for backend
        estimated_cost: newActivityData.estimated_cost ? parseFloat(newActivityData.estimated_cost) : null,
        start_time: newActivityData.start_time ? new Date(`1970-01-01T${newActivityData.start_time}:00`).toISOString() : null,
        end_time: newActivityData.end_time ? new Date(`1970-01-01T${newActivityData.end_time}:00`).toISOString() : null,
      };
      
      await activityAPI.createActivity(tripId, activityData);
      
      // Reset form and close
      setNewActivityData({
        name: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
        estimated_cost: '',
        activity_type: 'sightseeing',
        notes: '',
        day_id: ''
      });
      setShowAddForms(prev => ({ ...prev, activity: false }));
      
      // Refresh itinerary to show new activity
      await fetchItinerary();
    } catch (error) {
      setError('Failed to create activity');
      console.error('Error creating activity:', error);
    }
  };

  const handleUpdateActivity = async (activityId, updatedData) => {
    try {
      const activityData = {
        ...updatedData,
        estimated_cost: updatedData.estimated_cost ? parseFloat(updatedData.estimated_cost) : null,
        start_time: updatedData.start_time ? new Date(`1970-01-01T${updatedData.start_time}:00`).toISOString() : null,
        end_time: updatedData.end_time ? new Date(`1970-01-01T${updatedData.end_time}:00`).toISOString() : null,
      };
      
      await activityAPI.updateActivity(activityId, activityData);
      await fetchItinerary();
    } catch (error) {
      setError('Failed to update activity');
      console.error('Error updating activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      await activityAPI.deleteActivity(activityId);
      await fetchItinerary();
    } catch (error) {
      setError('Failed to delete activity');
      console.error('Error deleting activity:', error);
    }
  };

  const getTravelIcon = (travelMode) => {
    const iconClass = "h-5 w-5";
    switch (travelMode) {
      case 'flight': return <Plane className={iconClass} />;
      case 'car': return <Car className={iconClass} />;
      case 'train': return <Train className={iconClass} />;
      case 'bus': return <Bus className={iconClass} />;
      default: return <MapPin className={iconClass} />;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'hops', label: 'Trip Hops', icon: Navigation },
    { id: 'days', label: 'Daily Plans', icon: Calendar },
    { id: 'itinerary', label: 'Itinerary', icon: Clock },
    { id: 'stays', label: 'Accommodations', icon: Hotel },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || 'Trip not found'}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tripData = trip || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                {isEditingTrip ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editedTrip.name || ''}
                      onChange={(e) => setEditedTrip(prev => ({ ...prev, name: e.target.value }))}
                      className="text-2xl font-bold bg-gray-700 text-white placeholder-gray-300 border-gray-500 rounded-lg px-3 py-1"
                      placeholder="Trip name"
                    />
                    <button
                      onClick={handleUpdateTrip}
                      className="p-1 text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingTrip(false);
                        setEditedTrip(tripData);
                      }}
                      className="p-1 text-red-300 hover:text-red-200 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-white font-display">
                      {tripData.name || 'Untitled Trip'}
                    </h1>
                    <button
                      onClick={() => setIsEditingTrip(true)}
                      className="p-1 text-gray-300 hover:text-white transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <p className="text-gray-300">
                  Created by {trip.user?.username || user?.username}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Trip Sections</h3>
              <ul className="space-y-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === section.id
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'overview' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Trip Overview</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Duration
                      </h3>
                      <div className="flex items-center space-x-2 text-lg text-gray-900">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span>{formatDate(tripData.start_date)} - {formatDate(tripData.end_date)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Travel Mode
                      </h3>
                      <div className="flex items-center space-x-2 text-lg text-gray-900">
                        {getTravelIcon(tripData.travel_mode)}
                        <span className="capitalize">{tripData.travel_mode || 'Not specified'}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Budget
                      </h3>
                      <div className="flex items-center space-x-2 text-lg text-gray-900">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <span>{expensesSummary ? formatCurrency(expensesSummary.total) : 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  {tripData.notes && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{tripData.notes}</p>
                    </div>
                  )}

                  {tripData.tags && tripData.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {tripData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-accent-100 text-accent-700 text-sm rounded-full font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'expenses' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Expenses</h2>
                  <button
                    onClick={() => setShowAddForms(prev => ({ ...prev, expense: !prev.expense }))}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Expense</span>
                  </button>
                </div>
                
                {expensesSummary && (
                  <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(expensesSummary.total)}
                        </div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(expensesSummary.budget || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Budget</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {expenses.length}
                        </div>
                        <div className="text-sm text-gray-600">Transactions</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${expensesSummary.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(expensesSummary.remaining || (expensesSummary.budget || 0) - expensesSummary.total)}
                        </div>
                        <div className="text-sm text-gray-600">Remaining</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {expenses.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                      <p className="text-gray-600">Start tracking your trip expenses</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {expenses.map((expense, index) => (
                        <div key={expense.id || index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {expense.description || expense.title || expense.name || 'Expense'}
                                </h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                                    {expense.category || expense.expense_type || 'general'}
                                  </span>
                                  <span>•</span>
                                  <span>{formatDate(expense.date || expense.expense_date || expense.created_at)}</span>
                                </div>
                                {expense.notes && (
                                  <p className="text-sm text-gray-500 mt-2">{expense.notes}</p>
                                )}
                                {expense.location && (
                                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{expense.location}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">
                                  {formatCurrency(expense.amount || expense.cost || 0)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {expense.currency || 'USD'}
                                </div>
                                {expense.payment_method && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {expense.payment_method}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <button className="text-primary-600 hover:text-primary-700">
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'hops' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Trip Destinations</h2>
                  <button
                    onClick={() => setShowAddForms(prev => ({ ...prev, hop: !prev.hop }))}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Destination</span>
                  </button>
                </div>

                {/* Add Hop Form */}
                {showAddForms.hop && (
                  <div className="border-b border-gray-200 p-6 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Destination</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={newHopData.name}
                          onChange={(e) => setNewHopData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., Paris Visit"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location (City, Country) *</label>
                        <PlaceSearchInput
                          value={newHopData.city ? `${newHopData.city}, ${newHopData.country}` : ''}
                          onChange={(value) => {
                            // Clear selection when typing
                            const parts = value.split(',');
                            if (parts.length >= 2) {
                              setNewHopData(prev => ({
                                ...prev,
                                city: parts[0].trim(),
                                country: parts.slice(-1)[0].trim()
                              }));
                            } else {
                              setNewHopData(prev => ({
                                ...prev,
                                city: value,
                                country: ''
                              }));
                            }
                          }}
                          onPlaceSelect={(place) => {
                            const fullAddress = place.formatted_address || place.description || '';
                            const parts = fullAddress.split(',');

                            if (parts.length >= 2) {
                              setNewHopData(prev => ({
                                ...prev,
                                city: parts[0].trim(),
                                country: parts.slice(-1)[0].trim(),
                                place_id: place.id || place.place_id
                              }));
                            } else {
                              setNewHopData(prev => ({
                                ...prev,
                                city: fullAddress,
                                country: '',
                                place_id: place.id || place.place_id
                              }));
                            }
                          }}
                          placeholder="e.g., Paris, France"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget</label>
                        <input
                          type="number"
                          value={newHopData.estimated_budget}
                          onChange={(e) => setNewHopData(prev => ({ ...prev, estimated_budget: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={newHopData.start_date}
                          onChange={(e) => setNewHopData(prev => ({ ...prev, start_date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={newHopData.end_date}
                          onChange={(e) => setNewHopData(prev => ({ ...prev, end_date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={newHopData.description}
                          onChange={(e) => setNewHopData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          rows="3"
                          placeholder="Describe your plans for this destination..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setShowAddForms(prev => ({ ...prev, hop: false }))}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateHop}
                        className="btn-primary"
                        disabled={!newHopData.name || !newHopData.city || !newHopData.country}
                      >
                        Add Destination
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {tripHops.length === 0 ? (
                    <div className="text-center py-8">
                      <Navigation className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations yet</h3>
                      <p className="text-gray-600">Add destinations to plan your trip route</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tripHops.map((hop, index) => (
                        <div key={hop.id} className="border border-gray-200 rounded-lg p-4">
                          {editingHop?.id === hop.id ? (
                            // Edit Form
                            <div className="space-y-3">
                              <div>
                                <input
                                  type="text"
                                  value={editingHop.name || ''}
                                  onChange={(e) => setEditingHop(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                              </div>
                              <div>
                                <PlaceSearchInput
                                  value={editingHop.city && editingHop.country ? `${editingHop.city}, ${editingHop.country}` : editingHop.city || ''}
                                  onChange={(value) => {
                                    const parts = value.split(',');
                                    if (parts.length >= 2) {
                                      setEditingHop(prev => ({
                                        ...prev,
                                        city: parts[0].trim(),
                                        country: parts.slice(-1)[0].trim()
                                      }));
                                    } else {
                                      setEditingHop(prev => ({
                                        ...prev,
                                        city: value
                                      }));
                                    }
                                  }}
                                  onPlaceSelect={(place) => {
                                    const fullAddress = place.formatted_address || place.description || '';
                                    const parts = fullAddress.split(',');

                                    if (parts.length >= 2) {
                                      setEditingHop(prev => ({
                                        ...prev,
                                        city: parts[0].trim(),
                                        country: parts.slice(-1)[0].trim(),
                                        place_id: place.id || place.place_id
                                      }));
                                    } else {
                                      setEditingHop(prev => ({
                                        ...prev,
                                        city: fullAddress,
                                        place_id: place.id || place.place_id
                                      }));
                                    }
                                  }}
                                  placeholder="City, Country"
                                />
                              </div>
                              <textarea
                                value={editingHop.description || ''}
                                onChange={(e) => setEditingHop(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                rows="2"
                                placeholder="Description"
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setEditingHop(null)}
                                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleUpdateHop(hop.id, editingHop)}
                                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Display View
                            <>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <h3 className="font-semibold text-gray-900">{hop.name}</h3>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                  <MapPin className="h-4 w-4" />
                                  <span>{hop.city}, {hop.country}</span>
                                </div>
                              </div>
                              {hop.description && (
                                <p className="text-gray-600 text-sm mb-3">{hop.description}</p>
                              )}
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{formatDate(hop.start_date)}</span>
                                  </div>
                                  {hop.estimated_budget && (
                                    <div className="flex items-center space-x-1">
                                      <DollarSign className="h-4 w-4 text-gray-400" />
                                      <span>{formatCurrency(hop.estimated_budget)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => setEditingHop({ ...hop, start_date: hop.start_date?.split('T')[0], end_date: hop.end_date?.split('T')[0] })}
                                    className="text-primary-600 hover:text-primary-700"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteHop(hop.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'days' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Daily Plans</h2>
                  <button
                    onClick={() => setShowAddForms(prev => ({ ...prev, day: !prev.day }))}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Day</span>
                  </button>
                </div>

                {/* Add Day Form */}
                {showAddForms.day && (
                  <div className="border-b border-gray-200 p-6 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Day</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                          type="date"
                          value={newDayData.date}
                          onChange={(e) => setNewDayData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Day Type</label>
                        <select
                          value={newDayData.day_type}
                          onChange={(e) => setNewDayData(prev => ({ ...prev, day_type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="explore">Explore</option>
                          <option value="travel">Travel</option>
                          <option value="relax">Relax</option>
                          <option value="business">Business</option>
                          <option value="adventure">Adventure</option>
                          <option value="cultural">Cultural</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={newDayData.title}
                          onChange={(e) => setNewDayData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., Exploring Paris"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget</label>
                        <input
                          type="number"
                          value={newDayData.estimated_budget}
                          onChange={(e) => setNewDayData(prev => ({ ...prev, estimated_budget: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={newDayData.notes}
                          onChange={(e) => setNewDayData(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          rows="3"
                          placeholder="Any notes for this day..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setShowAddForms(prev => ({ ...prev, day: false }))}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateDay}
                        className="btn-primary"
                        disabled={!newDayData.date}
                      >
                        Add Day
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {tripDays.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No daily plans yet</h3>
                      <p className="text-gray-600">Create daily plans to organize your trip activities</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tripDays.sort((a, b) => a.day_number - b.day_number).map((day) => (
                        <div key={day.id} className="border border-gray-200 rounded-lg">
                          {editingDay?.id === day.id ? (
                            // Edit Form for Day
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                  <input
                                    type="date"
                                    value={editingDay.date?.split('T')[0] || ''}
                                    onChange={(e) => setEditingDay(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Day Type</label>
                                  <select
                                    value={editingDay.day_type || 'explore'}
                                    onChange={(e) => setEditingDay(prev => ({ ...prev, day_type: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  >
                                    <option value="explore">Explore</option>
                                    <option value="travel">Travel</option>
                                    <option value="relax">Relax</option>
                                    <option value="business">Business</option>
                                    <option value="adventure">Adventure</option>
                                    <option value="cultural">Cultural</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                  <input
                                    type="text"
                                    value={editingDay.title || ''}
                                    onChange={(e) => setEditingDay(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget</label>
                                  <input
                                    type="number"
                                    value={editingDay.estimated_budget || ''}
                                    onChange={(e) => setEditingDay(prev => ({ ...prev, estimated_budget: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                  <textarea
                                    value={editingDay.notes || ''}
                                    onChange={(e) => setEditingDay(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    rows="2"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => setEditingDay(null)}
                                  className="btn-secondary"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleUpdateDay(day.id, editingDay)}
                                  className="btn-primary"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Display View for Day
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                                    {day.day_number}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{day.title || `Day ${day.day_number}`}</h3>
                                    <p className="text-sm text-gray-600">{formatDate(day.date)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium capitalize">
                                    {day.day_type || 'explore'}
                                  </span>
                                  {day.estimated_budget && (
                                    <span className="text-sm text-gray-600">
                                      Budget: {formatCurrency(day.estimated_budget)}
                                    </span>
                                  )}
                                  <button 
                                    onClick={() => setEditingDay({ ...day })}
                                    className="text-primary-600 hover:text-primary-700"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteDay(day.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              {day.notes && (
                                <p className="text-gray-600 text-sm mt-2">{day.notes}</p>
                              )}
                            </div>
                          )}
                          
                          <div className="p-4">
                            {/* Find activities for this day from itinerary */}
                            {(() => {
                              const dayItinerary = itinerary.find(item => item.day_number === day.day_number);
                              const activities = dayItinerary?.activities || [];
                              
                              if (activities.length === 0) {
                                return (
                                  <div className="text-sm text-gray-500">
                                    No activities planned for this day
                                  </div>
                                );
                              }
                              
                              return (
                                <div className="space-y-2">
                                  {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-2 p-2 bg-white rounded border border-gray-100">
                                      <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 text-sm">{activity.name}</h4>
                                            {activity.description && (
                                              <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                            )}
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <div className="text-xs text-gray-500 text-right">
                                              {activity.start_time && (
                                                <div>{new Date(activity.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                              )}
                                              {activity.estimated_cost && (
                                                <div className="mt-1">{formatCurrency(activity.estimated_cost)}</div>
                                              )}
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <button
                                                onClick={() => console.log('Edit activity:', activity.id)}
                                                className="text-primary-600 hover:text-primary-700 p-0.5"
                                                title="Edit activity"
                                              >
                                                <Edit3 className="h-3 w-3" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteActivity(activity.id)}
                                                className="text-red-600 hover:text-red-700 p-0.5"
                                                title="Delete activity"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                        {activity.location && (
                                          <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                                            <MapPin className="h-3 w-3" />
                                            <span>{activity.location}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'itinerary' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 font-display">Itinerary</h2>
                    <div className="flex items-center space-x-3">
                      {/* View Mode Toggle */}
                      <div className="flex rounded-md shadow-sm">
                        <button
                          onClick={() => {
                            setItineraryViewMode('all');
                            setSelectedDayItinerary(null);
                          }}
                          className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                            itineraryViewMode === 'all'
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          All Days
                        </button>
                        <button
                          onClick={() => setItineraryViewMode('day')}
                          className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                            itineraryViewMode === 'day'
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Single Day
                        </button>
                      </div>
                      
                      {/* Day Selector for single day view */}
                      {itineraryViewMode === 'day' && (
                        <select
                          value={selectedDay || ''}
                          onChange={(e) => {
                            const dayNum = parseInt(e.target.value);
                            setSelectedDay(dayNum);
                            fetchDayItinerary(dayNum);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select a day</option>
                          {tripDays.sort((a, b) => a.day_number - b.day_number).map(day => (
                            <option key={day.id} value={day.day_number}>
                              Day {day.day_number} - {formatDate(day.date)}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      <button
                        onClick={() => setShowAddForms(prev => ({ ...prev, activity: !prev.activity }))}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Activity</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add Activity Form */}
                {showAddForms.activity && (
                  <div className="border-b border-gray-200 p-6 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Activity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name *</label>
                        <input
                          type="text"
                          value={newActivityData.name}
                          onChange={(e) => setNewActivityData(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            !newActivityData.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Visit Eiffel Tower"
                        />
                        {!newActivityData.name && (
                          <p className="text-sm text-red-600 mt-1">Activity name is required</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Day *</label>
                        <select
                          value={newActivityData.day_id}
                          onChange={(e) => setNewActivityData(prev => ({ ...prev, day_id: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            !newActivityData.day_id ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select a day</option>
                          {tripDays.sort((a, b) => a.day_number - b.day_number).map(day => (
                            <option key={day.id} value={day.id}>
                              Day {day.day_number} - {formatDate(day.date)}
                            </option>
                          ))}
                        </select>
                        {tripDays.length === 0 && (
                          <p className="text-sm text-amber-600 mt-1 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            No days created yet. Go to "Daily Plans" tab to create days first.
                          </p>
                        )}
                        {tripDays.length > 0 && !newActivityData.day_id && (
                          <p className="text-sm text-red-600 mt-1">Please select a day</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                        <select
                          value={newActivityData.activity_type}
                          onChange={(e) => setNewActivityData(prev => ({ ...prev, activity_type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="sightseeing">Sightseeing</option>
                          <option value="dining">Dining</option>
                          <option value="shopping">Shopping</option>
                          <option value="entertainment">Entertainment</option>
                          <option value="transport">Transport</option>
                          <option value="accommodation">Accommodation</option>
                          <option value="adventure">Adventure</option>
                          <option value="cultural">Cultural</option>
                          <option value="relaxation">Relaxation</option>
                          <option value="business">Business</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                        <input
                          type="number"
                          value={newActivityData.estimated_cost}
                          onChange={(e) => setNewActivityData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={newActivityData.start_time}
                          onChange={(e) => setNewActivityData(prev => ({ ...prev, start_time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={newActivityData.end_time}
                          onChange={(e) => setNewActivityData(prev => ({ ...prev, end_time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <PlaceSearchInput
                          value={newActivityData.location}
                          onChange={(value) => {
                            setNewActivityData(prev => ({ ...prev, location: value }));
                          }}
                          onPlaceSelect={(place) => {
                            const location = place.formatted_address || place.name || place.description || '';
                            setNewActivityData(prev => ({ ...prev, location: location }));
                          }}
                          placeholder="Search for a location..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={newActivityData.description}
                          onChange={(e) => setNewActivityData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          rows="3"
                          placeholder="Describe the activity..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={newActivityData.notes}
                          onChange={(e) => setNewActivityData(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          rows="2"
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setShowAddForms(prev => ({ ...prev, activity: false }))}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateActivity}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          !newActivityData.name || !newActivityData.day_id
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                        disabled={!newActivityData.name || !newActivityData.day_id}
                        title={
                          !newActivityData.name
                            ? 'Please enter an activity name'
                            : !newActivityData.day_id
                            ? tripDays.length === 0
                              ? 'No days available. Create a day first.'
                              : 'Please select a day'
                            : 'Add Activity'
                        }
                      >
                        Add Activity
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  {/* All Days View */}
                  {itineraryViewMode === 'all' && (
                    <>
                      {itinerary.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities planned yet</h3>
                          <p className="text-gray-600">Add activities to create your detailed itinerary</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {itinerary.map((dayItem) => (
                            <div key={dayItem.day_number || Math.random()} className="border border-gray-200 rounded-lg">
                              <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-3">
                                    <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                                      {dayItem.day_number || '?'}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-900">
                                        {dayItem.title || `Day ${dayItem.day_number || '?'}`}
                                      </h3>
                                      <p className="text-sm text-gray-600">{dayItem.date}</p>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {dayItem.activity_count || 0} activities
                                  </div>
                                </div>
                                {dayItem.notes && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    {dayItem.notes}
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                {!dayItem.activities || dayItem.activities.length === 0 ? (
                                  <p className="text-gray-500 text-sm">No activities planned for this day</p>
                                ) : (
                                  <div className="space-y-3">
                                    {dayItem.activities.map((activity, index) => (
                                      <div key={activity.id || index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                                        <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <h4 className="font-medium text-gray-900">{activity.name || activity.title}</h4>
                                              {activity.description && (
                                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                              )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <div className="text-sm text-gray-500 text-right">
                                                {activity.start_time && (
                                                  <div>{new Date(activity.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                )}
                                                {activity.estimated_cost && (
                                                  <div className="mt-1">{formatCurrency(activity.estimated_cost)}</div>
                                                )}
                                              </div>
                                              <div className="flex items-center space-x-1 ml-2">
                                                <button
                                                  onClick={() => console.log('Edit activity:', activity.id)}
                                                  className="text-primary-600 hover:text-primary-700 p-1"
                                                  title="Edit activity"
                                                >
                                                  <Edit3 className="h-3 w-3" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteActivity(activity.id)}
                                                  className="text-red-600 hover:text-red-700 p-1"
                                                  title="Delete activity"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                          {activity.location && (
                                            <div className="flex items-center space-x-1 mt-2 text-sm text-gray-500">
                                              <MapPin className="h-3 w-3" />
                                              <span>{activity.location}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Single Day View */}
                  {itineraryViewMode === 'day' && (
                    <>
                      {!selectedDay ? (
                        <div className="text-center py-8">
                          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a day</h3>
                          <p className="text-gray-600">Choose a day from the dropdown above to view its detailed itinerary</p>
                        </div>
                      ) : selectedDayItinerary ? (
                        <div className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                                  {selectedDayItinerary.dayNumber}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    Day {selectedDayItinerary.dayNumber} Details
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {selectedDayItinerary.data?.date || 'Date not available'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                {selectedDayItinerary.data?.summary?.activity_count || selectedDayItinerary.data?.activities?.length || 0} activities
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            {!selectedDayItinerary.data?.activities || selectedDayItinerary.data.activities.length === 0 ? (
                              <p className="text-gray-500 text-sm">No activities planned for this day</p>
                            ) : (
                              <div className="space-y-3">
                                {selectedDayItinerary.data.activities.map((activity, index) => (
                                  <div key={activity.id || index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <h4 className="font-medium text-gray-900">{activity.name || activity.title}</h4>
                                          {activity.description && (
                                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <div className="text-sm text-gray-500 text-right">
                                            {activity.start_time && (
                                              <div>{new Date(activity.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            )}
                                            {activity.estimated_cost && (
                                              <div className="mt-1">{formatCurrency(activity.estimated_cost)}</div>
                                            )}
                                          </div>
                                          <div className="flex items-center space-x-1 ml-2">
                                            <button
                                              onClick={() => console.log('Edit activity:', activity.id)}
                                              className="text-primary-600 hover:text-primary-700 p-1"
                                              title="Edit activity"
                                            >
                                              <Edit3 className="h-3 w-3" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteActivity(activity.id)}
                                              className="text-red-600 hover:text-red-700 p-1"
                                              title="Delete activity"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      {activity.location && (
                                        <div className="flex items-center space-x-1 mt-2 text-sm text-gray-500">
                                          <MapPin className="h-3 w-3" />
                                          <span>{activity.location}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading day itinerary...</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'stays' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Accommodations</h2>
                  <button
                    onClick={() => setShowAddForms(prev => ({ ...prev, stay: !prev.stay }))}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Stay</span>
                  </button>
                </div>
                <div className="p-6">
                  {stays.length === 0 ? (
                    <div className="text-center py-8">
                      <Hotel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No accommodations yet</h3>
                      <p className="text-gray-600">Add hotels, hostels, or other places to stay</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {stays.map((stay) => {
                        // Use the enhanced hop_info if available, otherwise find it
                        const associatedHop = stay.hop_info || tripHops.find(hop => hop.id === stay.trip_hop);
                        
                        return (
                          <div key={stay.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {stay.name || stay.accommodation_name || `Accommodation in ${associatedHop?.name || associatedHop?.city || 'Unknown Location'}`}
                                </h3>
                                <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{stay.address || stay.location || `${associatedHop?.city}, ${associatedHop?.country}` || 'Address not set'}</span>
                                </div>
                                {associatedHop && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Part of: {associatedHop.name}
                                  </div>
                                )}
                              </div>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium capitalize">
                                {stay.stay_type || stay.type || 'hotel'}
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              {/* Date Range */}
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {formatDate(stay.start_date || stay.check_in_date)} - {formatDate(stay.end_date || stay.check_out_date)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Cost Information */}
                              {(stay.cost_per_night || stay.total_cost) && (
                                <div className="flex items-center space-x-4">
                                  {stay.cost_per_night && (
                                    <div className="flex items-center space-x-1">
                                      <DollarSign className="h-4 w-4 text-gray-400" />
                                      <span>{formatCurrency(stay.cost_per_night)}/night</span>
                                    </div>
                                  )}
                                  {stay.total_cost && (
                                    <div className="flex items-center space-x-1">
                                      <span className="text-gray-500">Total:</span>
                                      <span className="font-medium">{formatCurrency(stay.total_cost)}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Booking Reference */}
                              {stay.booking_reference && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-gray-500">Booking:</span>
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{stay.booking_reference}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-end mt-3">
                              <button className="text-primary-600 hover:text-primary-700">
                                <Edit3 className="h-4 w-4" />
                              </button>
                            </div>
                            
                            {(stay.stay_notes || stay.notes) && (
                              <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-2">
                                {stay.stay_notes || stay.notes}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'documents' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Documents</h2>
                  <label className="btn-primary flex items-center space-x-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>Upload Document</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                    />
                  </label>
                </div>
                <div className="p-6">
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                      <p className="text-gray-600">Upload tickets, reservations, and other travel documents</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map((doc, index) => (
                        <div key={doc.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-3">
                            <FileText className="h-8 w-8 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {doc.name || doc.filename || doc.original_name || 'Document'}
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                {doc.size && (
                                  <p>{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                                )}
                                {doc.category && (
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                                    {doc.category || doc.document_type || doc.type}
                                  </span>
                                )}
                                {doc.upload_date || doc.created_at ? (
                                  <p className="text-xs text-gray-500">
                                    Uploaded: {formatDate(doc.upload_date || doc.created_at)}
                                  </p>
                                ) : null}
                              </div>
                              {doc.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{doc.description}</p>
                              )}
                            </div>
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => handleDocumentDownload(doc.id, doc.name || doc.filename)}
                                className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Download document"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDocumentDelete(doc.id)}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Delete document"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;