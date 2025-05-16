/**
 * Example component showcasing standardized form validation
 * This demonstrates patterns for form validation using centralized schemas
 */
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { put } from "@/lib/api-utils";
import { useNotification } from "@/lib/notification-utils";

// Example validation schema for event settings form
const eventSettingsSchema = z.object({
  emailBanner: z.string().url("Banner must be a valid URL").optional().or(z.literal("")),
  emailSignature: z.string().max(500, "Signature must be less than 500 characters").optional(),
  sendReminderEmails: z.boolean().default(false),
  reminderDaysBeforeEvent: z.number().min(1, "Must be at least 1 day").max(30, "Must be no more than 30 days"),
  customWelcomeMessage: z.string().max(1000, "Welcome message must be less than 1000 characters").optional(),
  whatsappEnabled: z.boolean().default(false),
  whatsappApiKey: z.string().min(10, "API key must be at least 10 characters").optional(),
  collectDietaryRestrictions: z.boolean().default(true),
  collectAccommodationPreferences: z.boolean().default(true),
  collectTransportationNeeds: z.boolean().default(true),
});

// Derive the type from our schema
type EventSettingsFormValues = z.infer<typeof eventSettingsSchema>;

interface EventSettingsFormExampleProps {
  eventId: number;
}

export default function EventSettingsFormExample({ eventId }: EventSettingsFormExampleProps) {
  const notification = useNotification();
  
  // Example query for fetching event settings with proper loading and error states
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["/api/event-settings", eventId],
    // Simulated query function that returns mock data
    queryFn: () => Promise.resolve({
      emailBanner: "https://example.com/banner.jpg",
      emailSignature: "Best Regards,\nThe Wedding Team",
      sendReminderEmails: true,
      reminderDaysBeforeEvent: 7,
      customWelcomeMessage: "We're excited to celebrate with you!",
      whatsappEnabled: false,
      whatsappApiKey: "",
      collectDietaryRestrictions: true,
      collectAccommodationPreferences: true,
      collectTransportationNeeds: true,
    }),
  });

  // Example mutation for updating event settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: EventSettingsFormValues) => {
      // Simulated API call that logs the data but doesn't actually make a request
      console.log("Would update event settings:", data);
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000); // Simulate API delay
      });
    },
    onSuccess: () => {
      notification.success({
        title: "Settings Updated",
        description: "Event settings have been updated successfully."
      });
    },
    onError: (error: any) => {
      notification.error({
        title: "Update Failed",
        description: error.message || "An error occurred while updating settings."
      });
    }
  });

  // Initialize form with resolver and default values
  const form = useForm<EventSettingsFormValues>({
    resolver: zodResolver(eventSettingsSchema),
    defaultValues: {
      emailBanner: "",
      emailSignature: "",
      sendReminderEmails: false,
      reminderDaysBeforeEvent: 7,
      customWelcomeMessage: "",
      whatsappEnabled: false,
      whatsappApiKey: "",
      collectDietaryRestrictions: true,
      collectAccommodationPreferences: true,
      collectTransportationNeeds: true,
    },
  });

  // Update form values when settings data is loaded
  React.useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  // Form submission handler
  const onSubmit = (data: EventSettingsFormValues) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load event settings: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Event Settings</CardTitle>
            <CardDescription>
              Configure communication and RSVP preferences for your event
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            Event ID: {eventId}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Settings</h3>
              
              <FormField
                control={form.control}
                name="emailBanner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Banner URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/banner.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to the image that will appear at the top of emails
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emailSignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Signature</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Best Regards,&#10;The Wedding Team" {...field} />
                    </FormControl>
                    <FormDescription>
                      Signature that will appear at the bottom of all emails
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sendReminderEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Send Reminder Emails</FormLabel>
                        <FormDescription>
                          Automatically send reminder emails before the event
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reminderDaysBeforeEvent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days Before Event</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          value={field.value}
                          disabled={!form.watch("sendReminderEmails")} 
                        />
                      </FormControl>
                      <FormDescription>
                        How many days before the event to send reminders
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="customWelcomeMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Welcome Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="We're excited to celebrate with you!" {...field} />
                    </FormControl>
                    <FormDescription>
                      Custom message shown to guests when they first visit the RSVP page
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">WhatsApp Integration</h3>
              
              <FormField
                control={form.control}
                name="whatsappEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enable WhatsApp Notifications</FormLabel>
                      <FormDescription>
                        Send RSVP confirmations and reminders via WhatsApp
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="whatsappApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp API Key</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your WhatsApp Business API key" 
                        {...field} 
                        disabled={!form.watch("whatsappEnabled")} 
                      />
                    </FormControl>
                    <FormDescription>
                      API key from WhatsApp Business API provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">RSVP Form Settings</h3>
              
              <FormField
                control={form.control}
                name="collectDietaryRestrictions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Collect Dietary Restrictions</FormLabel>
                      <FormDescription>
                        Ask guests about dietary restrictions during RSVP
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="collectAccommodationPreferences"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Collect Accommodation Preferences</FormLabel>
                      <FormDescription>
                        Ask guests about accommodation needs during RSVP
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="collectTransportationNeeds"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Collect Transportation Needs</FormLabel>
                      <FormDescription>
                        Ask guests about transportation needs during RSVP
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Settings</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="bg-muted/50 flex flex-col items-start text-sm text-muted-foreground">
        <p>
          This form demonstrates centralized validation schemas, conditional field validation,
          and integration with the notification system.
        </p>
      </CardFooter>
    </Card>
  );
}