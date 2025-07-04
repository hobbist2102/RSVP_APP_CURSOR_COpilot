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
import { formatDateForDisplay } from "@/lib/date-utils";
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
  
  // When events are loaded, preserve the current event or select one if none exists
  useEffect(() => {
    // Only set an event if we have events and no current selection
    if (events.length > 0 && !selectedEventId && !currentEvent) {
      // Check for recently used events
      
      // Check if the URL has an event query parameter
      const searchParams = new URLSearchParams(window.location.search);
      const urlEventId = searchParams.get('eventId');
      
      // If we have a URL parameter, use that event
      if (urlEventId && events.find(e => String(e.id) === urlEventId)) {
        // Using event ID from URL
        const selectedEvent = events.find(e => String(e.id) === urlEventId);
        setSelectedEventId(urlEventId);
        if (selectedEvent) {
          setCurrentEvent(selectedEvent);
        }
      } 
      // Otherwise, try to use preferred event ID 4 ("Rocky Rani")
      else if (events.find(e => e.id === 4)) {
        // Using preferred event: Rocky Rani (ID: 4)
        const rockyRaniEvent = events.find(e => e.id === 4);
        setSelectedEventId("4");
        if (rockyRaniEvent) {
          setCurrentEvent(rockyRaniEvent);
        }
      }
      // Otherwise use first available
      else {
        // Falling back to the first available event
        const firstEventId = String(events[0].id);
        setSelectedEventId(firstEventId);
        setCurrentEvent(events[0]);
      }
    } else if (currentEvent && !selectedEventId) {
      // If we have a current event but no selected ID, sync them
      // Syncing selectedEventId with current event
      setSelectedEventId(String(currentEvent.id));
    }
  }, [events, selectedEventId, setCurrentEvent, currentEvent]);

  const handleEventChange = async (value: string) => {
    try {
      // Set the selected event ID in local state
      setSelectedEventId(value);
      
      // Find the selected event from the events list
      const selectedEvent = events.find(event => String(event.id) === value);
      
      if (selectedEvent) {
        // Switching to selected event
        
        // Show loading toast
        toast({
          title: "Switching Events",
          description: `Loading ${selectedEvent.title}...`,
        });
        
        // Use the improved setCurrentEvent function that properly syncs with the server
        // and handles all the cache invalidation and refetching
        await setCurrentEvent(selectedEvent);
        
        // Show success toast
        toast({
          title: "Event Changed",
          description: `Now viewing: ${selectedEvent.title}`,
        });
        
        // Instead of a hard page reload, we'll force a URL-based navigation
        // This preserves the React app state but ensures route-level component remounting
        const currentPath = window.location.pathname;
        
        if (currentPath === '/') {
          // If we're on the dashboard already, navigate to it with a timestamp
          // parameter to force React to treat it as a new navigation
          window.history.pushState({}, '', `/?ts=${Date.now()}`);
          // Dispatch a popstate event to trigger route update
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
          // If we're on another page, navigate to the dashboard
          window.location.href = '/';
        }
      }
    } catch (error) {
      // Handle error when changing events
      
      // Reset the selected event ID to match the current event
      if (currentEvent) {
        setSelectedEventId(String(currentEvent.id));
      }
      
      toast({
        variant: "destructive",
        title: "Error Changing Event",
        description: "There was a problem switching events. Please try again."
      });
    }
  };

  if (eventsLoading) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-sm text-muted-foreground">
        <div className="animate-spin h-4 w-4 border-2 border-accent rounded-full border-t-transparent"></div>
        Loading events...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-between gap-2 py-2 px-3">
        <span className="text-sm text-muted-foreground">No events found</span>
        <a 
          href="/event-setup-wizard"
          className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
        >
          Create Event
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-2 py-1">
      <CalendarClock className="h-4 w-4 text-accent flex-shrink-0" />
      <div className="flex-1 min-w-0 max-w-[280px]">
        <Select
          value={selectedEventId || undefined}
          onValueChange={handleEventChange}
        >
          <SelectTrigger className="bg-background border-border hover:border-accent text-sm h-8 overflow-hidden flat">
            <SelectValue placeholder="Select Event" className="truncate" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border flat">
            {events.map((event) => (
              <SelectItem 
                key={event.id} 
                value={String(event.id)}
                className="py-2 cursor-pointer hover:bg-accent/10"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate text-sm text-foreground">{event.title}</span>
                  <span className="text-xs text-muted-foreground truncate">{formatDateForDisplay(event.startDate)} - {formatDateForDisplay(event.endDate)}</span>
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