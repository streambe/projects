import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  withCredentials: true,
});

// NOTE: Request & response interceptors (Authorization header, 401 refresh
// logic) are registered by AuthProvider at mount time so they have access to
// the in-memory token without relying on globals.
