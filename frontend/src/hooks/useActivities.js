import { useState, useCallback } from 'react';
import { getActivitiesApi, getStopActivitiesApi, addActivityToStopApi, removeActivityFromStopApi } from '../api/activity.api';
import { DEMO_ACTIVITIES, DEMO_ALL_ACTIVITIES } from '../constants/mockData';
import { parseError } from '../utils/errorParser.util';
import toast from 'react-hot-toast';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const useActivities = () => {
  const [activities, setActivities] = useState(IS_DEMO ? DEMO_ALL_ACTIVITIES : []);
  const [stopActivities, setStopActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchActivities = useCallback(async (params = {}) => {
    if (IS_DEMO) {
      let filtered = [...DEMO_ALL_ACTIVITIES];
      if (params.search) filtered = filtered.filter((a) => a.name.toLowerCase().includes(params.search.toLowerCase()));
      if (params.type) filtered = filtered.filter((a) => a.type === params.type);
      if (params.maxCost) filtered = filtered.filter((a) => a.cost <= Number(params.maxCost));
      setActivities(filtered);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getActivitiesApi(params);
      setActivities(data.activities || data.data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStopActivities = useCallback(async (tripId, stopId) => {
    if (IS_DEMO) {
      const stopActs = DEMO_ACTIVITIES.filter((a) => a.stopId === stopId);
      setStopActivities(stopActs.length > 0 ? stopActs : DEMO_ACTIVITIES.slice(0, 3));
      return;
    }
    setLoading(true);
    try {
      const { data } = await getStopActivitiesApi(tripId, stopId);
      setStopActivities(data.activities || data.data || []);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addToStop = useCallback(async (tripId, stopId, activityData) => {
    if (IS_DEMO) {
      const found = DEMO_ALL_ACTIVITIES.find((a) => a.id === activityData.activityId) || { id: activityData.activityId, name: 'New Activity', type: 'Sightseeing', cost: 0 };
      setStopActivities((prev) => {
        const exists = prev.some((a) => a.id === found.id);
        return exists ? prev : [...prev, { ...found, stopId }];
      });
      return found;
    }
    try {
      const { data } = await addActivityToStopApi(tripId, stopId, activityData);
      const added = data.activity || activityData;
      setStopActivities((prev) => [...prev, added]);
      return added;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, []);

  const removeFromStop = useCallback(async (tripId, stopId, activityId) => {
    if (IS_DEMO) {
      setStopActivities((prev) => prev.filter((a) => a.id !== activityId && a._id !== activityId));
      toast.success('Activity removed');
      return;
    }
    try {
      await removeActivityFromStopApi(tripId, stopId, activityId);
      setStopActivities((prev) => prev.filter((a) => a.id !== activityId && a._id !== activityId));
      toast.success('Activity removed');
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, []);

  const appendActivity = useCallback((activity) => {
    setStopActivities((prev) => {
      const exists = prev.some((a) => a.id === activity.id || a._id === activity._id);
      return exists ? prev : [...prev, activity];
    });
  }, []);

  const removeActivity = useCallback((activityId) => {
    setStopActivities((prev) => prev.filter((a) => a.id !== activityId && a._id !== activityId));
  }, []);

  return {
    activities, stopActivities, loading, pagination,
    fetchActivities, fetchStopActivities, addToStop, removeFromStop,
    appendActivity, removeActivity, setStopActivities,
  };
};

export default useActivities;
