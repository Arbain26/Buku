import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

const SIDRAP_DEFAULT = {
  lat: -3.9274,
  lng: 119.7997,
  name: 'Pangkajene, Sidrap',
  district: 'Pangkajene',
  isDetected: false,
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(SIDRAP_DEFAULT);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation tidak didukung pada peramban ini.');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Lokasi Anda Sekarang',
          district: 'Sidrap & Sekitarnya',
          isDetected: true,
        });
        setIsDetecting(false);
      },
      (err) => {
        console.warn('Geolocation denied or failed, using Sidrap center default:', err.message);
        setLocation(SIDRAP_DEFAULT);
        setIsDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    // Attempt detection once on load if permission is granted
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          requestGeolocation();
        }
      });
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        isDetecting,
        errorMsg,
        requestGeolocation,
        resetToSidrap: () => setLocation(SIDRAP_DEFAULT),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
