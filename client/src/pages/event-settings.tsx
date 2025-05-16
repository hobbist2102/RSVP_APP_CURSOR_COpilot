import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { useQuery } from "@tanstack/react-query";
import OAuthConfiguration from "@/components/settings/oauth-configuration";
import RsvpSettings from "@/components/settings/rsvp-settings";
import TravelAccommodationSettings from "@/components/settings/travel-accommodation-settings";
import { 
  Loader2,
  AlertCircle,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EventSettings() {
  const [activeTab, setActiveTab] = useState("oauth");
  const { currentEvent, isLoading: isLoadingEvent } = useCurrentEvent();
  const [_, setLocation] = useLocation();
  
  // Fetch event settings from the unified API endpoint
  const { 
    data: eventSettings, 
    isLoading: isLoadingSettings,
    error: settingsError 
  } = useQuery({
    queryKey: [`/api/event-settings/${currentEvent?.id}/settings`],
    enabled: !!currentEvent?.id,
  });

  // Handle loading state
  if (isLoadingEvent || isLoadingSettings) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading event settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Handle error state
  if (settingsError) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load event settings. Please try again later.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => setLocation("/dashboard")}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Return to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-playfair font-bold text-neutral">Event Settings</h2>
          <p className="text-sm text-gray-500">
            Manage settings for {currentEvent?.title || "your event"}
          </p>
        </div>
        <Button 
          onClick={() => setLocation(`/event-setup-wizard/${currentEvent?.id}`)}
          className="flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Setup Wizard
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl mb-8">
          <TabsTrigger value="oauth">Email & OAuth</TabsTrigger>
          <TabsTrigger value="rsvp">RSVP Settings</TabsTrigger>
          <TabsTrigger value="travel">Travel & Accommodation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="oauth" className="space-y-4">
          <OAuthConfiguration 
            settings={eventSettings?.settings?.oauth} 
            eventId={currentEvent?.id}
          />
        </TabsContent>
        
        <TabsContent value="rsvp" className="space-y-4">
          <RsvpSettings 
            settings={eventSettings?.settings?.rsvp} 
            eventId={currentEvent?.id}
          />
        </TabsContent>
        
        <TabsContent value="travel" className="space-y-4">
          <TravelAccommodationSettings 
            settings={eventSettings?.settings?.travelAccommodation} 
            eventId={currentEvent?.id}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}