import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertWeddingEvent } from "@shared/schema";

export function useEvents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentEventId, setCurrentEventId] = useState<number | null>(null);

  // Get all events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/events'],
  });

  // Get current event details
  const { data: currentEvent, isLoading: isLoadingCurrentEvent } = useQuery({
    queryKey: ['/api/events', currentEventId],
    enabled: !!currentEventId,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: InsertWeddingEvent) => {
      const response = await apiRequest("POST", "/api/events", eventData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      
      toast({
        title: "Event Created",
        description: "The wedding event has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to Create Event",
        description: error instanceof Error ? error.message : "An error occurred while creating the event.",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertWeddingEvent> }) => {
      const response = await apiRequest("PUT", `/api/events/${id}`, data);
      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', variables.id] });
      
      toast({
        title: "Event Updated",
        description: "The wedding event has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to Update Event",
        description: error instanceof Error ? error.message : "An error occurred while updating the event.",
      });
    },
  });

  // Get ceremonies for an event
  const getCeremonies = (eventId: number) => {
    return useQuery({
      queryKey: [`/api/events/${eventId}/ceremonies`],
      enabled: !!eventId,
    });
  };

  return {
    events,
    isLoadingEvents,
    currentEvent,
    isLoadingCurrentEvent,
    setCurrentEventId,
    createEvent: createEventMutation.mutate,
    isCreatingEvent: createEventMutation.isPending,
    updateEvent: updateEventMutation.mutate,
    isUpdatingEvent: updateEventMutation.isPending,
    getCeremonies,
  };
}
