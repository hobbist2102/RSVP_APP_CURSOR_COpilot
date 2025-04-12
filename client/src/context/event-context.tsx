import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define the event interface
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
  primaryColor?: string | null;
  secondaryColor?: string | null;
  whatsappFrom?: string | null;
  // Add other properties as needed
}

// Define what the event context provides
interface EventContextType {
  currentEvent: CurrentEvent | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentEvent: (event: CurrentEvent) => Promise<void>;
  clearEventContext: () => void;
  isValidEventContext: boolean;
}

// Create the context with default values
const EventContext = createContext<EventContextType>({
  currentEvent: null,
  isLoading: false,
  error: null,
  setCurrentEvent: async () => {},
  clearEventContext: () => {},
  isValidEventContext: false,
});

// Create the provider component
export function EventContextProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isValidEventContext, setIsValidEventContext] = useState<boolean>(false);
  
  // Query to get the current event from server session
  const { 
    data: currentEvent, 
    isLoading, 
    error,
    refetch 
  } = useQuery<CurrentEvent>({
    queryKey: ['/api/current-event'],
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1, // Retry once in case of initial session setup
    onSettled: (data) => {
      if (data && 'id' in data) {
        console.log(`Event context loaded: ${data.title} (ID: ${data.id})`);
        setIsValidEventContext(true);
      } else {
        setIsValidEventContext(false);
      }
    }
  });
  
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
    }
  });
  
  // Helper function to set the current event both locally and on server
  const setCurrentEvent = async (event: CurrentEvent) => {
    try {
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
      
      // Force a refetch of all active queries after a short delay
      setTimeout(() => {
        queryClient.refetchQueries();
      }, 300);
    } catch (error) {
      console.error('EVENT CONTEXT: Error setting current event:', error);
      setIsValidEventContext(false);
      throw error;
    }
  };
  
  // Function to clear the event context
  const clearEventContext = () => {
    queryClient.setQueryData<CurrentEvent | null>(['/api/current-event'], null);
    setIsValidEventContext(false);
    console.log('EVENT CONTEXT: Cleared event context');
  };
  
  // Effect to validate event context when component mounts
  useEffect(() => {
    // Check if we have a valid event context on mount
    if (currentEvent && 'id' in currentEvent) {
      setIsValidEventContext(true);
    } else {
      setIsValidEventContext(false);
    }
  }, [currentEvent]);
  
  return (
    <EventContext.Provider
      value={{
        currentEvent: currentEvent || null,
        isLoading,
        error: error as Error | null,
        setCurrentEvent,
        clearEventContext,
        isValidEventContext,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

// Hook to use the event context
export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventContextProvider');
  }
  return context;
}