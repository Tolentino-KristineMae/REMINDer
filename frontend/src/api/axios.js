import axios from 'axios';

// Split hosting (e.g. Vercel + Render): set VITE_API_BASE_URL in Vercel to your API root, including `/api`.
// Example: https://your-service.onrender.com/api
// Same-origin production (Laravel serves the SPA): leave unset — falls back to current origin + `/api`.
// Local dev: uses http://localhost:8000/api when unset.
const API_BASE_URL = (() => {
    const raw = import.meta.env.VITE_API_BASE_URL?.trim();
    if (raw) {
        return raw.replace(/\/+$/, '');
    }
    if (import.meta.env.DEV) {
        return 'http://localhost:8000/api';
    }
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api`;
    }
    return 'http://localhost:8000/api';
})();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
