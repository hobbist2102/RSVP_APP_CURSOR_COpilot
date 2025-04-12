import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced CurrentEvent interface to match server-side WeddingEvent
 * 
 * This interface represents a wedding event (tenant) in the system
 * and is used for the event context throughout the application.
 */
export interface CurrentEvent {
  id: number;
  title: string;
  coupleNames: string;
  brideName: string;
  groomName: string;
  startDate: string;
  endDate: string;
  location: string;
  description?: string | null;
  date?: string | null; // Keeping for backward compatibility
  
  // Tenant-specific configuration
  primaryColor?: string | null;
  secondaryColor?: string | null;
  
  // Email config
  emailProvider?: string | null;
  emailApiKey?: string | null;
  emailFromAddress?: string | null;
  emailFromDomain?: string | null;
  emailConfigured?: boolean;
  
  // WhatsApp config
  whatsappBusinessPhoneId?: string | null;
  whatsappBusinessNumber?: string | null;
  whatsappBusinessAccountId?: string | null;
  whatsappAccessToken?: string | null;
  whatsappFrom?: string | null;
  whatsappConfigured?: boolean;
  
  // Metadata
  createdBy: number;
  
  // Permission flag - will be added by server
  hasPermission?: boolean;
}

/**
 * Type guard to check if an object is a valid CurrentEvent
 */
function isCurrentEvent(obj: any): obj is CurrentEvent {
  return obj !== null && 
         typeof obj === 'object' && 
         typeof obj.id === 'number' && 
         typeof obj.title === 'string';
}

/**
 * The event context interface exposes event state and methods
 * for the rest of the application to consume
 */
interface EventContextType {
  currentEvent: CurrentEvent | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentEvent: (event: CurrentEvent) => Promise<void>;
  clearEventContext: () => void;
  isValidEventContext: boolean;
  hasPermission: boolean;
}

// Create the context with default values
const EventContext = createContext<EventContextType>({
  currentEvent: null,
  isLoading: false,
  error: null,
  setCurrentEvent: async () => {},
  clearEventContext: () => {},
  isValidEventContext: false,
  hasPermission: false,
});

/**
 * EventContextProvider manages the tenant context on the client-side
 * and synchronizes it with the server-side tenant context.
 */
export function EventContextProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isValidEventContext, setIsValidEventContext] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  
  // Query options with proper typings for TanStack Query v5
  const queryOptions: UseQueryOptions<CurrentEvent | null, Error> = {
    queryKey: ['/api/current-event'],
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1, // Retry once in case of initial session setup
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  };

  // Query to get the current event from server session
  const { 
    data: currentEvent, 
    isLoading, 
    error,
    refetch 
  } = useQuery<CurrentEvent | null, Error>(queryOptions);
  
  // Effect to handle successful data fetching (replacing onSuccess since it's not available in v5)
  useEffect(() => {
    if (currentEvent && isCurrentEvent(currentEvent)) {
      console.log(`Event context loaded: ${currentEvent.title} (ID: ${currentEvent.id})`);
      setIsValidEventContext(true);
      
      // Capture permission from the server response if available
      setHasPermission(!!currentEvent.hasPermission);
    } else {
      setIsValidEventContext(false);
      setHasPermission(false);
    }
  }, [currentEvent]);
  
  // Effect to handle error state (replacing onError)
  useEffect(() => {
    if (error) {
      setIsValidEventContext(false);
      setHasPermission(false);
    }
  }, [error]);
  
  // Mutation to set the current event on the server
  const setCurrentEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      console.log(`Setting current event to ID: ${eventId}`);
      const response = await apiRequest("POST", "/api/current-event", { eventId });
      return response.json();
    },
    onError: (error: Error) => {
      console.error("Failed to set current event:", error);
      toast({
        title: "Error Setting Event",
        description: error.message,
        variant: "destructive",
      });
      setIsValidEventContext(false);
      setHasPermission(false);
    }
  });
  
  /**
   * Helper function to set the current event both locally and on server
   * This function handles:
   * 1. Cache clearing to prevent stale data
   * 2. Local state updates for responsive UI
   * 3. Server-side session updates
   * 4. Query invalidation to refresh relevant data
   */
  const setCurrentEvent = async (event: CurrentEvent) => {
    try {
      if (!isCurrentEvent(event)) {
        throw new Error('Invalid event object');
      }
      
      console.log(`EVENT CONTEXT: Switching to event ID: ${event.id} (${event.title})`);
      
      // Log the current state of the query cache
      console.log('EVENT CONTEXT: Before clearing - Query cache keys:', 
        queryClient.getQueryCache().getAll().map(query => query.queryKey));
      
      // First, clear the cache to prevent stale data from appearing
      queryClient.clear();
      console.log('EVENT CONTEXT: After clearing - Query cache is now empty');
      
      // Update local cache immediately for responsive UI
      queryClient.setQueryData<CurrentEvent>(['/api/current-event'], event);
      setIsValidEventContext(true);
      
      // Save to server session
      await setCurrentEventMutation.mutateAsync(event.id);
      console.log('EVENT CONTEXT: Event set in server session');
      
      // Notify the user
      toast({
        title: "Event Changed",
        description: `Now viewing: ${event.title}`,
      });
      
      // Invalidate all event-specific queries
      invalidateEventQueries(event.id);
      
      // Force a refetch of all active queries after a short delay
      setTimeout(() => {
        queryClient.refetchQueries();
      }, 300);
    } catch (error) {
      console.error('EVENT CONTEXT: Error setting current event:', error);
      setIsValidEventContext(false);
      setHasPermission(false);
      throw error;
    }
  };
  
  /**
   * Helper function to invalidate all queries related to a specific event
   */
  const invalidateEventQueries = (eventId: number) => {
    console.log(`EVENT CONTEXT: Invalidating queries for event ${eventId}`);
    
    // Invalidate specific event routes
    const eventSpecificRoutes = [
      `/api/events/${eventId}`,
      `/api/events/${eventId}/guests`,
      `/api/events/${eventId}/ceremonies`,
      `/api/events/${eventId}/accommodations`,
      `/api/events/${eventId}/statistics`,
      `/api/events/${eventId}/meals`,
      `/api/events/${eventId}/whatsapp`,
      `/api/events/${eventId}/templates`,
    ];
    
    // Invalidate each specific route
    eventSpecificRoutes.forEach(route => {
      queryClient.invalidateQueries({ queryKey: [route] });
    });
    
    // Invalidate general routes that might contain event data
    const generalRoutes = [
      '/api/events',
      '/api/guests',
      '/api/ceremonies',
      '/api/accommodations',
      '/api/meals',
    ];
    
    // Invalidate each general route
    generalRoutes.forEach(route => {
      queryClient.invalidateQueries({ queryKey: [route] });
    });
    
    console.log('EVENT CONTEXT: All relevant queries invalidated');
  };
  
  /**
   * Function to clear the event context
   * Used when logging out or when we need to reset the event context
   */
  const clearEventContext = async () => {
    try {
      // Clear the local cache
      queryClient.setQueryData<CurrentEvent | null>(['/api/current-event'], null);
      setIsValidEventContext(false);
      setHasPermission(false);
      
      // Clear the server-side session
      await apiRequest("DELETE", "/api/current-event");
      
      console.log('EVENT CONTEXT: Cleared event context');
      
      // Clear the cache to prevent stale data
      queryClient.clear();
      
      // Invalidate queries to ensure fresh data when a new event is selected
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      
    } catch (error) {
      console.error('EVENT CONTEXT: Error clearing event context:', error);
    }
  };
  
  return (
    <EventContext.Provider
      value={{
        currentEvent: isCurrentEvent(currentEvent) ? currentEvent : null,
        isLoading,
        error: error || null,
        setCurrentEvent,
        clearEventContext,
        isValidEventContext,
        hasPermission,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

/**
 * Hook to use the event context throughout the application
 * This is the primary way for components to access the current tenant
 */
export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventContextProvider');
  }
  return context;
}