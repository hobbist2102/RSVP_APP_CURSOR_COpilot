/**
 * API Utilities
 * 
 * This file provides standardized API request functions to ensure consistent
 * API interactions throughout the application.
 */
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { queryClient } from "./queryClient";

// Standard API request options
export interface ApiRequestOptions extends Omit<AxiosRequestConfig, "url" | "method"> {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  withCredentials?: boolean;
  includeHeaders?: boolean;
  headers?: Record<string, string>;
}

// API response interface with improved typing
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// API error interface with more detailed information
export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: any;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
  isServerError?: boolean;
  isClientError?: boolean;
}

/**
 * Creates a detailed API error with additional context
 */
function createApiError(error: AxiosError): ApiError {
  const apiError: ApiError = new Error(
    error.response?.data?.message || error.message
  ) as ApiError;
  
  apiError.name = "ApiError";
  
  if (error.response) {
    // Server responded with a non-2xx status
    apiError.status = error.response.status;
    apiError.statusText = error.response.statusText;
    apiError.data = error.response.data;
    apiError.isServerError = error.response.status >= 500;
    apiError.isClientError = error.response.status >= 400 && error.response.status < 500;
  } else if (error.request) {
    // Request made but no response received
    apiError.isNetworkError = error.message.includes("Network Error");
    apiError.isTimeoutError = error.message.includes("timeout");
  }
  
  return apiError;
}

/**
 * Main API request function that standardizes error handling and request configuration
 */
export async function apiRequest<T = any>(
  options: ApiRequestOptions
): Promise<ApiResponse<T>> {
  const { url, method, data, params, withCredentials = true, includeHeaders = false, headers = {} } = options;
  
  try {
    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      params,
      withCredentials,
      headers: {
        ...headers,
        "Content-Type": headers["Content-Type"] || "application/json",
      },
    };
    
    const response: AxiosResponse<T> = await axios(config);
    
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
    };
  } catch (error) {
    const apiError = createApiError(error as AxiosError);
    
    // Handle specific error cases
    if (apiError.status === 401) {
      // Authentication error - could trigger a re-login flow
      console.warn("Authentication error:", apiError);
      // Optional: invalidate auth state
      queryClient.invalidateQueries(["/api/auth/user"]);
    } else if (apiError.status === 403) {
      // Authorization error
      console.warn("Authorization error:", apiError);
    } else if (apiError.isNetworkError) {
      // Network error
      console.error("Network error:", apiError);
    } else if (apiError.isTimeoutError) {
      // Timeout error
      console.error("Request timeout:", apiError);
    } else if (apiError.isServerError) {
      // Server error (5xx)
      console.error("Server error:", apiError);
    }
    
    throw apiError;
  }
}

/**
 * Shorthand for GET requests
 */
export function get<T = any>(url: string, params?: any, options?: Partial<ApiRequestOptions>): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    url,
    method: "GET",
    params,
    ...options,
  });
}

/**
 * Shorthand for POST requests
 */
export function post<T = any>(url: string, data?: any, options?: Partial<ApiRequestOptions>): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    url,
    method: "POST",
    data,
    ...options,
  });
}

/**
 * Shorthand for PUT requests
 */
export function put<T = any>(url: string, data?: any, options?: Partial<ApiRequestOptions>): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    url,
    method: "PUT",
    data,
    ...options,
  });
}

/**
 * Shorthand for PATCH requests
 */
export function patch<T = any>(url: string, data?: any, options?: Partial<ApiRequestOptions>): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    url,
    method: "PATCH",
    data,
    ...options,
  });
}

/**
 * Shorthand for DELETE requests
 */
export function del<T = any>(url: string, params?: any, options?: Partial<ApiRequestOptions>): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    url,
    method: "DELETE",
    params,
    ...options,
  });
}

/**
 * Utility function to invalidate related query cache
 * after a mutation operation on a resource
 */
export function invalidateRelatedQueries(resourcePath: string, id?: number | string): void {
  // Invalidate collection
  queryClient.invalidateQueries([resourcePath]);
  
  // Invalidate specific resource if ID is provided
  if (id !== undefined) {
    queryClient.invalidateQueries([`${resourcePath}/${id}`]);
  }
}

/**
 * Utility to handle common operations with proper error handling and cache invalidation
 */
export const apiOperations = {
  /**
   * Create a new resource
   */
  create: async <T = any, R = any>(resourcePath: string, data: T): Promise<R> => {
    const response = await post<R>(resourcePath, data);
    invalidateRelatedQueries(resourcePath);
    return response.data;
  },
  
  /**
   * Fetch a collection of resources
   */
  fetchAll: async <T = any>(resourcePath: string, params?: any): Promise<T[]> => {
    const response = await get<T[]>(resourcePath, params);
    return response.data;
  },
  
  /**
   * Fetch a single resource by ID
   */
  fetchById: async <T = any>(resourcePath: string, id: number | string, params?: any): Promise<T> => {
    const response = await get<T>(`${resourcePath}/${id}`, params);
    return response.data;
  },
  
  /**
   * Update a resource
   */
  update: async <T = any, R = any>(resourcePath: string, id: number | string, data: T): Promise<R> => {
    const response = await patch<R>(`${resourcePath}/${id}`, data);
    invalidateRelatedQueries(resourcePath, id);
    return response.data;
  },
  
  /**
   * Delete a resource
   */
  delete: async <R = any>(resourcePath: string, id: number | string): Promise<R> => {
    const response = await del<R>(`${resourcePath}/${id}`);
    invalidateRelatedQueries(resourcePath, id);
    return response.data;
  },
};

/**
 * Constants for common API endpoints
 */
export const ApiEndpoints = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    USER: "/api/auth/user",
  },
  EVENTS: {
    BASE: "/api/events",
    DETAILS: (id: number | string) => `/api/events/${id}`,
    CEREMONIES: (id: number | string) => `/api/events/${id}/ceremonies`,
    GUESTS: (id: number | string) => `/api/events/${id}/guests`,
    SETTINGS: (id: number | string) => `/api/events/${id}/settings`,
  },
  GUESTS: {
    BASE: "/api/guests",
    DETAILS: (id: number | string) => `/api/guests/${id}`,
    RSVP: (id: number | string) => `/api/guests/${id}/rsvp`,
  },
  RSVP: {
    VERIFY: "/api/rsvp/verify",
    SUBMIT: "/api/rsvp/submit",
    STAGE1: "/api/rsvp/stage1",
    STAGE2: "/api/rsvp/stage2",
  },
  HOTELS: {
    BASE: "/api/hotels",
    DETAILS: (id: number | string) => `/api/hotels/${id}`,
  },
  COMMUNICATIONS: {
    TEST_EMAIL: "/api/test-email",
    EMAIL_TEMPLATES: "/api/email-templates",
    WHATSAPP_TEMPLATES: "/api/whatsapp-templates",
    FOLLOW_UP: "/api/rsvp-followup",
  },
  ADMIN: {
    USERS: "/api/users",
    STATS: "/api/stats",
  },
};

/**
 * Common error handling for form submissions using react-hook-form
 */
export function handleApiValidationErrors(error: any, setError: any): void {
  if (error?.data?.errors) {
    // Handle structured validation errors
    const validationErrors = error.data.errors;
    Object.keys(validationErrors).forEach((field) => {
      setError(field, {
        type: "server",
        message: validationErrors[field],
      });
    });
  } else if (error?.data?.message) {
    // Handle general error message
    setError("root.serverError", {
      type: "server",
      message: error.data.message,
    });
  } else {
    // Handle unknown error
    setError("root.serverError", {
      type: "server",
      message: "An unexpected error occurred. Please try again.",
    });
  }
}