import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCurrentEvent, type CurrentEvent } from "@/hooks/use-current-event";
import { CalendarClock, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * EventSelector component
 * 
 * Provides a UI to select and switch between different events (tenants)
 * while maintaining proper tenant context management.
 */
export function EventSelector() {
  const { toast } = useToast();
  const { 
    currentEvent, 
    setCurrentEvent,
    hasPermission,
    isValidEventContext
  } = useCurrentEvent();
  
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
    // Only proceed if we have events to work with
    if (events.length === 0) return;
    
    // If we have a current event but no selected ID, sync them
    if (currentEvent && !selectedEventId) {
      console.log(`Syncing selectedEventId with current event: ${currentEvent.title} (ID: ${currentEvent.id})`);
      setSelectedEventId(String(currentEvent.id));
      return;
    }
    
    // Only auto-select an event if we have events and no current selection
    if (!selectedEventId && !currentEvent) {
      console.log("No event currently selected, finding a suitable event...");
      
      // Check if the URL has an event query parameter
      const searchParams = new URLSearchParams(window.location.search);
      const urlEventId = searchParams.get('eventId');
      
      // Priority 1: If we have a URL parameter, use that event
      if (urlEventId && events.find(e => String(e.id) === urlEventId)) {
        console.log(`Using event ID from URL: ${urlEventId}`);
        const selectedEvent = events.find(e => String(e.id) === urlEventId);
        setSelectedEventId(urlEventId);
        if (selectedEvent) {
          setCurrentEvent(selectedEvent);
        }
      }
      // Priority 2: Use the first event
      else {
        console.log(`Using first available event: ${events[0].title} (ID: ${events[0].id})`);
        const firstEventId = String(events[0].id);
        setSelectedEventId(firstEventId);
        setCurrentEvent(events[0]);
      }
    }
  }, [events, selectedEventId, setCurrentEvent, currentEvent]);

  /**
   * Handle event change initiated by the user
   * This function manages tenant switching with proper context management
   */
  const handleEventChange = async (value: string) => {
    try {
      // Only proceed if the selection has changed
      if (selectedEventId === value) return;
      
      // Set the selected event ID
      setSelectedEventId(value);
      
      // Find the selected event
      const selectedEvent = events.find(event => String(event.id) === value);
      
      if (selectedEvent) {
        console.log(`EVENT SELECTOR: Switching to event ID: ${selectedEvent.id} (${selectedEvent.title})`);
        
        // Use the enhanced setCurrentEvent function which handles:
        // - Cache clearing
        // - Server-side session update
        // - Query invalidation
        await setCurrentEvent(selectedEvent);
        
        // Show toast notifying the user - NOTE: The setCurrentEvent already shows a toast,
        // but we'll keep this for clarity and in case we want to customize it further
        toast({
          title: "Event Changed",
          description: `Now viewing: ${selectedEvent.title}`,
        });
        
        // Hard reload the page after switching events
        // This ensures a completely fresh state
        console.log("EVENT SELECTOR: Forcing page reload for complete context reset");
        
        // Slight delay to ensure toast is shown and server request completes
        setTimeout(() => {
          window.location.href = window.location.pathname;
        }, 800);
      }
    } catch (error) {
      console.error("Error changing event:", error);
      
      // Reset selectedEventId to current event on error
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

  // Loading state
  if (eventsLoading) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-sm text-gray-500">
        <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
        Loading events...
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-2 px-3">
        No events available
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-2 py-2">
      {/* Event context status indicator */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            {isValidEventContext ? (
              hasPermission ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Lock className="h-5 w-5 text-amber-500" />
              )
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isValidEventContext
            ? hasPermission
              ? "Event context valid with full access"
              : "Event context valid with limited access"
            : "No valid event context"}
        </TooltipContent>
      </Tooltip>

      {/* Event icon */}
      <CalendarClock className="h-5 w-5 text-secondary" />
      
      {/* Event selector dropdown */}
      <div className="flex-1 min-w-[200px]">
        <Select
          value={selectedEventId || undefined}
          onValueChange={handleEventChange}
        >
          <SelectTrigger 
            className={`bg-white/80 border-secondary/30 hover:border-secondary ${
              !isValidEventContext ? 'border-rose-300' : 
              !hasPermission ? 'border-amber-300' : ''
            }`}
          >
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