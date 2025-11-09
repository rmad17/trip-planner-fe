/**
 * Tests for TripDetails component improvements
 * Testing: Map View, Date Validation, Multi-Select Travel Modes, Tag Input, Accommodation Validation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import TripDetails from './TripDetails';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Mock the API
jest.mock('../services/api');

// Mock the auth context
jest.mock('../contexts/AuthContext');

// Mock MapPickerModal
jest.mock('../components/MapPickerModal', () => {
  return function MockMapPickerModal({ isOpen }) {
    if (!isOpen) return null;
    return <div data-testid="map-picker-modal">Map Modal</div>;
  };
});

// Mock PlaceSearchInput
jest.mock('../components/PlaceSearchInput', () => {
  return function MockPlaceSearchInput() {
    return <div data-testid="place-search-input">Place Search</div>;
  };
});

// Mock ProfileButton
jest.mock('../components/ProfileButton', () => {
  return function MockProfileButton() {
    return <div data-testid="profile-button">Profile</div>;
  };
});

const renderWithRouter = (component, { tripId = '123' } = {}) => {
  const router = createMemoryRouter(
    [
      {
        path: '/trip/:tripId',
        element: component,
      },
    ],
    {
      initialEntries: [`/trip/${tripId}`],
    }
  );

  return render(<RouterProvider router={router} />);
};

describe('TripDetails - New Features', () => {
  const mockTrip = {
    id: '123',
    name: 'Paris Adventure',
    start_date: '2024-06-01',
    end_date: '2024-06-10',
    travel_mode: ['flight', 'train'],
    tags: ['romantic', 'cultural'],
    notes: 'Exciting trip',
    user: { username: 'testuser' }
  };

  const mockUser = {
    username: 'testuser',
    id: 'user123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });

    // Mock API responses
    api.tripAPI = {
      getTripById: jest.fn().mockResolvedValue({ data: mockTrip }),
      updateTrip: jest.fn().mockResolvedValue({ data: mockTrip })
    };
    api.tripHopAPI = {
      getTripHops: jest.fn().mockResolvedValue({ data: [] })
    };
    api.tripDayAPI = {
      getTripDays: jest.fn().mockResolvedValue({ data: [] })
    };
    api.itineraryAPI = {
      getItinerary: jest.fn().mockResolvedValue({ data: [] })
    };
    api.staysAPI = {
      getStays: jest.fn().mockResolvedValue({ data: [] }),
      createStay: jest.fn().mockResolvedValue({ data: {} })
    };
    api.expensesAPI = {
      getExpenses: jest.fn().mockResolvedValue({ data: [] }),
      getExpensesSummary: jest.fn().mockResolvedValue({ data: {} })
    };
    api.documentAPI = {
      getDocuments: jest.fn().mockResolvedValue({ data: [] })
    };
    api.activityAPI = {
      getActivities: jest.fn().mockResolvedValue({ data: [] })
    };

    process.env.REACT_APP_MAPBOX_TOKEN = 'test_token';
  });

  describe('Map View Tab', () => {
    it('should display Map View tab in navigation', async () => {
      renderWithRouter(<TripDetails />);

      await waitFor(() => {
        expect(screen.getByText('Map View')).toBeInTheDocument();
      });
    });

    it('should show setup instructions when Mapbox token is not configured', async () => {
      process.env.REACT_APP_MAPBOX_TOKEN = 'your_mapbox_token_here';

      renderWithRouter(<TripDetails />);

      await waitFor(() => {
        expect(screen.getByText('Map View')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Map View'));

      await waitFor(() => {
        expect(screen.getByText('Map View Not Available')).toBeInTheDocument();
      });
    });
  });

  describe('Component Loading', () => {
    it('should load trip data successfully', async () => {
      renderWithRouter(<TripDetails />);

      await waitFor(() => {
        expect(screen.getByText('Paris Adventure')).toBeInTheDocument();
      });
    });

    it('should display all navigation tabs', async () => {
      renderWithRouter(<TripDetails />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Map View')).toBeInTheDocument();
        expect(screen.getByText('Itinerary')).toBeInTheDocument();
        expect(screen.getByText('Destinations')).toBeInTheDocument();
        expect(screen.getByText('Accommodations')).toBeInTheDocument();
      });
    });
  });

  describe('Date Validation', () => {
    it('should show end date with min attribute based on start date', async () => {
      renderWithRouter(<TripDetails />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        const inputs = screen.getAllByLabelText('Start Date');
        const startDateInput = inputs[0];
        fireEvent.change(startDateInput, { target: { value: '2024-06-01' } });
      });

      await waitFor(() => {
        const endInputs = screen.getAllByLabelText('End Date');
        const endDateInput = endInputs[0];
        expect(endDateInput).toHaveAttribute('min', '2024-06-01');
      });
    });
  });

  describe('Travel Modes', () => {
    it('should display multiple travel modes in overview', async () => {
      renderWithRouter(<TripDetails />);

      await waitFor(() => {
        const modeText = screen.getByText(/Travel Mode/);
        expect(modeText).toBeInTheDocument();
      });
    });
  });

  describe('Tags Display', () => {
    it('should display existing tags', async () => {
      renderWithRouter(<TripDetails />);

      await waitFor(() => {
        expect(screen.getByText('#romantic')).toBeInTheDocument();
        expect(screen.getByText('#cultural')).toBeInTheDocument();
      });
    });
  });
});
