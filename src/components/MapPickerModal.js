import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { X, MapPin, Loader2 } from 'lucide-react';
import { reverseGeocode } from '../services/geocodingService';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

/**
 * MapPickerModal - Interactive map for selecting locations
 * Provider-agnostic design supporting Mapbox (current) and Google Maps (future)
 *
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {function} onLocationSelect - Callback when location is selected
 * @param {object} initialCenter - Initial map center { lng, lat }
 * @param {string} provider - Map provider ('mapbox' or 'google')
 */
const MapPickerModal = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialCenter = { lng: 0, lat: 20 },
  provider = 'mapbox'
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapContainer.current) return;

    // Only initialize if map doesn't exist
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [initialCenter.lng, initialCenter.lat],
        zoom: 2
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle map clicks
      map.current.on('click', async (e) => {
        const { lng, lat } = e.lngLat;

        // Add or update marker
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        } else {
          marker.current = new mapboxgl.Marker({ color: '#4f46e5', draggable: true })
            .setLngLat([lng, lat])
            .addTo(map.current);

          // Handle marker drag
          marker.current.on('dragend', async () => {
            const lngLat = marker.current.getLngLat();
            await handleLocationSelect(lngLat.lng, lngLat.lat);
          });
        }

        // Reverse geocode the location
        await handleLocationSelect(lng, lat);
      });
    }

    return () => {
      // Cleanup on unmount
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, [isOpen]);

  // Handle location selection with reverse geocoding
  const handleLocationSelect = async (lng, lat) => {
    setIsGeocoding(true);
    setError(null);

    try {
      const placeData = await reverseGeocode(lng, lat, provider);
      setSelectedLocation(placeData);
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Unable to find address for this location');
      setSelectedLocation({
        description: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        name: 'Unknown location',
        formatted_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { lng, lat }
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation);
      handleClose();
    }
  };

  // Close modal
  const handleClose = () => {
    setSelectedLocation(null);
    setError(null);
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Select Location on Map
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative" style={{ minHeight: '500px' }}>
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Instructions Overlay */}
            <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-10">
              <p className="text-sm text-gray-700">
                Click anywhere on the map to select a location
              </p>
            </div>

            {/* Loading Indicator */}
            {isGeocoding && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-4 rounded-lg shadow-lg z-10 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="text-sm text-gray-700">Finding address...</span>
              </div>
            )}
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              {error && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{error}</p>
                </div>
              )}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Selected Location
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {selectedLocation.formatted_address || selectedLocation.description}
                </p>
                {selectedLocation.coordinates && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          )}

          {/* No Selection State */}
          {!selectedLocation && !isGeocoding && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500 text-center">
                No location selected. Click on the map to choose a location.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
