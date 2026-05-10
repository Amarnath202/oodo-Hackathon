import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const getBudgetApi = (tripId) => axiosInstance.get(API.BUDGET(tripId));
export const updateBudgetApi = (tripId, data) => axiosInstance.put(API.BUDGET(tripId), data);
