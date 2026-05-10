import { useState, useCallback } from 'react';
import { getCitiesApi } from '../api/city.api';
import { DEMO_CITIES } from '../constants/mockData';
import { parseError } from '../utils/errorParser.util';
import toast from 'react-hot-toast';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const useCities = () => {
  const [cities, setCities] = useState(IS_DEMO ? DEMO_CITIES : []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchCities = useCallback(async (params = {}) => {
    if (IS_DEMO) {
      let filtered = [...DEMO_CITIES];
      if (params.search) filtered = filtered.filter((c) => c.name.toLowerCase().includes(params.search.toLowerCase()) || c.country.toLowerCase().includes(params.search.toLowerCase()));
      if (params.region) filtered = filtered.filter((c) => c.region === params.region);
      if (params.limit) filtered = filtered.slice(0, params.limit);
      setCities(filtered);
      setPagination({ page: 1, totalPages: 1 });
      return;
    }
    setLoading(true);
    try {
      const { data } = await getCitiesApi(params);
      setCities(data.cities || data.data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { cities, loading, pagination, fetchCities };
};

export default useCities;
