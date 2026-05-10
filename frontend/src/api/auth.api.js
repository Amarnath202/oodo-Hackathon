import axiosInstance from './axios.instance';
import { API } from '../constants/api.constants';

export const loginApi = (data) => axiosInstance.post(API.LOGIN, data);
export const registerApi = (data) => axiosInstance.post(API.REGISTER, data);
export const logoutApi = (data) => axiosInstance.post(API.LOGOUT, data);
export const getMeApi = () => axiosInstance.get(API.ME);
export const forgotPasswordApi = (data) => axiosInstance.post(API.FORGOT_PASSWORD, data);
export const resetPasswordApi = (data) => axiosInstance.post(API.RESET_PASSWORD, data);
export const googleAuthApi = (data) => axiosInstance.post(API.GOOGLE_AUTH, data);
