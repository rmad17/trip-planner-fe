import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Map, Check, Lock } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { CURRENCIES } from '../utils/currency';

const Config = () => {
  const navigate = useNavigate();
  const { currency, updateCurrency, mapProvider, MAP_PROVIDERS: PROVIDERS } = useSettings();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCurrencyChange = (currencyCode) => {
    updateCurrency(currencyCode);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
              <p className="text-sm text-gray-500">Manage your preferences and settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">Settings saved successfully!</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Currency Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Currency</h2>
                  <p className="text-sm text-gray-500">Select your preferred currency for expenses and budgets</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr.code)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      currency === curr.code
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{curr.symbol}</span>
                          <span className="font-semibold text-gray-900">{curr.code}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{curr.name}</p>
                      </div>
                      {currency === curr.code && (
                        <Check className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map Provider Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Map className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Map Provider</h2>
                  <p className="text-sm text-gray-500">Choose your preferred map service for location search</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {/* Mapbox - Currently locked as default */}
                <div className="relative">
                  <div
                    className={`p-5 rounded-lg border-2 transition-all ${
                      mapProvider === PROVIDERS.MAPBOX
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200'
                    } blur-[1px] pointer-events-none`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                          <Map className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            Mapbox
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            High-quality maps with precise location search and geocoding
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              Address Search
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              POI Search
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              Geocoding
                            </span>
                          </div>
                        </div>
                      </div>
                      {mapProvider === PROVIDERS.MAPBOX && (
                        <Check className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Lock indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white px-4 py-2 rounded-full shadow-lg border-2 border-gray-200 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Currently Locked</span>
                    </div>
                  </div>
                </div>

                {/* Google Maps - Disabled */}
                <button
                  disabled
                  className="w-full p-5 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                        <Map className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          Google Maps
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Comprehensive mapping service with extensive POI database
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Address Search
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            POI Search
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Street View
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Info Note */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Map provider selection will be enabled in a future update. Currently, all trips use Mapbox for optimal performance and reliability.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">About Configuration</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              These settings apply globally across all your trips. Your currency preference will be used for displaying budgets and expenses. Map provider settings will allow you to choose between different mapping services for location search and geocoding in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;
