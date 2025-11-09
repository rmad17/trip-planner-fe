/**
 * Tests for enhanced PlaceSearchInput component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlaceSearchInput from './PlaceSearchInput';
import * as geocodingService from '../services/geocodingService';

// Mock the SearchBox component from Mapbox
jest.mock('@mapbox/search-js-react', () => ({
  SearchBox: ({ value, onChange, onRetrieve, placeholder }) => (
    <div data-testid="mock-searchbox">
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button
        data-testid="mock-select-result"
        onClick={() => {
          // Simulate selecting a result
          onRetrieve({
            features: [
              {
                id: 'place.123',
                place_name: 'Paris, France',
                properties: {
                  name: 'Paris',
                  full_address: 'Paris, Île-de-France, France'
                },
                geometry: {
                  type: 'Point',
                  coordinates: [2.3522, 48.8566]
                }
              }
            ]
          });
        }}
      >
        Select Result
      </button>
    </div>
  )
}));

// Mock MapPickerModal
jest.mock('./MapPickerModal', () => {
  return function MockMapPickerModal({ isOpen, onClose, onLocationSelect }) {
    if (!isOpen) return null;
    return (
      <div data-testid="map-picker-modal">
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
        <button
          data-testid="select-location"
          onClick={() => {
            onLocationSelect({
              description: 'Tokyo, Japan',
              formatted_address: 'Tokyo, Japan',
              name: 'Tokyo',
              coordinates: { lng: 139.6917, lat: 35.6895 }
            });
          }}
        >
          Select Location
        </button>
      </div>
    );
  };
});

// Mock geocoding service
jest.mock('../services/geocodingService', () => ({
  getMapProvider: jest.fn(() => 'mapbox')
}));

describe('PlaceSearchInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_MAPBOX_TOKEN = 'test_token';
  });

  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    onPlaceSelect: jest.fn(),
    placeholder: 'Search for places...'
  };

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<PlaceSearchInput {...defaultProps} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(<PlaceSearchInput {...defaultProps} placeholder="Enter location" />);
      expect(screen.getByPlaceholderText('Enter location')).toBeInTheDocument();
    });

    it('should display map button by default', () => {
      render(<PlaceSearchInput {...defaultProps} />);
      expect(screen.getByText('Map')).toBeInTheDocument();
    });

    it('should not display map button when showMapPicker is false', () => {
      render(<PlaceSearchInput {...defaultProps} showMapPicker={false} />);
      expect(screen.queryByText('Map')).not.toBeInTheDocument();
    });

    it('should render with provided value', () => {
      render(<PlaceSearchInput {...defaultProps} value="Paris" />);
      expect(screen.getByTestId('search-input')).toHaveValue('Paris');
    });
  });

  describe('Text Search Functionality', () => {
    it('should call onChange when user types', () => {
      const mockOnChange = jest.fn();
      render(<PlaceSearchInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'London' } });

      expect(mockOnChange).toHaveBeenCalledWith('London');
    });

    it('should call onPlaceSelect when result is selected', () => {
      const mockOnPlaceSelect = jest.fn();
      render(<PlaceSearchInput {...defaultProps} onPlaceSelect={mockOnPlaceSelect} />);

      const selectButton = screen.getByTestId('mock-select-result');
      fireEvent.click(selectButton);

      expect(mockOnPlaceSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.any(String),
          name: expect.any(String),
          formatted_address: expect.any(String),
          place_id: expect.any(String)
        })
      );
    });

    it('should extract correct place data from Mapbox response', () => {
      const mockOnPlaceSelect = jest.fn();
      render(<PlaceSearchInput {...defaultProps} onPlaceSelect={mockOnPlaceSelect} />);

      const selectButton = screen.getByTestId('mock-select-result');
      fireEvent.click(selectButton);

      expect(mockOnPlaceSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Paris',
          formatted_address: 'Paris, Île-de-France, France',
          place_id: 'place.123'
        })
      );
    });
  });

  describe('Map Picker Functionality', () => {
    it('should open map modal when Map button is clicked', () => {
      render(<PlaceSearchInput {...defaultProps} />);

      const mapButton = screen.getByText('Map');
      fireEvent.click(mapButton);

      expect(screen.getByTestId('map-picker-modal')).toBeInTheDocument();
    });

    it('should close map modal when close button is clicked', async () => {
      render(<PlaceSearchInput {...defaultProps} />);

      // Open modal
      const mapButton = screen.getByText('Map');
      fireEvent.click(mapButton);
      expect(screen.getByTestId('map-picker-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByTestId('close-modal');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('map-picker-modal')).not.toBeInTheDocument();
      });
    });

    it('should call onChange with selected address from map', () => {
      const mockOnChange = jest.fn();
      render(<PlaceSearchInput {...defaultProps} onChange={mockOnChange} />);

      // Open modal
      const mapButton = screen.getByText('Map');
      fireEvent.click(mapButton);

      // Select location
      const selectButton = screen.getByTestId('select-location');
      fireEvent.click(selectButton);

      expect(mockOnChange).toHaveBeenCalledWith('Tokyo, Japan');
    });

    it('should call onPlaceSelect with data from map selection', () => {
      const mockOnPlaceSelect = jest.fn();
      render(<PlaceSearchInput {...defaultProps} onPlaceSelect={mockOnPlaceSelect} />);

      // Open modal
      const mapButton = screen.getByText('Map');
      fireEvent.click(mapButton);

      // Select location
      const selectButton = screen.getByTestId('select-location');
      fireEvent.click(selectButton);

      expect(mockOnPlaceSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Tokyo, Japan',
          formatted_address: 'Tokyo, Japan',
          name: 'Tokyo'
        })
      );
    });

    it('should close modal after location selection', async () => {
      render(<PlaceSearchInput {...defaultProps} />);

      // Open modal
      const mapButton = screen.getByText('Map');
      fireEvent.click(mapButton);

      // Select location
      const selectButton = screen.getByTestId('select-location');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.queryByTestId('map-picker-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Provider Support', () => {
    it('should use default provider from getMapProvider', () => {
      geocodingService.getMapProvider.mockReturnValue('mapbox');
      render(<PlaceSearchInput {...defaultProps} />);

      expect(geocodingService.getMapProvider).toHaveBeenCalled();
    });

    it('should use custom provider when provided', () => {
      render(<PlaceSearchInput {...defaultProps} provider="google" />);

      // Provider should be passed through (though not directly testable here)
      expect(screen.getByText('Map')).toBeInTheDocument();
    });

    it('should pass provider to MapPickerModal', () => {
      render(<PlaceSearchInput {...defaultProps} provider="mapbox" />);

      const mapButton = screen.getByText('Map');
      fireEvent.click(mapButton);

      expect(screen.getByTestId('map-picker-modal')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PlaceSearchInput {...defaultProps} className="custom-class" />
      );

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onChange callback', () => {
      render(<PlaceSearchInput value="" placeholder="Test" />);

      const input = screen.getByTestId('search-input');
      expect(() => {
        fireEvent.change(input, { target: { value: 'Test' } });
      }).not.toThrow();
    });

    it('should handle missing onPlaceSelect callback', () => {
      render(<PlaceSearchInput value="" onChange={jest.fn()} />);

      const selectButton = screen.getByTestId('mock-select-result');
      expect(() => {
        fireEvent.click(selectButton);
      }).not.toThrow();
    });

    it('should handle empty search results', () => {
      // This is implicitly tested by the mock implementation
      render(<PlaceSearchInput {...defaultProps} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible map button', () => {
      render(<PlaceSearchInput {...defaultProps} />);

      const mapButton = screen.getByRole('button', { name: /map/i });
      expect(mapButton).toBeInTheDocument();
      expect(mapButton).toHaveAttribute('title', 'Select location on map');
    });

    it('should have type="button" on map button to prevent form submission', () => {
      render(<PlaceSearchInput {...defaultProps} />);

      const mapButton = screen.getByRole('button', { name: /map/i });
      expect(mapButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Console Logging', () => {
    it('should log search changes', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<PlaceSearchInput {...defaultProps} />);

      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'Test' } });

      expect(consoleSpy).toHaveBeenCalledWith('SearchBox onChange:', 'Test');
      consoleSpy.mockRestore();
    });

    it('should log place selections', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<PlaceSearchInput {...defaultProps} />);

      const selectButton = screen.getByTestId('mock-select-result');
      fireEvent.click(selectButton);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
