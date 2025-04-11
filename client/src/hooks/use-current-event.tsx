import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

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
  const { data: currentEvent } = useQuery<CurrentEvent>({
    queryKey: ['/api/current-event'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });
  
  // Get the currently selected event ID
  const currentEventId = currentEvent?.id;
  
  // Helper function to set the current event
  const setCurrentEvent = (event: CurrentEvent) => {
    queryClient.setQueryData(['/api/current-event'], event);
    
    // Invalidate related queries
    queryClient.invalidateQueries({ 
      queryKey: [`/api/events/${event.id}`] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [`/api/events/${event.id}/guests`] 
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
  };
  
  return {
    currentEvent,
    currentEventId,
    setCurrentEvent
  };
}