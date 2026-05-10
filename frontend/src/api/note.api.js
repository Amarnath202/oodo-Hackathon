import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const getNotesApi = (tripId, params) => axiosInstance.get(API.NOTES(tripId), { params });
export const createNoteApi = (tripId, data) => axiosInstance.post(API.NOTES(tripId), data);
export const updateNoteApi = (tripId, noteId, data) =>
  axiosInstance.put(API.NOTE(tripId, noteId), data);
export const deleteNoteApi = (tripId, noteId) =>
  axiosInstance.delete(API.NOTE(tripId, noteId));
