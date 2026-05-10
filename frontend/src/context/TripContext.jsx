import { createContext, useContext, useState, useCallback } from 'react';

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState(null);
  const [activeTripId, setActiveTripId] = useState(null);

  const setTrip = useCallback((trip) => {
    setActiveTrip(trip);
    setActiveTripId(trip?.id || trip?._id || null);
  }, []);

  const clearTrip = useCallback(() => {
    setActiveTrip(null);
    setActiveTripId(null);
  }, []);

  const updateTripInContext = useCallback((updates) => {
    setActiveTrip((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return (
    <TripContext.Provider value={{ activeTrip, activeTripId, setTrip, clearTrip, updateTripInContext }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within TripProvider');
  return ctx;
};

export default TripContext;
