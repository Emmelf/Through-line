import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const defaultApiUrl = import.meta.env.PROD ? globalThis.location.origin : 'http://localhost:8000';
const baseURL = import.meta.env.PROD && configuredApiUrl?.includes('localhost') ? defaultApiUrl : (configuredApiUrl || defaultApiUrl);

const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default instance;

