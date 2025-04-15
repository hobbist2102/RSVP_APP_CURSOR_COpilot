import { useEffect, useState } from "react";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Settings, Mail, MessageSquare, AlertCircle } from "lucide-react";
import OAuthConfiguration from "@/components/settings/oauth-configuration";
import { 
  Alert,
  AlertTitle,
  AlertDescription 
} from "@/components/ui/alert";
import { useLocation } from "wouter";

export default function EventSettings() {
  const { currentEvent, isLoading, refetchCurrentEvent } = useCurrentEvent();
  const [activeTab, setActiveTab] = useState<string>("oauth");
  const [_, navigate] = useLocation();

  // If no event is selected, prompt user to choose one
  useEffect(() => {
    if (!isLoading && !currentEvent) {
      navigate("/");
    }
  }, [currentEvent, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-lg">Loading settings...</span>
      </div>
    );
  }

  // Error state handling removed since the hook doesn't provide error

  if (!currentEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Event Selected</AlertTitle>
          <AlertDescription>
            Please select an event from the dropdown menu to manage settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
          <Settings className="mr-2 h-8 w-8 text-primary" /> Event Settings
        </h1>
        <p className="text-muted-foreground">
          Configure settings for <span className="font-medium text-foreground">{currentEvent.title}</span>
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:w-auto">
          <TabsTrigger value="oauth" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            Email OAuth
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oauth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email OAuth Configuration</CardTitle>
              <CardDescription>
                Configure OAuth credentials for Gmail and Outlook to send emails directly from your authorized accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentEvent && (
                <OAuthConfiguration eventId={currentEvent.id} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business API Configuration</CardTitle>
              <CardDescription>
                Configure WhatsApp Business API credentials for sending messages to guests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  WhatsApp Business API configuration will be available in a future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general settings for this event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  General settings configuration will be available in a future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}