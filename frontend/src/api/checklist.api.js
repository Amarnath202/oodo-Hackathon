import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const getChecklistApi = (tripId) => axiosInstance.get(API.CHECKLIST(tripId));
export const addChecklistItemApi = (tripId, data) => axiosInstance.post(API.CHECKLIST_ITEMS(tripId), data);
export const updateChecklistItemApi = (tripId, itemId, data) =>
  axiosInstance.put(API.CHECKLIST_ITEM(tripId, itemId), data);
export const deleteChecklistItemApi = (tripId, itemId) =>
  axiosInstance.delete(API.CHECKLIST_ITEM(tripId, itemId));
export const resetChecklistApi = (tripId) =>
  axiosInstance.post(`${API.CHECKLIST(tripId)}/reset`);
