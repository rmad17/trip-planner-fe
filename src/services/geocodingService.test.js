/**
 * Tests for geocodingService
 */

import {
  reverseGeocodeMapbox,
  reverseGeocodeGoogle,
  reverseGeocode,
  getMapProvider
} from './geocodingService';

// Mock fetch
global.fetch = jest.fn();

// Store original env
const originalEnv = process.env.REACT_APP_MAPBOX_TOKEN;

describe('geocodingService', () => {
  beforeAll(() => {
    // Set up environment variable for all tests
    process.env.REACT_APP_MAPBOX_TOKEN = 'test_token';
  });

  afterAll(() => {
    // Restore original env
    process.env.REACT_APP_MAPBOX_TOKEN = originalEnv;
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('reverseGeocodeMapbox', () => {
    it('should successfully reverse geocode coordinates', async () => {
      const mockResponse = {
        features: [
          {
            id: 'place.123',
            place_name: 'Paris, France',
            text: 'Paris',
            geometry: {
              type: 'Point',
              coordinates: [2.3522, 48.8566]
            },
            properties: {
              name: 'Paris'
            }
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await reverseGeocodeMapbox(2.3522, 48.8566);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('geocoding/v5/mapbox.places/2.3522,48.8566.json')
      );
      expect(result).toEqual({
        description: 'Paris, France',
        name: 'Paris',
        formatted_address: 'Paris, France',
        place_id: 'place.123',
        id: 'place.123',
        geometry: mockResponse.features[0].geometry,
        properties: mockResponse.features[0].properties,
        coordinates: {
          lng: 2.3522,
          lat: 48.8566
        }
      });
    });

    it('should throw error when no results found', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ features: [] })
      });

      await expect(reverseGeocodeMapbox(0, 0)).rejects.toThrow('No results found');
    });

    it('should handle fetch errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(reverseGeocodeMapbox(0, 0)).rejects.toThrow('Network error');
    });

    it('should use correct API endpoint with token', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({
          features: [
            {
              id: 'test',
              place_name: 'Test',
              text: 'Test',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {}
            }
          ]
        })
      });

      await reverseGeocodeMapbox(2.3522, 48.8566);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.mapbox.com/geocoding/v5/mapbox.places/2.3522,48.8566.json?access_token=')
      );
    });
  });

  describe('reverseGeocodeGoogle', () => {
    it('should throw not implemented error', async () => {
      await expect(reverseGeocodeGoogle(0, 0)).rejects.toThrow(
        'Google Maps provider not yet implemented'
      );
    });
  });

  describe('reverseGeocode', () => {
    it('should use Mapbox provider when specified', async () => {
      const mockResponse = {
        features: [
          {
            id: 'place.123',
            place_name: 'Tokyo, Japan',
            text: 'Tokyo',
            geometry: { type: 'Point', coordinates: [139.6917, 35.6895] },
            properties: {}
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await reverseGeocode(139.6917, 35.6895, 'mapbox');

      expect(result.formatted_address).toBe('Tokyo, Japan');
    });

    it('should default to Mapbox when no provider specified', async () => {
      const mockResponse = {
        features: [
          {
            id: 'place.123',
            place_name: 'Test',
            text: 'Test',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {}
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      });

      await reverseGeocode(0, 0);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('mapbox.com')
      );
    });

    it('should throw error for unknown provider', async () => {
      await expect(reverseGeocode(0, 0, 'unknown')).rejects.toThrow(
        'Unknown provider: unknown'
      );
    });

    it('should attempt Google provider', async () => {
      await expect(reverseGeocode(0, 0, 'google')).rejects.toThrow(
        'Google Maps provider not yet implemented'
      );
    });
  });

  describe('getMapProvider', () => {
    it('should return mapbox as default provider', () => {
      expect(getMapProvider()).toBe('mapbox');
    });

    it('should return mapbox when trip is null', () => {
      expect(getMapProvider(null)).toBe('mapbox');
    });

    it('should return mapbox when trip has no mapProvider property', () => {
      const trip = { id: 1, name: 'Test Trip' };
      expect(getMapProvider(trip)).toBe('mapbox');
    });

    // Future test case when trip-level provider is implemented
    it.skip('should return trip-specific provider when available', () => {
      const trip = { id: 1, name: 'Test Trip', mapProvider: 'google' };
      expect(getMapProvider(trip)).toBe('google');
    });
  });
});
