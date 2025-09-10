// lib/axios.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

// Create axios instance with default config
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''
const APP_API_URL = process.env.NEXT_PUBLIC_APP_API_URL || ''

export function getFinalUrl() {
  const finalUrl = `${APP_URL}${APP_API_URL}`;
  return finalUrl;
}

// List of endpoints that don't require auth tokens
const publicEndpoints = process.env.NEXT_PUBLIC_ENDPOINTS
  ? process.env.NEXT_PUBLIC_ENDPOINTS.split(',').map(route => route.trim())
  : ['/auth/login', '/auth/register', '/auth/refresh', '/public/', '/api/auth/'];

// Check if endpoint is public
function isPublicEndpoint(url: string): boolean {
  return publicEndpoints.some(endpoint =>
    url.includes(endpoint) || url.startsWith(endpoint)
  );
}

const axiosInstance = axios.create({
  baseURL: getFinalUrl(),
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add NextAuth session token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Only add auth token for client-side requests and non-public endpoints
    if (typeof window !== 'undefined' && !isPublicEndpoint(config.url || '')) {
      try {
        const session = await getSession();
        if (session?.user) {
          // Option 1: Use NextAuth's built-in JWT token (if using JWT strategy)
          // The session token is automatically handled by NextAuth
          // For API routes, you can get the session server-side

          // Option 2: If you need to pass user info in headers
          config.headers['X-User-Email'] = session.user.email;
          if (session.user.id) {
            config.headers['X-User-ID'] = session.user.id;
          }

          // Option 3: If your API expects a custom authorization header
          // You might need to create a custom JWT token or use session tokens
          // config.headers.Authorization = `Bearer ${customToken}`;

        } else {
          console.warn('No active session found for protected route:', config.url);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip for public endpoints or if already retried
    if (isPublicEndpoint(originalRequest.url) || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If error is 401, redirect to sign in
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        // Check if session still exists
        const session = await getSession();

        if (!session) {
          // No session, redirect to login
          const { signIn } = await import('next-auth/react');
          signIn(); // This will redirect to the sign-in page
          return Promise.reject(error);
        }

        // Session exists but API returned 401
        // This might be a server-side session validation issue
        console.error('Session exists but API returned 401:', {
          url: originalRequest.url,
          session: !!session
        });
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };

// Helper function to create authenticated requests for server-side usage
export async function createAuthenticatedRequest(req?: any) {
  const instance = axios.create({
    baseURL: getFinalUrl(),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // For server-side requests, you might need to forward cookies
  if (req && req.headers.cookie) {
    instance.defaults.headers.cookie = req.headers.cookie;
  }

  return instance;
}
