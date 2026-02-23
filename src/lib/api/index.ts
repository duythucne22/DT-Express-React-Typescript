import axios from 'axios';
import type { ApiResponse } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5198';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject JWT + correlation ID
apiClient.interceptors.request.use((config) => {
  // Inject JWT from localStorage
  const storedAuth = localStorage.getItem('dtex-auth');
  if (storedAuth) {
    try {
      const parsed = JSON.parse(storedAuth);
      const token = parsed?.state?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Inject correlation ID
  if (!config.headers['X-Correlation-ID']) {
    config.headers['X-Correlation-ID'] = crypto.randomUUID();
  }

  return config;
});

// Response interceptor: unwrap ApiResponse envelope, handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('dtex-auth');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Unwrap the ApiResponse envelope.
 * On success, returns `data`.
 * On failure, throws with the error message from the API.
 */
export async function unwrapResponse<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise;
  const envelope = response.data;

  if (!envelope.success || envelope.data === null) {
    const errorMessage = envelope.error?.message || 'An unknown error occurred';
    const errorCode = envelope.error?.code || 'UNKNOWN';
    const err = new Error(errorMessage);
    (err as any).code = errorCode;
    (err as any).correlationId = envelope.correlationId;
    throw err;
  }

  return envelope.data;
}

export default apiClient;
