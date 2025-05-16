/**
 * Centralized API utilities for consistent request handling
 */
import { QueryFunction, UseQueryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Error handler that extracts message from API responses
 */
export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Builds a URL with query parameters
 */
export function buildUrl(baseUrl: string, params?: Record<string, string | number>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const searchParamsString = searchParams.toString();
  if (searchParamsString) {
    return baseUrl + (baseUrl.includes('?') ? '&' : '?') + searchParamsString;
  }
  
  return baseUrl;
}

interface ApiRequestOptions {
  method: string;
  url: string;
  data?: unknown;
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
  returnRaw?: boolean;
}

/**
 * Standard API request function
 * @returns The parsed JSON response or raw Response if returnRaw is true
 */
export async function apiRequest<T = any>({
  method,
  url,
  data,
  params,
  headers = {},
  returnRaw = false
}: ApiRequestOptions): Promise<T | Response> {
  const requestHeaders: Record<string, string> = {
    "Accept": "application/json",
    "Cache-Control": "no-cache",
    ...headers
  };
  
  if (data && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }
  
  const fullUrl = buildUrl(url, params);
  
  const res = await fetch(fullUrl, {
    method,
    headers: requestHeaders,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  if (returnRaw) {
    return res;
  }
  
  return await res.json() as T;
}

/**
 * Hook to use standardized API mutations with consistent error handling
 */
export function useApiMutation<TData = unknown, TVariables = unknown>({
  mutationFn,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  invalidateQueries,
  ...options
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[];
  options?: any;
}) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error: Error, variables) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage || error.message,
      });
      
      if (onError) {
        onError(error, variables);
      }
    },
    ...options
  });
}

// Type for unified query behavior options
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Creates a query function for TanStack Query
 */
export function createQueryFn<T>({ on401 = "throw" as UnauthorizedBehavior } = {}): QueryFunction<T> {
  return async ({ queryKey }) => {
    // Handle array query keys
    const [url, params] = queryKey;
    
    try {
      return await apiRequest<T>({
        method: "GET",
        url: url as string,
        params: typeof params === 'object' ? params : undefined,
      });
    } catch (error) {
      if (on401 === "returnNull" && error instanceof Error && error.message.startsWith("401:")) {
        return null as unknown as T;
      }
      throw error;
    }
  };
}

/**
 * Hook for standardized data fetching with query
 */
export function useApiQuery<TData>(
  queryKey: unknown[],
  options?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'> & {
    on401?: UnauthorizedBehavior;
  }
) {
  const { on401 = "throw", ...queryOptions } = options || {};
  
  return useQuery<TData, Error>({
    queryKey,
    queryFn: createQueryFn<TData>({ on401 }),
    ...queryOptions,
  });
}