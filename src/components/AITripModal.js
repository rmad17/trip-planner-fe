import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, MapPin, Calendar, Users, DollarSign, Loader, ChevronRight } from 'lucide-react';
import PlaceSearchInput from './PlaceSearchInput';
import { tripAPI } from '../services/api';

const AITripModal = ({ isOpen, onClose, onTripCreated }) => {
  const [step, setStep] = useState(1); // 1: Input, 2: Preview, 3: Loading
  const [formData, setFormData] = useState({
    source: '',
    sourcePlaceId: '',
    destinations: [''],
    destinationIds: [''],
    startDate: '',
    endDate: '',
    numTravelers: 1,
    budget: '',
    currency: 'USD',
    tripPreferences: [],
    pacePreference: 'moderate',
  });

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const preferenceOptions = [
    'Adventure', 'Culture', 'Food', 'Shopping', 'Nightlife',
    'Nature', 'Relaxation', 'History', 'Photography', 'Beach'
  ];

  const paceOptions = [
    { value: 'relaxed', label: 'Relaxed', desc: 'Take it easy, plenty of rest time' },
    { value: 'moderate', label: 'Moderate', desc: 'Balanced pace with variety' },
    { value: 'fast', label: 'Fast', desc: 'See as much as possible' }
  ];

  const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

  const handleAddDestination = () => {
    setFormData({
      ...formData,
      destinations: [...formData.destinations, ''],
      destinationIds: [...formData.destinationIds, '']
    });
  };

  const handleRemoveDestination = (index) => {
    const newDestinations = formData.destinations.filter((_, i) => i !== index);
    const newDestinationIds = formData.destinationIds.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      destinations: newDestinations,
      destinationIds: newDestinationIds
    });
  };

  const handleDestinationChange = (index, place) => {
    console.log('Destination selected:', place);
    const newDestinations = [...formData.destinations];
    const newDestinationIds = [...formData.destinationIds];
    const placeName = place.description || place.name || place.formatted_address || place.text || place;
    newDestinations[index] = placeName;
    newDestinationIds[index] = place.place_id || place.id || '';
    console.log('Updated destinations:', newDestinations, 'IDs:', newDestinationIds);
    setFormData({
      ...formData,
      destinations: newDestinations,
      destinationIds: newDestinationIds
    });
  };

  const togglePreference = (pref) => {
    const prefs = formData.tripPreferences.includes(pref)
      ? formData.tripPreferences.filter(p => p !== pref)
      : [...formData.tripPreferences, pref];
    setFormData({ ...formData, tripPreferences: prefs });
  };

  const handleGetSuggestions = async () => {
    if (!formData.source || formData.destinations[0] === '' || !formData.startDate || !formData.endDate) {
      setError('Please fill in source, at least one destination, and dates to get suggestions');
      return;
    }

    setLoadingSuggestions(true);
    setError('');

    try {
      const duration = Math.ceil(
        (new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)
      );
      const preferences = formData.tripPreferences.join(',');

      const response = await tripAPI.getMultiCitySuggestions(
        formData.source,
        formData.destinations[0],
        duration,
        preferences
      );

      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to get city suggestions. Please try again.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleGenerate = async () => {
    // Validate required fields
    if (!formData.source || formData.destinations.filter(d => d).length === 0) {
      setError('Please provide source and at least one destination');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Please provide travel dates');
      return;
    }

    setLoading(true);
    setError('');
    setStep(3);

    try {
      const requestData = {
        source: formData.source,
        source_place_id: formData.sourcePlaceId,
        destinations: formData.destinations.filter(d => d !== ''),
        destination_ids: formData.destinationIds.filter((d, i) => formData.destinations[i] !== ''),
        start_date: new Date(formData.startDate).toISOString(),
        end_date: new Date(formData.endDate).toISOString(),
        num_travelers: parseInt(formData.numTravelers),
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        currency: formData.currency,
        trip_preferences: formData.tripPreferences,
        pace_preference: formData.pacePreference,
      };

      console.log('Generating trip with data:', requestData);
      console.log('Form data state:', formData);

      const response = await tripAPI.generateTrip(requestData);
      setGeneratedPlan(response.data.trip_plan);
      setStep(2); // Move to preview
    } catch (err) {
      console.error('Error generating trip:', err);
      setError(err.response?.data?.error || 'Failed to generate trip. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await tripAPI.confirmAITrip(generatedPlan);
      onTripCreated(response.data.trip_id);
      onClose();
    } catch (err) {
      console.error('Error confirming trip:', err);
      setError('Failed to save trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setGeneratedPlan(null);
    setError('');
    setSuggestions([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-strong w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-accent">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">AI-Powered Trip Planner</h2>
          </div>
          <button onClick={handleClose} className="text-white hover:text-gray-200 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Input Form */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Starting From
                </label>
                <PlaceSearchInput
                  value={formData.source}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      source: value,
                      sourcePlaceId: '' // Clear place ID when typing
                    });
                  }}
                  onPlaceSelect={(place) => {
                    const placeName = place.description || place.name || place.formatted_address || place.text || '';
                    setFormData({
                      ...formData,
                      source: placeName,
                      sourcePlaceId: place.place_id || place.id || ''
                    });
                  }}
                  placeholder="Enter your starting location..."
                />
              </div>

              {/* Destinations */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Destinations
                  </label>
                  <button
                    onClick={handleAddDestination}
                    className="text-sm text-primary hover:text-accent flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add City
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.destinations.map((dest, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <PlaceSearchInput
                          value={dest}
                          onChange={(value) => {
                            const newDestinations = [...formData.destinations];
                            const newDestinationIds = [...formData.destinationIds];
                            newDestinations[index] = value;
                            newDestinationIds[index] = ''; // Clear place ID when typing
                            setFormData({
                              ...formData,
                              destinations: newDestinations,
                              destinationIds: newDestinationIds
                            });
                          }}
                          onPlaceSelect={(place) => handleDestinationChange(index, place)}
                          placeholder={`Destination ${index + 1}...`}
                        />
                      </div>
                      {formData.destinations.length > 1 && (
                        <button
                          onClick={() => handleRemoveDestination(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Multi-City Suggestions */}
                <div className="mt-4">
                  <button
                    onClick={handleGetSuggestions}
                    disabled={loadingSuggestions}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    {loadingSuggestions ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Getting suggestions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Get AI Suggestions for Multi-City Route
                      </>
                    )}
                  </button>

                  {suggestions.length > 0 && (
                    <div className="mt-3 p-4 bg-sage-50 border border-sage-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-sage-900 mb-2">Suggested Cities to Add:</h4>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            <ChevronRight className="h-3 w-3 inline text-sage-600" />
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Travelers and Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    Number of Travelers
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numTravelers}
                    onChange={(e) => setFormData({ ...formData, numTravelers: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Budget per Person (Optional)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="input-field w-24"
                    >
                      {currencyOptions.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="input-field flex-1"
                      placeholder="5000"
                    />
                  </div>
                </div>
              </div>

              {/* Trip Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Preferences (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {preferenceOptions.map(pref => (
                    <button
                      key={pref}
                      onClick={() => togglePreference(pref.toLowerCase())}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        formData.tripPreferences.includes(pref.toLowerCase())
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Pace
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {paceOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, pacePreference: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.pacePreference === option.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">{option.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && generatedPlan && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{generatedPlan.trip_name}</h3>
                <p className="text-gray-700">{generatedPlan.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{generatedPlan.total_days} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{generatedPlan.recommended_mode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>{formData.currency} {generatedPlan.estimated_budget.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Hops */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Trip Route ({generatedPlan.hops.length} stops)</h4>
                <div className="space-y-3">
                  {generatedPlan.hops.map((hop, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{hop.name}</div>
                          <div className="text-sm text-gray-600">{hop.city}, {hop.country}</div>
                          <div className="text-sm text-gray-500 mt-1">{hop.duration} days • {hop.transportation}</div>
                        </div>
                        <div className="text-sm font-medium text-primary">
                          {formData.currency} {hop.estimated_budget.toFixed(2)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{hop.description}</p>
                      {hop.pois && hop.pois.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Top sights:</strong> {hop.pois.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Breakdown */}
              {generatedPlan.budget_breakdown && (
                <div>
                  <h4 className="font-semibold text-lg mb-3">Budget Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(generatedPlan.budget_breakdown).map(([category, amount]) => (
                      <div key={category} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 capitalize">{category}</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formData.currency} {amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Tips */}
              {generatedPlan.travel_tips && generatedPlan.travel_tips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg mb-3">Travel Tips</h4>
                  <ul className="space-y-2">
                    {generatedPlan.travel_tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-gray-700">
                        <ChevronRight className="h-4 w-4 text-sage-600 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Loading */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="h-16 w-16 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Perfect Trip...</h3>
              <p className="text-gray-600 text-center max-w-md">
                Claude is analyzing the best routes, finding amazing places to visit, and crafting a personalized itinerary just for you.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            {step === 1 && (
              <>
                <button onClick={handleClose} className="btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Trip with AI
                    </>
                  )}
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} className="btn-secondary">
                  Back to Edit
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Confirm & Save Trip'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITripModal;
