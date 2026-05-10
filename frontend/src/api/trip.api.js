import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const getTripsApi = (params) => axiosInstance.get(API.TRIPS, { params });
export const getTripApi = (id) => axiosInstance.get(API.TRIP(id));
export const createTripApi = (data) => axiosInstance.post(API.TRIPS, data);
export const updateTripApi = (id, data) => axiosInstance.put(API.TRIP(id), data);
export const deleteTripApi = (id) => axiosInstance.delete(API.TRIP(id));
export const uploadTripCoverApi = (id, formData) =>
  axiosInstance.post(API.TRIP_COVER(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const shareTripApi = (id, data) => axiosInstance.post(API.SHARE(id), data);
