import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-utils';
import { useCurrentEvent } from './use-current-event';

interface DashboardData {
  event: any;
  guests: any[];
  accommodations: any[];
  ceremonies: any[];
  statistics: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
    totalGuests: number;
    confirmedGuests: number;
    pendingGuests: number;
    accommodationCount: number;
    ceremonyCount: number;
  };
  isLoading: boolean;
}

export function useDashboardData() {
  const { currentEvent, isLoading: isLoadingEvent } = useCurrentEvent();
  const eventId = currentEvent?.id;

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/dashboard-data', eventId],
    queryFn: async () => {
      if (!eventId) {
        return {
          guests: [],
          accommodations: [],
          ceremonies: [],
        };
      }

      try {
        // Use Promise.all to fetch all data concurrently
        const [guestsResponse, accommodationsResponse, ceremoniesResponse] = await Promise.all([
          get(`/api/guests?eventId=${eventId}`),
          get(`/api/accommodations?eventId=${eventId}`),
          get(`/api/ceremonies?eventId=${eventId}`)
        ]);

        return {
          guests: guestsResponse.data || [],
          accommodations: accommodationsResponse.data || [],
          ceremonies: ceremoniesResponse.data || [],
        };
      } catch (error) {
        
        return {
          guests: [],
          accommodations: [],
          ceremonies: [],
        };
      }
    },
    enabled: !!eventId,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const isLoading = isLoadingEvent || isDashboardLoading;

  const guests = dashboardData?.guests || [];
  const accommodations = dashboardData?.accommodations || [];
  const ceremonies = dashboardData?.ceremonies || [];

  // Calculate statistics from guests data
  const statistics = {
    total: guests.length,
    confirmed: guests.filter((g: any) => g.rsvpStatus === 'confirmed').length,
    pending: guests.filter((g: any) => g.rsvpStatus === 'pending').length,
    declined: guests.filter((g: any) => g.rsvpStatus === 'declined').length,
    totalGuests: guests.length,
    confirmedGuests: guests.filter((g: any) => g.rsvpStatus === 'confirmed').length,
    pendingGuests: guests.filter((g: any) => g.rsvpStatus === 'pending').length,
    accommodationCount: accommodations.length,
    ceremonyCount: ceremonies.length,
  };

  return {
    event: currentEvent,
    guests,
    accommodations,
    ceremonies,
    statistics,
    isLoading,
  };
}