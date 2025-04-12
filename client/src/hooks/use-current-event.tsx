import { useEventContext, type CurrentEvent } from "@/context/event-context";

/**
 * Hook for using the current event (tenant) context throughout the application
 * This is a simplified wrapper around useEventContext for backward compatibility
 */
export function useCurrentEvent() {
  const { 
    currentEvent, 
    currentEventId, 
    isLoading, 
    error,
    hasPermission,
    setCurrentEvent, 
    clearEventContext,
    isValidEventContext
  } = useContextWithFallback();
  
  return {
    currentEvent,
    currentEventId,
    isLoading,
    error,
    hasPermission,
    setCurrentEvent,
    clearEventContext,
    isValidEventContext
  };
}

/**
 * Internal function that provides backward compatibility
 * while also adding some derived properties for convenience
 */
function useContextWithFallback() {
  // Use the event context
  const context = useEventContext();
  
  // Add currentEventId property for backward compatibility and convenience
  const currentEventId = context.currentEvent?.id;
  
  return {
    ...context,
    currentEventId
  };
}

// Re-export the CurrentEvent type for backward compatibility
export type { CurrentEvent } from "@/context/event-context";