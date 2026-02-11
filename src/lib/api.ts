import { getAuthHeaders } from './firebase-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface FetchOptions extends RequestInit {
  auth?: boolean; // Include auth headers (default: true)
}

/**
 * Authenticated fetch wrapper
 * Automatically includes auth token and handles common patterns
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = true, headers = {}, ...rest } = options;

  // Build headers
  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth headers if requested
  if (auth) {
    const authHeaders = await getAuthHeaders();
    Object.assign(finalHeaders, authHeaders);
  }

  // Make request
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: finalHeaders,
    ...rest,
  });

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(error.error || 'Request failed', response.status);
  }

  // Parse response
  return response.json();
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
