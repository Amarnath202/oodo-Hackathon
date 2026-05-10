import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const publishTripApi = (tripId) => axiosInstance.post(API.SHARE_PUBLISH(tripId));
export const unpublishTripApi = (tripId) => axiosInstance.post(API.SHARE_UNPUBLISH(tripId));
export const getPublicTripApi = (slug) => axiosInstance.get(API.PUBLIC_TRIP(slug));
export const copyTripApi = (slug) => axiosInstance.post(API.PUBLIC_TRIP_COPY(slug));
