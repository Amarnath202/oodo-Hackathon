import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const getAdminStatsApi = () => axiosInstance.get(API.ADMIN_STATS);
export const getAdminUsersApi = (params) => axiosInstance.get(API.ADMIN_USERS, { params });
export const banUserApi = (id) => axiosInstance.post(`${API.ADMIN_USER(id)}/ban`);
export const deleteUserApi = (id) => axiosInstance.delete(API.ADMIN_USER(id));
export const getAdminTripsApi = (params) => axiosInstance.get(API.ADMIN_TRIPS, { params });
export const getAdminCitiesApi = () => axiosInstance.get(API.ADMIN_CITIES);
export const createCityApi = (data) => axiosInstance.post(API.ADMIN_CITIES, data);
export const updateCityApi = (id, data) => axiosInstance.put(API.ADMIN_CITY(id), data);
export const deleteCityApi = (id) => axiosInstance.delete(API.ADMIN_CITY(id));

export const getAdminActivitiesApi = () => axiosInstance.get(API.ADMIN_ACTIVITIES);
export const createActivityApi = (data) => axiosInstance.post(API.ADMIN_ACTIVITIES, data);
export const updateActivityApi = (id, data) => axiosInstance.put(API.ADMIN_ACTIVITY(id), data);
export const deleteActivityApi = (id) => axiosInstance.delete(API.ADMIN_ACTIVITY(id));