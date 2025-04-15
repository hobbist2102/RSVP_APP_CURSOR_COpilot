/**
 * OAuth HTTP Client with retry mechanism
 * Provides a robust HTTP client for OAuth operations with automatic retries
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { createOAuthLogger } from './logger';

// Define a custom error shape for logging purposes
interface ErrorWithContext extends Error {
  [key: string]: any;
}

// Create logger for OAuth client operations
const logger = createOAuthLogger(undefined, undefined, 'http-client');

// Create axios instance with default settings
const oauthClient = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Configure retry behavior for transient errors
axiosRetry(oauthClient, {
  retries: 3, // Number of retries
  retryDelay: axiosRetry.exponentialDelay, // Exponential backoff
  retryCondition: (error: AxiosError) => {
    // Only retry on network errors, timeouts, and 5xx server errors
    const shouldRetry = 
      axiosRetry.isNetworkOrIdempotentRequestError(error) || 
      (error.response?.status !== undefined && error.response.status >= 500);
    
    if (shouldRetry) {
      const additionalInfo: Record<string, any> = {
        status: error.response?.status,
        errorCode: error.code,
        errorMessage: error.message,
        retryCount: (error.config as any)['axios-retry']?.retryCount || 0
      };
      
      if (error.config?.url) additionalInfo.url = error.config.url;
      if (error.config?.method) additionalInfo.method = error.config.method;
      
      logger.warn(`Retrying request due to ${error.response?.status || 'network'} error`, additionalInfo);
    }
    
    return shouldRetry;
  },
  onRetry: (retryCount, error, requestConfig) => {
    logger.debug(`Retry attempt ${retryCount} for OAuth request`, {
      url: requestConfig.url,
      method: requestConfig.method,
      retryCount,
      errorMessage: error.message
    });
  }
});

/**
 * Log request and response details (with sensitive data masked)
 */
oauthClient.interceptors.request.use(
  (config) => {
    // Clone config to avoid mutating the original
    const logConfig = { ...config };
    
    // Mask sensitive information in request body and headers
    if (logConfig.data) {
      const maskedData = { ...logConfig.data };
      
      // Mask sensitive fields
      if (maskedData.client_secret) maskedData.client_secret = '***MASKED***';
      if (maskedData.refresh_token) maskedData.refresh_token = '***MASKED***';
      if (maskedData.access_token) maskedData.access_token = '***MASKED***';
      if (maskedData.code) maskedData.code = '***MASKED***';
      
      // Log masked request data
      logger.debug('OAuth outgoing request', {
        url: logConfig.url,
        method: logConfig.method,
        data: maskedData
      });
    }
    
    // Continue with original request
    return config;
  },
  (error) => {
    logger.error('OAuth request preparation failed', error);
    return Promise.reject(error);
  }
);

/**
 * Process responses and extract useful information
 */
oauthClient.interceptors.response.use(
  (response) => {
    // Log successful response (without sensitive data)
    const responseData = { ...response.data };
    
    // Mask sensitive fields
    if (responseData.access_token) responseData.access_token = '***MASKED***';
    if (responseData.refresh_token) responseData.refresh_token = '***MASKED***';
    if (responseData.id_token) responseData.id_token = '***MASKED***';
    
    logger.debug('OAuth response received', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      statusText: response.statusText,
      dataKeys: Object.keys(response.data),
      hasAccessToken: !!response.data.access_token,
      hasRefreshToken: !!response.data.refresh_token
    });
    
    return response;
  },
  (error) => {
    // More detailed error logging
    if (error.response) {
      // Server responded with error
      const errorInfo: Record<string, any> = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
      
      if (error.config?.url) errorInfo.url = error.config.url;
      if (error.config?.method) errorInfo.method = error.config.method;
      
      logger.error('OAuth server error response', errorInfo);
    } else if (error.request) {
      // No response received
      const errorInfo: Record<string, any> = {
        message: error.message
      };
      
      if (error.config?.url) errorInfo.url = error.config.url;
      if (error.config?.method) errorInfo.method = error.config.method;
      
      logger.error('OAuth request failed - no response', errorInfo);
    } else {
      // Request setup error
      logger.error('OAuth request setup error', error);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Perform an OAuth token exchange with request body formatting
 * @param url Token endpoint URL
 * @param data Form data for token request
 * @returns Promise resolving to response data
 */
export const exchangeToken = async <T>(
  url: string,
  data: Record<string, string>,
  extraConfig: AxiosRequestConfig = {}
): Promise<T> => {
  try {
    // Convert data to application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    
    // Add all data fields to form
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Make token exchange request
    const response = await oauthClient.post<T>(url, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...extraConfig
    });
    
    return response.data;
  } catch (error) {
    // Add more context to error
    if (error instanceof Error) {
      error.message = `OAuth token exchange failed: ${error.message}`;
    }
    throw error;
  }
};

/**
 * Make an authenticated API request with OAuth token
 * @param url API endpoint URL
 * @param accessToken OAuth access token
 * @param config Additional axios request config
 * @returns Promise resolving to response data
 */
export const makeAuthenticatedRequest = async <T>(
  url: string,
  accessToken: string,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  try {
    const response = await oauthClient.request<T>({
      url,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...config.headers
      },
      ...config
    });
    
    return response.data;
  } catch (error) {
    // Add more context to error
    if (error instanceof Error) {
      error.message = `Authenticated API request failed: ${error.message}`;
    }
    throw error;
  }
};

export default {
  oauthClient,
  exchangeToken,
  makeAuthenticatedRequest
};