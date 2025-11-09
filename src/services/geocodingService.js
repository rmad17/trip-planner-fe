/**
 * Provider-agnostic geocoding service
 * Supports Mapbox (current) and Google Maps (future)
 */

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
// eslint-disable-next-line no-unused-vars
const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY; // For future use

/**
 * Reverse geocode coordinates to address using Mapbox
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {Promise<Object>} Place data
 */
export const reverseGeocodeMapbox = async (lng, lat) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];

      return {
        description: feature.place_name || '',
        name: feature.text || feature.place_name || '',
        formatted_address: feature.place_name || '',
        place_id: feature.id || '',
        id: feature.id || '',
        geometry: feature.geometry,
        properties: feature.properties,
        coordinates: {
          lng,
          lat
        }
      };
    }

    throw new Error('No results found');
  } catch (error) {
    console.error('Mapbox reverse geocoding error:', error);
    throw error;
  }
};

/**
 * Reverse geocode coordinates to address using Google Maps
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {Promise<Object>} Place data
 */
export const reverseGeocodeGoogle = async (lng, lat) => {
  // Future implementation for Google Maps
  // This will be implemented when Google Maps support is added
  throw new Error('Google Maps provider not yet implemented');
};

/**
 * Reverse geocode with automatic provider selection
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {string} provider - 'mapbox' or 'google'
 * @returns {Promise<Object>} Place data
 */
export const reverseGeocode = async (lng, lat, provider = 'mapbox') => {
  switch (provider) {
    case 'mapbox':
      return reverseGeocodeMapbox(lng, lat);
    case 'google':
      return reverseGeocodeGoogle(lng, lat);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};

/**
 * Get the appropriate map provider based on trip settings
 * For now, always returns 'mapbox'
 * Future: will check trip.mapProvider or user preferences
 * @param {Object} trip - Trip object (optional)
 * @returns {string} Provider name
 */
export const getMapProvider = (trip = null) => {
  // Future implementation will check:
  // - trip?.mapProvider
  // - user preferences
  // - default system settings
  return 'mapbox';
};
