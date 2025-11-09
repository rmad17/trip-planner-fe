import React, { useState } from 'react';
import { SearchBox } from '@mapbox/search-js-react';
import { Map } from 'lucide-react';
import MapPickerModal from './MapPickerModal';
import { getMapProvider } from '../services/geocodingService';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const PlaceSearchInput = ({
  value = '',
  onChange,
  placeholder = "Search for places...",
  className = "",
  onPlaceSelect,
  showMapPicker = true,
  provider = null, // Can be overridden for specific trips
  initialMapCenter = null // Initial center for the map picker
}) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const mapProvider = provider || getMapProvider();

  const handleRetrieve = (result) => {
    console.log('Mapbox SearchBox onRetrieve:', result);

    // Get the first feature from the results
    const feature = result.features?.[0];

    if (feature) {
      console.log('Selected feature:', feature);

      // Extract place information from the feature
      const placeData = {
        description: feature.properties?.name || feature.properties?.full_address || feature.place_name || '',
        name: feature.properties?.name || feature.properties?.full_address || feature.place_name || '',
        formatted_address: feature.properties?.full_address || feature.place_name || '',
        place_id: feature.id || feature.properties?.mapbox_id || '',
        id: feature.id || feature.properties?.mapbox_id || '',
        geometry: feature.geometry,
        properties: feature.properties
      };

      console.log('Parsed place data:', placeData);

      // Call the onPlaceSelect callback with the place data
      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }
    }
  };

  const handleChange = (value) => {
    console.log('SearchBox onChange:', value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleMapSelection = (placeData) => {
    console.log('Map selection:', placeData);

    // Update the search input with the selected name (not address)
    if (onChange) {
      onChange(placeData.name || placeData.description);
    }

    // Call the onPlaceSelect callback
    if (onPlaceSelect) {
      onPlaceSelect(placeData);
    }

    setIsMapModalOpen(false);
  };

  return (
    <>
      <div className={`relative mapbox-search-wrapper ${className}`}>
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBox
              accessToken={MAPBOX_ACCESS_TOKEN}
              value={value}
              onChange={handleChange}
              onRetrieve={handleRetrieve}
              placeholder={placeholder}
              options={{
                language: 'en',
                limit: 5,
                types: 'place,locality,neighborhood,address,poi'
              }}
              theme={{
                variables: {
                  fontFamily: 'inherit',
                  unit: '16px',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  colorText: '#111827',
                  colorPrimary: '#4f46e5',
                  colorSecondary: '#6b7280',
                  colorBackground: '#ffffff',
                  colorBackgroundHover: '#f9fafb'
                }
              }}
            />
          </div>

          {showMapPicker && (
            <button
              type="button"
              onClick={() => setIsMapModalOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
              title="Select location on map"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Map</span>
            </button>
          )}
        </div>
      </div>

      {showMapPicker && (
        <MapPickerModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          onLocationSelect={handleMapSelection}
          provider={mapProvider}
          initialCenter={initialMapCenter || { lng: 0, lat: 20 }}
        />
      )}
    </>
  );
};

export default PlaceSearchInput;
