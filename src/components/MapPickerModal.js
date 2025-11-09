import React, { useEffect, useRef, useState, useCallback } from 'react';
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
 * @param {boolean} viewOnly - If true, shows map without modal wrapper and selection features
 * @param {array} locations - Array of locations to display as pins in viewOnly mode
 */
const MapPickerModal = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialCenter = { lng: 0, lat: 20 },
  provider = 'mapbox',
  viewOnly = false,
  locations = [],
  focusLocation = null
}) => {
  const mapContainer = useRef(null);
  const minimapContainer = useRef(null);
  const map = useRef(null);
  const minimap = useRef(null);
  const marker = useRef(null);
  const markers = useRef([]); // For viewOnly mode with multiple locations
  const handleLocationSelectRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);

  // Handle location selection with reverse geocoding
  const handleLocationSelect = useCallback(async (lng, lat) => {
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
  }, [provider]);

  // Keep ref updated with latest callback
  handleLocationSelectRef.current = handleLocationSelect;

  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapContainer.current) {
      console.log('Map init skipped:', { isOpen, hasContainer: !!mapContainer.current });
      return;
    }

    // Prevent duplicate initialization - if map already exists and is for the same container, skip
    if (map.current && map.current.getContainer() === mapContainer.current) {
      console.log('Map already initialized for this container, skipping...');
      return;
    }

    console.log('Initializing map...');

    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
      setMapError('Mapbox token is not configured. Please add REACT_APP_MAPBOX_TOKEN to your .env file.');
      setMapLoading(false);
      return;
    }

    // Reset states
    setMapLoading(true);
    setMapError(null);

    // Clean up existing map if it exists
    if (map.current) {
      console.log('Removing existing map...');
      map.current.remove();
      map.current = null;
      marker.current = null;
    }

    try {
      console.log('Creating Mapbox map instance...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [initialCenter.lng, initialCenter.lat],
        zoom: viewOnly ? 2 : 4
      });

      console.log('Map instance created, waiting for load...');

      // Handle map load event
      map.current.on('load', () => {
        console.log('Map loaded successfully!');
        setMapLoading(false);
        // Resize map to ensure it fits the container properly
        if (map.current) {
          setTimeout(() => {
            if (map.current) {
              console.log('Resizing map...');
              map.current.resize();
            }
          }, 100);
        }
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map. Please check your internet connection and Mapbox token.');
        setMapLoading(false);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle map clicks for location selection (only when not in viewOnly mode)
      if (!viewOnly) {
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
              if (handleLocationSelectRef.current) {
                await handleLocationSelectRef.current(lngLat.lng, lngLat.lat);
              }
            });
          }

          // Reverse geocode the location
          if (handleLocationSelectRef.current) {
            await handleLocationSelectRef.current(lng, lat);
          }
        });
      }

      // Initialize minimap (only in viewOnly mode)
      if (viewOnly && minimapContainer.current) {
        minimap.current = new mapboxgl.Map({
          container: minimapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [initialCenter.lng, initialCenter.lat],
          zoom: 0,
          interactive: false,
          attributionControl: false
        });

        // Sync minimap with main map movements
        const syncMinimap = () => {
          if (minimap.current && map.current) {
            minimap.current.setCenter(map.current.getCenter());
            // Keep minimap zoomed out relative to main map
            const mainZoom = map.current.getZoom();
            minimap.current.setZoom(Math.max(0, mainZoom - 3));
          }
        };

        map.current.on('move', syncMinimap);
        map.current.on('zoom', syncMinimap);

        // Add a box showing the main map viewport on the minimap
        minimap.current.on('load', () => {
          minimap.current.addSource('viewport', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[]]
              }
            }
          });

          minimap.current.addLayer({
            id: 'viewport',
            type: 'fill',
            source: 'viewport',
            paint: {
              'fill-color': '#4f46e5',
              'fill-opacity': 0.1
            }
          });

          minimap.current.addLayer({
            id: 'viewport-outline',
            type: 'line',
            source: 'viewport',
            paint: {
              'line-color': '#4f46e5',
              'line-width': 2
            }
          });
        });

        // Update viewport box on main map move
        const updateViewportBox = () => {
          if (!minimap.current || !map.current) return;

          const bounds = map.current.getBounds();
          const coords = [
            [bounds.getWest(), bounds.getNorth()],
            [bounds.getEast(), bounds.getNorth()],
            [bounds.getEast(), bounds.getSouth()],
            [bounds.getWest(), bounds.getSouth()],
            [bounds.getWest(), bounds.getNorth()]
          ];

          if (minimap.current.getSource('viewport')) {
            minimap.current.getSource('viewport').setData({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [coords]
              }
            });
          }
        };

        map.current.on('move', updateViewportBox);
        map.current.on('zoom', updateViewportBox);
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setMapError('Failed to initialize map. Please try again.');
      setMapLoading(false);
    }

    // Cleanup when modal closes
    return () => {
      // Clean up all markers
      markers.current.forEach(m => m.remove());
      markers.current = [];

      if (minimap.current) {
        minimap.current.remove();
        minimap.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialCenter.lng, initialCenter.lat, viewOnly]);

  // Update markers when locations change (viewOnly mode)
  useEffect(() => {
    if (!viewOnly || !map.current || mapLoading) return;

    // Wait for map to be fully loaded
    const updateMarkers = () => {
      // Clear existing markers
      markers.current.forEach(m => m.remove());
      markers.current = [];

      // Add markers for each location
      locations.forEach((location) => {
        if (location.latitude && location.longitude) {
          const newMarker = new mapboxgl.Marker({ color: '#4f46e5' })
            .setLngLat([location.longitude, location.latitude])
            .addTo(map.current);

          // Add popup with location info
          if (location.name || location.city) {
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 4px;">
                  <strong>${location.name || location.city || 'Location'}</strong>
                  ${location.city && location.name ? `<br/>${location.city}` : ''}
                  ${location.country ? `<br/>${location.country}` : ''}
                </div>
              `);
            newMarker.setPopup(popup);
          }

          markers.current.push(newMarker);
        }
      });
    };

    // If map is already loaded, update immediately
    if (map.current.loaded()) {
      updateMarkers();
    } else {
      // Otherwise wait for load event
      map.current.once('load', updateMarkers);
    }
  }, [viewOnly, locations, mapLoading]);

  // Initial zoom when map first loads (viewOnly mode)
  useEffect(() => {
    if (!viewOnly || !map.current || mapLoading || locations.length === 0) return;

    const performInitialZoom = () => {
      const validLocations = locations.filter(loc => loc.latitude && loc.longitude);
      if (validLocations.length === 0) return;

      // Calculate distance between locations (Haversine formula)
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      // Check if locations are far apart (> 1000km) or if there are more than 3
      let showAllLocations = true;
      if (validLocations.length > 3) {
        showAllLocations = false;
      } else if (validLocations.length > 1) {
        // Calculate max distance between any two locations
        let maxDistance = 0;
        for (let i = 0; i < validLocations.length; i++) {
          for (let j = i + 1; j < validLocations.length; j++) {
            const distance = calculateDistance(
              validLocations[i].latitude,
              validLocations[i].longitude,
              validLocations[j].latitude,
              validLocations[j].longitude
            );
            maxDistance = Math.max(maxDistance, distance);
          }
        }
        if (maxDistance > 1000) {
          showAllLocations = false;
        }
      }

      if (showAllLocations && validLocations.length > 1) {
        // Show all locations
        const bounds = new mapboxgl.LngLatBounds();
        validLocations.forEach(location => {
          bounds.extend([location.longitude, location.latitude]);
        });
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, { padding: 80, maxZoom: 10 });
        }
      } else if (validLocations.length > 0) {
        // Show only the first location
        const firstLoc = validLocations[0];
        map.current.flyTo({
          center: [firstLoc.longitude, firstLoc.latitude],
          zoom: 10,
          essential: true
        });
      }
    };

    // Only perform initial zoom once when map first loads
    if (map.current.loaded()) {
      performInitialZoom();
    } else {
      map.current.once('load', performInitialZoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewOnly, mapLoading]); // Only run when map finishes loading, not when locations change

  // Handle focus location changes (when user clicks on a destination)
  useEffect(() => {
    if (!focusLocation || !map.current) return;

    // Only proceed if we have valid coordinates
    if (!focusLocation.latitude || !focusLocation.longitude) return;

    const focusOnLocation = () => {
      if (map.current && map.current.loaded()) {
        map.current.flyTo({
          center: [focusLocation.longitude, focusLocation.latitude],
          zoom: 12,
          essential: true,
          duration: 1000
        });
      }
    };

    // If map is loaded, focus immediately
    if (map.current.loaded()) {
      focusOnLocation();
    } else {
      // Otherwise wait for map to load
      map.current.once('load', focusOnLocation);
    }
  }, [focusLocation]);

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

  // ViewOnly mode - render just the map without modal wrapper
  if (viewOnly) {
    return (
      <div className="relative w-full h-full">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Minimap */}
        <div
          ref={minimapContainer}
          className="absolute bottom-4 right-4 w-48 h-32 rounded-lg shadow-lg border-2 border-white overflow-hidden z-10"
          style={{ pointerEvents: 'none' }}
        />

        {/* Map Loading Indicator */}
        {mapLoading && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-700">Loading map...</p>
            </div>
          </div>
        )}

        {/* Map Error */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center max-w-md px-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Load Error</h3>
              <p className="text-sm text-gray-600">{mapError}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Modal mode - original behavior for location selection
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl" style={{ height: '90vh', maxHeight: '90vh' }}>
          <div className="flex flex-col h-full">
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
          <div className="flex-1 relative" style={{ minHeight: '500px', width: '100%' }}>
            <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

            {/* Map Loading Indicator */}
            {mapLoading && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-700">Loading map...</p>
                </div>
              </div>
            )}

            {/* Map Error */}
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-center max-w-md px-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Load Error</h3>
                  <p className="text-sm text-gray-600 mb-4">{mapError}</p>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Instructions Overlay */}
            {!mapLoading && !mapError && (
              <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-10">
                <p className="text-sm text-gray-700">
                  Click anywhere on the map to select a location
                </p>
              </div>
            )}

            {/* Geocoding Loading Indicator */}
            {isGeocoding && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-4 rounded-lg shadow-lg z-20 flex items-center gap-3">
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
    </div>
  );
};

export default MapPickerModal;
