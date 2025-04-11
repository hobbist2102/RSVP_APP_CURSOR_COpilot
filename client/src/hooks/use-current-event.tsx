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
}

export function useCurrentEvent() {
  // Query to get the current event from server session
  const { data: currentEvent, isLoading } = useQuery<CurrentEvent>({
    queryKey: ['/api/current-event'],
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1, // Retry once in case of initial session setup
  });
  
  // Get the currently selected event ID
  const currentEventId = currentEvent?.id;
  
  // Mutation to set the current event on the server
  const setCurrentEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest("POST", "/api/current-event", { eventId });
      return response.json();
    }
  });
  
  // Helper function to set the current event both locally and on server
  const setCurrentEvent = async (event: CurrentEvent) => {
    console.log(`Switching to event ID: ${event.id} (${event.title})`);
    
    // First, remove all related guest data from the cache to prevent incorrect display of guests
    // This line is key to fixing the issue with guests appearing in wrong events
    queryClient.clear();
    
    // Update local cache immediately for responsive UI
    queryClient.setQueryData(['/api/current-event'], event);
    
    // Save to server session
    await setCurrentEventMutation.mutateAsync(event.id);
    
    // Invalidate related queries to force data refresh
    queryClient.invalidateQueries({ 
      queryKey: [`/api/events/${event.id}`] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [`/api/events/${event.id}/guests`] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['/api/events'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['guests'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [`/api/events/${event.id}/ceremonies`] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [`/api/events/${event.id}/accommodations`] 
    });
    queryClient.invalidateQueries({
      queryKey: [`/api/events/${event.id}/statistics`] 
    });
    
    console.log('Query cache cleared and relevant queries invalidated for new event context');
  };
  
  return {
    currentEvent,
    currentEventId,
    isLoading,
    setCurrentEvent
  };
}