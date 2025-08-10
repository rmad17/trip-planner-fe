import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  tripAPI, 
  tripHopAPI, 
  tripDayAPI, 
  itineraryAPI, 
  documentAPI, 
  staysAPI, 
  expensesAPI,
  placesAPI 
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
  Users,
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
  Navigation,
  Search,
  ChevronDown,
  ChevronUp
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
  const [documents, setDocuments] = useState([]);
  const [stays, setStays] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expensesSummary, setExpensesSummary] = useState(null);
  
  // UI states
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddForms, setShowAddForms] = useState({});
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch main trip details
      const tripResponse = await tripAPI.getTripById(tripId);
      setTrip(tripResponse.data);
      setEditedTrip(tripResponse.data.trip || {});
      
      // Fetch all related data
      await Promise.all([
        fetchTripHops(),
        fetchTripDays(),
        fetchItinerary(),
        fetchDocuments(),
        fetchStays(),
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
      setTripHops(response.data.hops || []);
    } catch (error) {
      console.error('Error fetching trip hops:', error);
    }
  };

  const fetchTripDays = async () => {
    try {
      const response = await tripDayAPI.getTripDays(tripId);
      setTripDays(response.data.days || []);
    } catch (error) {
      console.error('Error fetching trip days:', error);
    }
  };

  const fetchItinerary = async () => {
    try {
      const response = await itineraryAPI.getItinerary(tripId);
      setItinerary(response.data.items || []);
    } catch (error) {
      console.error('Error fetching itinerary:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await documentAPI.getDocuments(tripId);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchStays = async () => {
    try {
      const response = await staysAPI.getStays(tripId);
      setStays(response.data.stays || []);
    } catch (error) {
      console.error('Error fetching stays:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const [expensesResponse, summaryResponse] = await Promise.all([
        expensesAPI.getExpenses(tripId),
        expensesAPI.getExpensesSummary(tripId)
      ]);
      setExpenses(expensesResponse.data.expenses || []);
      setExpensesSummary(summaryResponse.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleUpdateTrip = async () => {
    try {
      await tripAPI.updateTrip(tripId, editedTrip);
      setTrip(prev => ({ ...prev, trip: editedTrip }));
      setIsEditingTrip(false);
    } catch (error) {
      setError('Failed to update trip');
      console.error('Error updating trip:', error);
    }
  };

  const handlePlaceSearch = async (query) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await placesAPI.searchPlaces(query);
      setSearchSuggestions(response.data.predictions || []);
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      await documentAPI.uploadDocument(tripId, formData);
      fetchDocuments();
    } catch (error) {
      setError('Failed to upload document');
      console.error('Error uploading document:', error);
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

  const tripData = trip.trip || {};

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
                      {expenses.map((expense) => (
                        <div key={expense.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{expense.description}</h4>
                            <p className="text-sm text-gray-600">{expense.category} • {formatDate(expense.date)}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{formatCurrency(expense.amount)}</div>
                            <div className="text-sm text-gray-600">{expense.currency || 'USD'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add similar sections for other tabs... */}
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
                      {documents.map((doc) => (
                        <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                              <p className="text-sm text-gray-600">{doc.size && `${(doc.size / 1024 / 1024).toFixed(2)} MB`}</p>
                            </div>
                            <button
                              onClick={() => documentAPI.downloadDocument(tripId, doc.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
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