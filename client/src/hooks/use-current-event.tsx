import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export interface CurrentEvent {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  coupleNames: string;
  brideName: string;
  groomName: string;
  location: string;
  description?: string;
  // Email Communication Settings
  emailFrom?: string;
  emailReplyTo?: string;
  useGmail?: boolean;
  useOutlook?: boolean;
  useSendGrid?: boolean;
  // Gmail settings
  gmailClientId?: string;
  gmailClientSecret?: string;
  gmailRedirectUri?: string;
  gmailAccount?: string;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  gmailTokenExpiry?: Date;
  // Outlook settings
  outlookClientId?: string;
  outlookClientSecret?: string;
  outlookRedirectUri?: string;
  outlookAccount?: string;
  outlookAccessToken?: string;
  outlookRefreshToken?: string;
  outlookTokenExpiry?: Date;
  // SendGrid settings
  sendGridApiKey?: string;
  // WhatsApp settings
  whatsappBusinessNumber?: string;
}

export function useCurrentEvent() {
  // Query to get the current event from server session
  const { 
    data: currentEvent, 
    isLoading,
    refetch: refetchCurrentEvent 
  } = useQuery<CurrentEvent>({
    queryKey: ['/api/current-event'],
    staleTime: 30 * 1000, // 30 seconds - reduced from 1 hour to catch changes more quickly
    retry: 1, // Retry once in case of initial session setup
  });
  
  // Get the currently selected event ID
  const currentEventId = currentEvent?.id;
  
  // Mutation to set the current event on the server
  const setCurrentEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest("POST", "/api/current-event", { eventId });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to set current event' }));
        throw new Error(errorData.message || 'Failed to set current event');
      }
      return await response.json();
    }
  });
  
  // Helper function to set the current event both locally and on server
  const setCurrentEvent = async (event: CurrentEvent) => {
    console.log(`EVENT SWITCH: Switching to event ID: ${event.id} (${event.title})`);
    
    try {
      // First, update the server-side session
      console.log('EVENT SWITCH: Saving to server session...');
      const updatedEvent = await setCurrentEventMutation.mutateAsync(event.id);
      console.log('EVENT SWITCH: Successfully saved event to server session:', event.id);
      
      // After successful server update, clear the client cache
      console.log('EVENT SWITCH: Before clearing - Query cache keys:', 
        queryClient.getQueryCache().getAll().map(query => query.queryKey));
        
      // Clear all query cache to ensure no stale data remains
      queryClient.clear();
      console.log('EVENT SWITCH: After clearing - Query cache is now empty');
      
      // Set the updated event from server in the cache
      queryClient.setQueryData(['/api/current-event'], updatedEvent);
      console.log('EVENT SWITCH: Set current event in cache:', updatedEvent.id);
      
      // Invalidate and prefetch key queries for the new event context
      console.log('EVENT SWITCH: Starting query invalidations for event:', event.id);
      
      // Make sure these query keys match exactly what's used in components
      await Promise.all([
        // Invalidate general event queries
        queryClient.invalidateQueries({ queryKey: ['/api/events'] }),
        
        // Invalidate the current event query
        queryClient.invalidateQueries({ queryKey: ['/api/current-event'] }),
        
        // Invalidate all event-specific queries with proper format
        queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/guests`] }),
        queryClient.invalidateQueries({ queryKey: ['guests', event.id] }), // Match the key format in use-guests-by-event.tsx
        queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/ceremonies`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/accommodations`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/statistics`] })
      ]);
      
      console.log('EVENT SWITCH: All relevant queries invalidated for new event context');
      
      // Force a refetch of the current event to ensure it's up to date
      await refetchCurrentEvent();
      
      console.log('EVENT SWITCH: Forcing refetch of all active queries');
      await queryClient.refetchQueries({ type: 'active' });
      
      return updatedEvent;
    } catch (error) {
      console.error('EVENT SWITCH: Error during event switch:', error);
      throw error;
    }
  };
  
  return {
    currentEvent,
    currentEventId,
    isLoading,
    setCurrentEvent,
    refetchCurrentEvent
  };
}