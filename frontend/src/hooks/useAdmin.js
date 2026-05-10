import { useState, useCallback } from 'react';
import { 
  getAdminStatsApi, 
  getAdminUsersApi, 
  banUserApi, 
  deleteUserApi,
  getAdminCitiesApi,
  createCityApi,
  updateCityApi,
  deleteCityApi,
  getAdminActivitiesApi,
  createActivityApi,
  updateActivityApi,
  deleteActivityApi
} from '../api/admin.api';
import { DEMO_ADMIN_STATS, DEMO_ADMIN_USERS } from '../constants/mockData';
import { parseError } from '../utils/errorParser.util';
import toast from 'react-hot-toast';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const useAdmin = () => {
  const [stats, setStats] = useState(IS_DEMO ? DEMO_ADMIN_STATS : null);
  const [users, setUsers] = useState(IS_DEMO ? DEMO_ADMIN_USERS : []);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchStats = useCallback(async () => {
    if (IS_DEMO) { setStats(DEMO_ADMIN_STATS); return; }
    setLoading(true);
    try {
      const { data } = await getAdminStatsApi();
      setStats(data.stats || data);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (params = {}) => {
    if (IS_DEMO) { setUsers(DEMO_ADMIN_USERS); return; }
    setLoading(true);
    try {
      const { data } = await getAdminUsersApi(params);
      setUsers(data.users || data.data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const banUser = useCallback(async (id) => {
    const loadingToast = toast.loading('Banning user...');
    if (IS_DEMO) {
      setUsers((prev) => prev.map((u) => (u.id === id || u._id === id ? { ...u, banned: true } : u)));
      toast.success('User banned (Demo)', { id: loadingToast });
      return;
    }

    try {
      await banUserApi(id);
      setUsers((prev) => prev.map((u) => (u.id === id || u._id === id ? { ...u, banned: true } : u)));
      toast.success('User banned', { id: loadingToast });
    } catch (err) {
      toast.error(parseError(err), { id: loadingToast });
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    const loadingToast = toast.loading('Deleting user...');
    if (IS_DEMO) {
      setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
      toast.success('User deleted (Demo)', { id: loadingToast });
      return;
    }

    try {
      await deleteUserApi(id);
      setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
      toast.success('User deleted', { id: loadingToast });
    } catch (err) {
      toast.error(parseError(err), { id: loadingToast });
      throw err;
    }
  }, []);

  // ─── City Management ───────────────────────────────────────────────────────

  const fetchCities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminCitiesApi();
      setCities(data.cities || data.data || []);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createCity = useCallback(async (cityData) => {
    const loadingToast = toast.loading('Creating city...');
    try {
      const { data } = await createCityApi(cityData);
      setCities((prev) => [data.city, ...prev]);
      toast.success('City created successfully', { id: loadingToast });
      return data.city;
    } catch (err) {
      toast.error(parseError(err), { id: loadingToast });
      throw err;
    }
  }, []);

  const updateCity = useCallback(async (id, cityData) => {
    const loadingToast = toast.loading('Updating city...');
    try {
      const { data } = await updateCityApi(id, cityData);
      setCities((prev) => prev.map((c) => (c.id === id ? data.city : c)));
      toast.success('City updated successfully', { id: loadingToast });
      return data.city;
    } catch (err) {
      toast.error(parseError(err), { id: loadingToast });
      throw err;
    }
  }, []);

  const deleteCity = useCallback(async (id) => {
    const loadingToast = toast.loading('Deleting city...');
    try {
      await deleteCityApi(id);
      setCities((prev) => prev.filter((c) => c.id !== id));
      toast.success('City deleted successfully', { id: loadingToast });
    } catch (err) {
      toast.error(parseError(err), { id: loadingToast });
      throw err;
    }
  }, []);

  // ─── Activity Management ───────────────────────────────────────────────────

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminActivitiesApi();
      setActivities(data.activities || data.data || []);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createActivity = useCallback(async (activityData) => {
    const loadingToast = toast.loading('Creating activity...');
    try {
      const { data } = await createActivityApi(activityData);
      setActivities((prev) => [data.activity, ...prev]);
      toast.success('Activity created successfully', { id: loadingToast });
      return data.activity;
    } catch (err) {
      toast.error(parseError(err), { id: loadingToast });
      throw err;
    }
  }, []);

  const updateActivity = useCallback(async (id, activityData) => {
    const loadingToast = toast.loading('Updating activity...');
    try {
      const { data } = await updateActivityApi(id, activityData);
      setActivities((prev) => prev.map((a) => (a.id === id ? data.activity : a)));
      toast.success('Activity updated successfully', { id: loadingToast });
      return data.activity;
    } catch (err) {
      toast.error(parseError(err), { id: loadingToast });
      throw err;
    }
  }, []);

  const deleteActivity = useCallback(async (id) => {
    const loadingToast = toast.loading('Deleting activity...');
    try {
      await deleteActivityApi(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      toast.success('Activity deleted successfully', { id: loadingToast });
    } catch (err) {
      toast.error(parseError(err), { id: loadingToast });
      throw err;
    }
  }, []);

  return { 
    stats, users, cities, activities, loading, pagination, 
    fetchStats, fetchUsers, banUser, deleteUser,
    fetchCities, createCity, updateCity, deleteCity,
    fetchActivities, createActivity, updateActivity, deleteActivity
  };
};

export default useAdmin;
