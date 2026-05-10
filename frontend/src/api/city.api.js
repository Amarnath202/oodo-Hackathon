import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const getCitiesApi = (params) => axiosInstance.get(API.CITIES, { params });
export const getCityApi = (id) => axiosInstance.get(API.CITY(id));
