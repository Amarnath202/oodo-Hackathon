import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const getProfileApi = () => axiosInstance.get(API.PROFILE);
export const updateProfileApi = (data) => axiosInstance.put(API.PROFILE, data);
export const uploadProfilePhotoApi = (formData) =>
  axiosInstance.post(API.PROFILE_PHOTO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const changePasswordApi = (data) => axiosInstance.put(API.CHANGE_PASSWORD, data);
export const deleteAccountApi = () => axiosInstance.delete(API.DELETE_ACCOUNT);
export const getSavedDestinationsApi = () => axiosInstance.get(API.SAVED_DESTINATIONS);
export const saveDestinationApi = (data) => axiosInstance.post(API.SAVED_DESTINATIONS, data);
export const removeSavedDestinationApi = (id) =>
  axiosInstance.delete(API.SAVED_DESTINATION(id));
