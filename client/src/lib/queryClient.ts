import { QueryClient, QueryFunction } from "@tanstack/react-query";
import {
  legacyApiRequest,
  getQueryFn as apiUtilsGetQueryFn,
  defaultQueryOptions
} from "./api-utils";

/**
 * @deprecated Use apiRequest from api-utils.ts instead
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  params?: Record<string, string | number>
): Promise<Response> {
  // Delegate to the legacy adapter in api-utils.ts
  return legacyApiRequest(method, url, data, params);
}

/**
 * @deprecated Use getQueryFn from api-utils.ts instead
 */
export const getQueryFn: <TQueryFnData = unknown>(options: {
  on401: "returnNull" | "throw";
}) => QueryFunction<TQueryFnData> = (options) => {
  // Delegate to the getQueryFn in api-utils.ts with corrected parameter naming
  return apiUtilsGetQueryFn<TQueryFnData>({ 
    on401: options.on401 
  });
};

// Export the query client with memory-optimized configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use the getQueryFn from api-utils to ensure consistency
      queryFn: getQueryFn({ on401: "throw" }),
      ...defaultQueryOptions,
      
      // Optimize memory usage with better caching
      gcTime: 5 * 60 * 1000, // 5 minutes instead of default 5 minutes
      staleTime: 2 * 60 * 1000, // 2 minutes - reduce refetching
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnReconnect: 'always', // Only refetch on actual reconnects
      retry: 1 // Reduce retry attempts to save resources
      // Note: cacheTime was renamed to gcTime in React Query v5
    },
    mutations: {
      retry: false,
    },
  },
});
