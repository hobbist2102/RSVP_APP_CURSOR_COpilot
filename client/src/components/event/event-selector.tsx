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
// Define a simplified type for WeddingEvent
interface WeddingEvent {
  id: number;
  title: string;
  date: string;
  coupleNames: string;
  brideName: string;
  groomName: string;
  location: string;
  description: string | null;
}
import { queryClient } from "@/lib/queryClient";
import { CalendarClock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function EventSelector() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch all events
  const { data: events = [], isLoading: eventsLoading } = useQuery<WeddingEvent[]>({
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
      
      // Set the current event in react-query cache
      queryClient.setQueryData(['/api/current-event'], events[0]);
    }
  }, [events, selectedEventId]);

  const handleEventChange = (value: string) => {
    // Set the selected event ID
    setSelectedEventId(value);
    
    // Find the selected event
    const selectedEvent = events.find(event => String(event.id) === value);
    
    if (selectedEvent) {
      // Set the current event in react-query cache
      queryClient.setQueryData(['/api/current-event'], selectedEvent);
      
      // Invalidate queries that depend on the current event ID
      queryClient.invalidateQueries({ queryKey: [`/api/events/${value}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${value}/guests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${value}/ceremonies`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${value}/accommodations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${value}/statistics`] });
      
      toast({
        title: "Event Changed",
        description: `Now viewing: ${selectedEvent.title}`,
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
                  <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
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