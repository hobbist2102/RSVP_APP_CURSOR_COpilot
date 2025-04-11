import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useCurrentEvent, type CurrentEvent } from "@/hooks/use-current-event";
import { CalendarClock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";

export function EventSelector() {
  const { currentEvent, setCurrentEvent } = useCurrentEvent();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    currentEvent ? String(currentEvent.id) : null
  );

  // Fetch all events
  const { data: events = [], isLoading: eventsLoading } = useQuery<CurrentEvent[]>({
    queryKey: ['/api/events'],
    staleTime: 60 * 60 * 1000, // 1 hour
    select: (data) => {
      if (!Array.isArray(data)) return [];
      return data;
    }
  });
  
  // When events are loaded, select the first event by default if none is selected
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      const firstEventId = String(events[0].id);
      setSelectedEventId(firstEventId);
      
      // Set the current event in react-query cache using our hook
      setCurrentEvent(events[0]);
    }
  }, [events, selectedEventId, setCurrentEvent]);

  const handleEventChange = async (value: string) => {
    try {
      // Set the selected event ID
      setSelectedEventId(value);
      
      // Find the selected event
      const selectedEvent = events.find(event => String(event.id) === value);
      
      if (selectedEvent) {
        // Call the server to set the current event in session
        await fetch('/api/current-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            eventId: selectedEvent.id
          })
        });
        
        // Set the current event using our hook
        setCurrentEvent(selectedEvent);
        
        // More aggressively invalidate all relevant queries to force fresh data for the new event
        
        // First, invalidate the specific guest list for this event
        queryClient.invalidateQueries({
          queryKey: [`/api/events/${selectedEvent.id}/guests`]
        });
        
        // Then invalidate ALL guest-related queries to prevent stale/mismatched data 
        queryClient.invalidateQueries({
          queryKey: ['/api/guests']
        });
        
        // Force refetch to ensure the latest data
        queryClient.refetchQueries({
          queryKey: [`/api/events/${selectedEvent.id}/guests`]
        });
        
        toast({
          title: "Event Changed",
          description: `Now viewing: ${selectedEvent.title}`,
        });
      }
    } catch (error) {
      console.error("Error changing event:", error);
      toast({
        variant: "destructive",
        title: "Error Changing Event",
        description: "There was a problem switching events. Please try again."
      });
    }
  };

  if (eventsLoading) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-sm text-gray-500">
        <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
        Loading events...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-2 px-3">
        No events available
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-2 py-2">
      <CalendarClock className="h-5 w-5 text-secondary" />
      <div className="flex-1 min-w-[200px]">
        <Select
          value={selectedEventId || undefined}
          onValueChange={handleEventChange}
        >
          <SelectTrigger className="bg-white/80 border-secondary/30 hover:border-secondary">
            <SelectValue placeholder="Select Event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem 
                key={event.id} 
                value={String(event.id)}
                className="py-2 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-xs text-gray-500">{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default EventSelector;