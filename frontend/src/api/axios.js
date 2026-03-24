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
    timeout: 30000, // Reduced from 60s to 30s to better handle Render sleep
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

// Response interceptor to handle Render "Cold Start" and Vercel timeouts
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;
        
        // Handle Render.com free tier sleep (503 Service Unavailable or Timeout)
        if (!response || response.status === 503 || error.code === 'ECONNABORTED') {
            // If it's the first attempt at a GET request, try one retry after a small delay
            if (!config.__isRetryRequest && config.method === 'get') {
                config.__isRetryRequest = true;
                // Wait 2 seconds before retrying (gives Render time to wake up)
                await new Promise(resolve => setTimeout(resolve, 2000));
                return api(config);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
