/**
 * Examples Page
 * 
 * This page showcases the consolidated utilities and components
 * that have been standardized across the application.
 */
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationExample from "@/components/examples/notification-example";
import ApiExample from "@/components/examples/api-example";
import EventSettingsFormExample from "@/components/event/event-settings-form-example";
import { useNotification } from "@/lib/notification-utils";

export default function ExamplesPage() {
  const notification = useNotification();
  
  React.useEffect(() => {
    notification.info({
      title: "Examples Page",
      description: "This page showcases standardized components and utilities.",
    });
  }, []);
  
  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Consolidated Utilities & Components</h1>
        <p className="text-muted-foreground">
          Demonstrating the standardized validation schemas, API utilities, and notification system.
        </p>
      </div>
      
      <Tabs defaultValue="notifications" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="forms">Form Validation</TabsTrigger>
          <TabsTrigger value="api">API Utilities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-4">
          <div className="rounded-lg border bg-card p-6 mb-4">
            <h2 className="text-xl font-semibold mb-2">Notifications System</h2>
            <p className="text-muted-foreground mb-6">
              The notification system provides consistent feedback across the application.
              It includes various types of notifications and integration with API operations.
            </p>
            
            <NotificationExample />
          </div>
        </TabsContent>
        
        <TabsContent value="forms" className="space-y-4">
          <div className="rounded-lg border bg-card p-6 mb-4">
            <h2 className="text-xl font-semibold mb-2">Form Validation</h2>
            <p className="text-muted-foreground mb-6">
              Standardized validation schemas ensure consistent form validation throughout the application.
              These schemas can be composed and extended as needed for specific use cases.
            </p>
            
            <EventSettingsFormExample eventId={1} />
          </div>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <div className="rounded-lg border bg-card p-6 mb-4">
            <h2 className="text-xl font-semibold mb-2">API Utilities</h2>
            <p className="text-muted-foreground mb-6">
              The API utilities provide a standardized approach to API interactions,
              consistent error handling, and integration with the notification system and cache management.
            </p>
            
            <ApiExample />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Benefits of Standardization</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium text-lg mb-2">Consistency</h3>
            <p className="text-sm text-muted-foreground">
              Ensures a consistent approach to common tasks throughout the application,
              reducing variations and improving code quality.
            </p>
          </div>
          
          <div className="rounded-lg border p-4">
            <h3 className="font-medium text-lg mb-2">Maintainability</h3>
            <p className="text-sm text-muted-foreground">
              Centralizing common functionality makes code more maintainable by
              isolating changes to a single location rather than scattered throughout the codebase.
            </p>
          </div>
          
          <div className="rounded-lg border p-4">
            <h3 className="font-medium text-lg mb-2">Developer Experience</h3>
            <p className="text-sm text-muted-foreground">
              Improves developer experience by providing ready-to-use utilities
              and clear patterns for common tasks, reducing learning curve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}