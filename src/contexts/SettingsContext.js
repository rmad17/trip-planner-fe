import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_CURRENCY } from '../utils/currency';

const SettingsContext = createContext();

export const MAP_PROVIDERS = {
  MAPBOX: 'mapbox',
  GOOGLE: 'google'
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // Initialize from localStorage or use defaults
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('preferredCurrency');
    return saved || DEFAULT_CURRENCY;
  });

  const [mapProvider, setMapProvider] = useState(() => {
    const saved = localStorage.getItem('mapProvider');
    return saved || MAP_PROVIDERS.MAPBOX;
  });

  // Save currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferredCurrency', currency);
  }, [currency]);

  // Save map provider to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mapProvider', mapProvider);
  }, [mapProvider]);

  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const updateMapProvider = (newProvider) => {
    // For now, only Mapbox is allowed
    if (newProvider === MAP_PROVIDERS.MAPBOX) {
      setMapProvider(newProvider);
    }
  };

  const value = {
    currency,
    updateCurrency,
    mapProvider,
    updateMapProvider,
    MAP_PROVIDERS
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
