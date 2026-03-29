import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? (window as unknown as Record<string, string>).__accessToken
    : undefined;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
