import { useState, useCallback } from 'react';
import { getStopsApi, createStopApi, updateStopApi, deleteStopApi, reorderStopsApi } from '../api/stop.api';
import { DEMO_STOPS } from '../constants/mockData';
import { parseError } from '../utils/errorParser.util';
import toast from 'react-hot-toast';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const useStops = (tripId) => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStops = useCallback(async () => {
    if (!tripId) return;
    if (IS_DEMO) {
      const tripStops = DEMO_STOPS.filter((s) => s.tripId === tripId);
      setStops(tripStops.length > 0 ? tripStops : DEMO_STOPS.slice(0, 3));
      return;
    }
    setLoading(true);
    try {
      const { data } = await getStopsApi(tripId);
      setStops(data.stops || data.data || []);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  const addStop = useCallback(async (stopData) => {
    if (IS_DEMO) {
      const newStop = {
        id: `stop-${Date.now()}`,
        tripId,
        cityName: stopData.cityName || 'New City',
        startDate: stopData.startDate,
        endDate: stopData.endDate,
        order: stops.length + 1,
      };
      setStops((prev) => [...prev, newStop]);
      toast.success('Stop added!');
      return newStop;
    }
    try {
      const payload = {
        city_id: stopData.cityId,
        start_date: stopData.startDate,
        end_date: stopData.endDate,
        order_index: stops.length + 1,
      };
      if (stopData.notes) payload.notes = stopData.notes;

      const { data } = await createStopApi(tripId, payload);
      const created = data.stop || data;
      setStops((prev) => [...prev, created]);
      toast.success('Stop added!');
      return created;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, [tripId, stops.length]);

  const updateStop = useCallback(async (stopId, stopData) => {
    if (IS_DEMO) {
      const updated = { ...stopData, id: stopId };
      setStops((prev) => prev.map((s) => (s.id === stopId ? { ...s, ...updated } : s)));
      return updated;
    }
    try {
      const payload = {};
      if (stopData.cityId) payload.city_id = stopData.cityId;
      if (stopData.startDate) payload.start_date = stopData.startDate;
      if (stopData.endDate) payload.end_date = stopData.endDate;
      if (stopData.orderIndex !== undefined) payload.order_index = stopData.orderIndex;
      if (stopData.notes !== undefined) payload.notes = stopData.notes;

      const { data } = await updateStopApi(tripId, stopId, Object.keys(payload).length > 0 ? payload : stopData);
      const updated = data.stop || data;
      setStops((prev) => prev.map((s) => (s.id === stopId || s._id === stopId ? { ...s, ...updated } : s)));
      return updated;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, [tripId]);

  const deleteStop = useCallback(async (stopId) => {
    if (IS_DEMO) {
      setStops((prev) => prev.filter((s) => s.id !== stopId));
      toast.success('Stop removed');
      return;
    }
    try {
      await deleteStopApi(tripId, stopId);
      setStops((prev) => prev.filter((s) => s.id !== stopId && s._id !== stopId));
      toast.success('Stop removed');
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, [tripId]);

  const reorderStops = useCallback(async (orderedIds) => {
    setStops((prev) => {
      const map = Object.fromEntries(prev.map((s) => [s.id || s._id, s]));
      return orderedIds.map((id) => map[id]).filter(Boolean);
    });
    if (!IS_DEMO) {
      try {
        const payload = {
          order: orderedIds.map((id, index) => ({
            id,
            order_index: index + 1
          }))
        };
        await reorderStopsApi(tripId, payload);
        toast.success('Order saved');
      } catch (err) {
        toast.error(parseError(err));
      }
    } else {
      toast.success('Order saved');
    }
  }, [tripId]);

  const appendStop = useCallback((stop) => {
    setStops((prev) => {
      const exists = prev.some((s) => s.id === stop.id || s._id === stop._id);
      return exists ? prev : [...prev, stop];
    });
  }, []);

  const removeStop = useCallback((stopId) => {
    setStops((prev) => prev.filter((s) => s.id !== stopId && s._id !== stopId));
  }, []);

  return { stops, loading, fetchStops, addStop, updateStop, deleteStop, reorderStops, setStops, appendStop, removeStop };
};

export default useStops;
