import { useState, useCallback } from 'react';
import { getTripsApi, createTripApi, updateTripApi, deleteTripApi, uploadTripCoverApi } from '../api/trip.api';
import {
  DEMO_TRIPS,
} from '../constants/mockData';
import { parseError } from '../utils/errorParser.util';
import toast from 'react-hot-toast';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const useTrips = () => {
  const [trips, setTrips] = useState(IS_DEMO ? DEMO_TRIPS : []);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: IS_DEMO ? 1 : 1, total: IS_DEMO ? DEMO_TRIPS.length : 0 });

  const fetchTrips = useCallback(async (params = {}) => {
    if (IS_DEMO) {
      let filtered = [...DEMO_TRIPS];
      if (params.search) filtered = filtered.filter((t) => t.name.toLowerCase().includes(params.search.toLowerCase()));
      setTrips(filtered);
      setPagination({ page: 1, totalPages: 1, total: filtered.length });
      return;
    }
    setLoading(true);
    try {
      const { data } = await getTripsApi(params);
      setTrips(data.trips || data.data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrip = useCallback(async (tripData) => {
    setLoading(true);
    try {
      const payload = {
        name: tripData.name,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        description: tripData.description,
        is_public: tripData.isPublic || false,
      };
      const { data } = await createTripApi(payload);
      const created = data.trip || data;
      toast.success('Trip created!');
      
      // If budgetLimit is provided, we should update the auto-created budget
      if (tripData.budgetLimit && created.id) {
        const { updateBudgetApi } = await import('../api/budget.api');
        await updateBudgetApi(created.id, { budget_limit: tripData.budgetLimit }).catch(() => {});
      }
      
      return created;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTrip = useCallback(async (id, tripData) => {
    try {
      const payload = {
        name: tripData.name,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        description: tripData.description,
        is_public: tripData.isPublic,
      };
      // Remove undefined keys
      Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

      const { data } = await updateTripApi(id, payload);
      const updated = data.trip || data;
      setTrips((prev) => prev.map((t) => (t.id === id || t._id === id ? { ...t, ...updated } : t)));
      if (trip?.id === id || trip?._id === id) setTrip((p) => ({ ...p, ...updated }));
      toast.success('Trip updated!');
      return updated;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, [trip]);

  const deleteTrip = useCallback(async (id) => {
    if (IS_DEMO) {
      setTrips((prev) => prev.filter((t) => t.id !== id));
      toast.success('Trip deleted');
      return;
    }
    try {
      await deleteTripApi(id);
      setTrips((prev) => prev.filter((t) => t.id !== id && t._id !== id));
      toast.success('Trip deleted');
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, []);

  const uploadCover = useCallback(async (id, file) => {
    if (IS_DEMO) return URL.createObjectURL(file);
    const formData = new FormData();
    formData.append('cover', file);
    try {
      const { data } = await uploadTripCoverApi(id, formData);
      return data.url || data.coverUrl;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, []);

  return { trips, trip, loading, pagination, fetchTrips, createTrip, updateTrip, deleteTrip, uploadCover, setTrip };
};

export default useTrips;
