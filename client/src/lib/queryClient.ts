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
export const getQueryFn: <T>(options: {
  on401: "returnNull" | "throw";
}) => QueryFunction<T> = (options) => {
  // Delegate to the getQueryFn in api-utils.ts
  return apiUtilsGetQueryFn<T>({ 
    unauthorized: options.on401 
  });
};

// Export the query client with the consolidated configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use the getQueryFn from api-utils to ensure consistency
      queryFn: getQueryFn({ on401: "throw" }),
      ...defaultQueryOptions
    },
    mutations: {
      retry: false,
    },
  },
});
