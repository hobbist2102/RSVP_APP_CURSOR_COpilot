import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import EmailTemplateEditor from "@/components/email/email-template-editor";
import EmailStyleEditor from "@/components/email/email-style-editor";
import EmailAssetManager from "@/components/email/email-asset-manager";
import EmailSignatureEditor from "@/components/email/email-signature-editor";

export default function EmailTemplatesPage() {
  const [activeTab, setActiveTab] = useState("templates");

  // Get current event ID
  const { data: currentEvent, isLoading } = useQuery({
    queryKey: ['/api/current-event'],
    queryFn: async () => {
      const res = await fetch('/api/current-event');
      if (!res.ok) throw new Error('Failed to fetch current event');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!currentEvent || !currentEvent.id) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Event Selected</h2>
          <p className="text-muted-foreground">
            Please create or select an event to manage email templates.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  const eventId = currentEvent.id;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Email Templates</h1>
          <p className="text-muted-foreground">
            Create and manage email templates, styles, assets, and signatures for your event communications.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="styles">Styles</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="signatures">Signatures</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <EmailTemplateEditor eventId={eventId} />
          </TabsContent>

          <TabsContent value="styles" className="space-y-4">
            <EmailStyleEditor eventId={eventId} />
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <EmailAssetManager eventId={eventId} />
          </TabsContent>

          <TabsContent value="signatures" className="space-y-4">
            <EmailSignatureEditor eventId={eventId} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}