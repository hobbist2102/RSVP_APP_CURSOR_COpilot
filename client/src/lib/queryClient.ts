import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  params?: Record<string, string | number>
): Promise<Response> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Cache-Control": "no-cache"
  };
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add URL params if provided
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const searchParamsString = searchParams.toString();
    if (searchParamsString) {
      url += (url.includes('?') ? '&' : '?') + searchParamsString;
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle array query keys for passing event context and other parameters
    let url = queryKey[0] as string;
    
    // Check if there are query parameters to add
    if (queryKey.length > 1 && typeof queryKey[1] === 'object') {
      const params = queryKey[1] as Record<string, string | number>;
      const searchParams = new URLSearchParams();
      
      // Add all parameters to URL search params
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      // Append search params to URL if any exist
      const searchParamsString = searchParams.toString();
      if (searchParamsString) {
        url += (url.includes('?') ? '&' : '?') + searchParamsString;
      }
    }
    
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
