import React from 'react';
import { SearchBox } from '@mapbox/search-js-react';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoicm1hZDE3IiwiYSI6ImNtMnRmZDl1NDAyYjkya3NmZ2oybGUyOTgifQ.MJp5NBYhCR_G2qzoVTzQMg';

const PlaceSearchInput = ({
  value = '',
  onChange,
  placeholder = "Search for places...",
  className = "",
  onPlaceSelect
}) => {
  const handleRetrieve = (result) => {
    console.log('Mapbox SearchBox onRetrieve:', result);

    // Get the first feature from the results
    const feature = result.features?.[0];

    if (feature) {
      console.log('Selected feature:', feature);

      // Extract place information from the feature
      const placeData = {
        description: feature.properties?.full_address || feature.properties?.name || feature.place_name || '',
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

  return (
    <div className={`relative ${className}`}>
      <SearchBox
        accessToken={MAPBOX_ACCESS_TOKEN}
        value={value}
        onChange={handleChange}
        onRetrieve={handleRetrieve}
        placeholder={placeholder}
        options={{
          language: 'en',
          limit: 5
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
  );
};

export default PlaceSearchInput;
