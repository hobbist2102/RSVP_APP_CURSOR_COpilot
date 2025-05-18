import React, { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import WhatsAppSetupStep from '@/components/wizard/WhatsAppSetupStep';

const WhatsAppSetupPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ eventId: string }>('/wizard/:eventId/whatsapp');
  
  // Get the current event ID
  const eventId = params?.eventId ? parseInt(params.eventId) : undefined;
  
  // Fetch event data
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['/api/current-event'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/current-event');
      return response.json();
    },
    enabled: !!user
  });
  
  // Redirect if no event is selected
  useEffect(() => {
    if (!eventLoading && !event && user) {
      setLocation('/dashboard');
    }
  }, [event, eventLoading, user, setLocation]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);
  
  // Handle "Save & Continue" action
  const handleComplete = () => {
    // Navigate to the next step in the wizard
    if (eventId) {
      setLocation(`/wizard/${eventId}/ai-assistant`);
    }
  };
  
  // Handle "Back" action
  const handleBack = () => {
    // Navigate to the previous step in the wizard
    if (eventId) {
      setLocation(`/wizard/${eventId}/transport`);
    }
  };
  
  // Loading state
  if (eventLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If no event is selected, don't render anything (will redirect)
  if (!event) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Event Setup Wizard: WhatsApp Integration</h1>
        
        <WhatsAppSetupStep 
          eventId={eventId || event.id} 
          onComplete={handleComplete} 
          onBack={handleBack} 
        />
      </div>
    </div>
  );
};

export default WhatsAppSetupPage;