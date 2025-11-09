/**
 * Tests for Dashboard component improvements
 * Testing: Date Validation, Multi-Select Travel Modes, Tag Input
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Dashboard from './Dashboard';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Mock the API
jest.mock('../services/api');

// Mock the auth context
jest.mock('../contexts/AuthContext');

// Mock PlaceSearchInput
jest.mock('../components/PlaceSearchInput', () => {
  return function MockPlaceSearchInput({ value, onChange }) {
    return (
      <input
        data-testid="place-search-input"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder="Search places"
      />
    );
  };
});

// Mock AITripModal
jest.mock('../components/AITripModal', () => {
  return function MockAITripModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return (
      <div data-testid="ai-trip-modal">
        <button onClick={onClose}>Close AI Modal</button>
      </div>
    );
  };
});

// Mock ProfileButton
jest.mock('../components/ProfileButton', () => {
  return function MockProfileButton() {
    return <div data-testid="profile-button">Profile</div>;
  };
});

const renderWithRouter = (component) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: component,
      },
    ],
    {
      initialEntries: ['/'],
    }
  );

  return render(<RouterProvider router={router} />);
};

describe('Dashboard - New Features', () => {
  const mockUser = {
    username: 'testuser',
    id: 'user123'
  };

  const mockTrips = [
    {
      id: '1',
      name: 'Paris Adventure',
      start_date: '2024-06-01',
      end_date: '2024-06-10',
      travel_mode: ['flight', 'train'],
      tags: ['romantic', 'cultural'],
      user: { username: 'testuser' }
    },
    {
      id: '2',
      name: 'Tokyo Trip',
      start_date: '2024-07-01',
      end_date: '2024-07-15',
      travel_mode: ['flight'],
      tags: ['adventure'],
      user: { username: 'testuser' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });

    // Mock API responses
    api.tripAPI = {
      getAllTrips: jest.fn().mockResolvedValue({ data: mockTrips }),
      createTrip: jest.fn().mockResolvedValue({ data: { id: '3', name: 'New Trip' } })
    };
  });

  describe('Trip Creation Form Display', () => {
    it('should show create trip button', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Create Trip')).toBeInTheDocument();
      });
    });

    it('should show create form when Create Trip button is clicked', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Trip');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Create New Trip')).toBeInTheDocument();
      });
    });
  });

  describe('Date Validation in Trip Creation', () => {
    it('should display date inputs', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Trip');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
        expect(screen.getByLabelText('End Date')).toBeInTheDocument();
      });
    });

    it('should show validation error when end date is before start date', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Trip');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const startDateInput = screen.getByLabelText('Start Date');
        const endDateInput = screen.getByLabelText('End Date');

        fireEvent.change(startDateInput, { target: { value: '2024-06-10' } });
        fireEvent.change(endDateInput, { target: { value: '2024-06-01' } });
      });

      await waitFor(() => {
        expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
      });
    });

    it('should set min attribute on end date input based on start date', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Trip');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const startDateInput = screen.getByLabelText('Start Date');
        fireEvent.change(startDateInput, { target: { value: '2024-06-01' } });
      });

      await waitFor(() => {
        const endDateInput = screen.getByLabelText('End Date');
        expect(endDateInput).toHaveAttribute('min', '2024-06-01');
      });
    });
  });

  describe('Multi-Select Travel Modes in Trip Creation', () => {
    it('should display travel mode checkboxes', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Trip');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Travel Modes (select all that apply)')).toBeInTheDocument();
        expect(screen.getByText('Flight')).toBeInTheDocument();
        expect(screen.getByText('Car')).toBeInTheDocument();
        expect(screen.getByText('Train')).toBeInTheDocument();
        expect(screen.getByText('Bus')).toBeInTheDocument();
      });
    });

    it('should allow selecting multiple travel modes', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Trip');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        const travelModeCheckboxes = checkboxes.filter(cb => {
          const label = cb.closest('label');
          return label && (
            label.textContent.includes('Flight') ||
            label.textContent.includes('Car')
          );
        });

        // Select multiple modes
        fireEvent.click(travelModeCheckboxes[0]); // Flight
        fireEvent.click(travelModeCheckboxes[1]); // Car

        expect(travelModeCheckboxes[0]).toBeChecked();
        expect(travelModeCheckboxes[1]).toBeChecked();
      });
    });
  });

  describe('Tag Input in Trip Creation', () => {
    it('should display tag input field', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Trip');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Trip Tags')).toBeInTheDocument();
        const tagInput = screen.getByPlaceholderText(/Type a tag and press Enter/i);
        expect(tagInput).toBeInTheDocument();
      });
    });

    it('should add tag when Enter is pressed', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Trip');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const tagInput = screen.getByPlaceholderText(/Type a tag and press Enter/i);

        fireEvent.change(tagInput, { target: { value: 'adventure' } });
        fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });
      });

      await waitFor(() => {
        expect(screen.getByText('#adventure')).toBeInTheDocument();
      });
    });

    it('should prevent duplicate tags', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Trip');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const tagInput = screen.getByPlaceholderText(/Type a tag and press Enter/i);

        // Add first tag
        fireEvent.change(tagInput, { target: { value: 'beach' } });
        fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

        // Try to add duplicate
        fireEvent.change(tagInput, { target: { value: 'beach' } });
        fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });
      });

      await waitFor(() => {
        const beachTags = screen.getAllByText('#beach');
        expect(beachTags).toHaveLength(1);
      });
    });
  });

  describe('Trip List Display', () => {
    it('should display existing trips', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Paris Adventure')).toBeInTheDocument();
        expect(screen.getByText('Tokyo Trip')).toBeInTheDocument();
      });
    });

    it('should display trip tags on cards', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('#romantic')).toBeInTheDocument();
        expect(screen.getByText('#cultural')).toBeInTheDocument();
        expect(screen.getByText('#adventure')).toBeInTheDocument();
      });
    });
  });
});
