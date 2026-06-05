/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Default base configuration
const DEFAULT_API_URL = 'http://localhost:8080';
const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';

// Dynamic keys stored in localStorage for UI toggles / configuration
export const STORAGE_KEYS = {
  API_BASE_URL: 'taskflow_api_base_url',
  X_USER_ID: 'taskflow_x_user_id',
};

export const getApiBaseUrl = (): string => {
  return localStorage.getItem(STORAGE_KEYS.API_BASE_URL) || DEFAULT_API_URL;
};

export const setApiBaseUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEYS.API_BASE_URL, url);
  // Re-initialize api instance or page reload required
};

export const getXUserId = (): string => {
  return localStorage.getItem(STORAGE_KEYS.X_USER_ID) || DEFAULT_USER_ID;
};

export const setXUserId = (userId: string): void => {
  localStorage.setItem(STORAGE_KEYS.X_USER_ID, userId);
};

// Create the Axios Instance
const api: AxiosInstance = axios.create({
  get baseURL() {
    return getApiBaseUrl();
  },
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject X-User-Id headers on every outgoing request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const xUserId = getXUserId();
    if (xUserId && config.headers) {
      config.headers['X-User-Id'] = xUserId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
export { axios };
