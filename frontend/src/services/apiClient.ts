import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('Missing REACT_APP_API_BASE_URL environment variable');
}

let unauthorizedHandler: (() => void) | null = null;

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`
});

export const applyAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const onUnauthorized = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
      return Promise.reject({ ...error, isAuthError: true });
    }
    return Promise.reject(error);
  }
);
