import React, { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import OAuthConfiguration from "@/components/settings/oauth-configuration";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { Cog, Mail, AtSign, MessageCircle, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";

export default function EventSettings() {
  const [activeTab, setActiveTab] = useState("oauth");
  const { currentEvent } = useCurrentEvent();
  const [_, setLocation] = useLocation();

  const handleBackToDashboard = () => {
    setLocation('/');
  };

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2" 
          onClick={handleBackToDashboard}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <div>
          <h2 className="text-3xl font-playfair font-bold text-neutral">
            Event Settings
          </h2>
          <p className="text-sm text-gray-500">
            Configure settings for {currentEvent?.title || "this event"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Event Configuration</CardTitle>
          <CardDescription>
            Manage event-specific settings like email, messaging, and OAuth connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="oauth" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="oauth">
                <Cog className="h-4 w-4 mr-2" /> OAuth
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="h-4 w-4 mr-2" /> Email
              </TabsTrigger>
              <TabsTrigger value="whatsapp">
                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
              </TabsTrigger>
              <TabsTrigger value="general">
                <Globe className="h-4 w-4 mr-2" /> General
              </TabsTrigger>
            </TabsList>

            <TabsContent value="oauth" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">OAuth Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure OAuth credentials for Gmail and Outlook integration
                  </p>
                  <Separator className="my-4" />
                  {currentEvent ? (
                    <OAuthConfiguration eventId={currentEvent.id} />
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      Loading event data...
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="mt-0">
              <div className="p-4 text-center border rounded-md">
                <h3 className="text-lg font-medium mb-2">Email Configuration</h3>
                <p className="text-muted-foreground">
                  Email configuration settings will be available soon
                </p>
              </div>
            </TabsContent>

            <TabsContent value="whatsapp" className="mt-0">
              <div className="p-4 text-center border rounded-md">
                <h3 className="text-lg font-medium mb-2">WhatsApp Configuration</h3>
                <p className="text-muted-foreground">
                  WhatsApp configuration settings will be available soon
                </p>
              </div>
            </TabsContent>

            <TabsContent value="general" className="mt-0">
              <div className="p-4 text-center border rounded-md">
                <h3 className="text-lg font-medium mb-2">General Settings</h3>
                <p className="text-muted-foreground">
                  General event settings will be available soon
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}