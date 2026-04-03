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
        'Accept': 'application/json',
    },
    timeout: 10000, // 10 second timeout for faster feedback
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to GET requests to prevent browser caching
    if (config.method === 'get') {
        config.params = {
            ...config.params,
            _t: Date.now()
        };
    }
    
    return config;
});

// Handle cold start on deployed backend
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;
        
        if (!response || response.status === 503 || error.code === 'ECONNABORTED') {
            if (!config.__isRetryRequest && config.method === 'get') {
                config.__isRetryRequest = true;
                await new Promise(resolve => setTimeout(resolve, 2000));
                return api(config);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
