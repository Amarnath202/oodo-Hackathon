import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const getActivitiesApi = (params) => axiosInstance.get(API.ACTIVITIES, { params });
export const getActivityApi = (id) => axiosInstance.get(API.ACTIVITY(id));
export const getStopActivitiesApi = (tripId, stopId) =>
  axiosInstance.get(API.STOP_ACTIVITIES(tripId, stopId));
export const addActivityToStopApi = (tripId, stopId, data) =>
  axiosInstance.post(API.STOP_ACTIVITIES(tripId, stopId), data);
export const removeActivityFromStopApi = (tripId, stopId, activityId) =>
  axiosInstance.delete(API.STOP_ACTIVITY(tripId, stopId, activityId));
