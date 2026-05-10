import { useState, useCallback } from 'react';
import { getPublicTripApi, copyTripApi, publishTripApi, unpublishTripApi } from '../api/share.api';
import { parseError } from '../utils/errorParser.util';
import toast from 'react-hot-toast';

const useShare = () => {
  const [publicTrip, setPublicTrip] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPublicTrip = useCallback(async (slug) => {
    setLoading(true);
    try {
      const { data } = await getPublicTripApi(slug);
      setPublicTrip(data.trip || data);
      return data.trip || data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishTrip = useCallback(async (tripId) => {
    setLoading(true);
    try {
      const { data } = await publishTripApi(tripId);
      return data;
    } catch (err) {
      throw parseError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const unpublishTrip = useCallback(async (tripId) => {
    setLoading(true);
    try {
      const { data } = await unpublishTripApi(tripId);
      return data;
    } catch (err) {
      throw parseError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const copyTrip = useCallback(async (slug) => {
    setLoading(true);
    try {
      const { data } = await copyTripApi(slug);
      toast.success('Trip copied to your account!');
      return data;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { publicTrip, loading, fetchPublicTrip, publishTrip, unpublishTrip, copyTrip };
};

export default useShare;
