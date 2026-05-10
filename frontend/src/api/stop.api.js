import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const getStopsApi = (tripId) => axiosInstance.get(API.STOPS(tripId));
export const createStopApi = (tripId, data) => axiosInstance.post(API.STOPS(tripId), data);
export const updateStopApi = (tripId, stopId, data) => axiosInstance.put(API.STOP(tripId, stopId), data);
export const deleteStopApi = (tripId, stopId) => axiosInstance.delete(API.STOP(tripId, stopId));
export const reorderStopsApi = (tripId, data) => axiosInstance.post(API.STOPS_REORDER(tripId), data);
