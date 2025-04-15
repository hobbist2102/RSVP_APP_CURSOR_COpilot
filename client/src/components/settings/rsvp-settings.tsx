import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define schema for RSVP settings
const rsvpSettingsSchema = z.object({
  allowPlusOnes: z.boolean().default(true),
  allowChildrenDetails: z.boolean().default(true),
  customRsvpUrl: z.string().optional().nullable(),
});

type RsvpSettingsData = z.infer<typeof rsvpSettingsSchema>;

interface RsvpSettingsProps {
  settings: any;
  eventId: number | undefined;
}

export default function RsvpSettings({ settings, eventId }: RsvpSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentEvent } = useCurrentEvent();
  const [isSaving, setIsSaving] = useState(false);

  // Set up form with default values from settings
  const form = useForm<RsvpSettingsData>({
    resolver: zodResolver(rsvpSettingsSchema),
    defaultValues: {
      allowPlusOnes: settings?.allowPlusOnes ?? true,
      allowChildrenDetails: settings?.allowChildrenDetails ?? true,
      customRsvpUrl: settings?.customRsvpUrl ?? null,
    },
  });

  // Update event settings mutation
  const mutation = useMutation({
    mutationFn: async (data: RsvpSettingsData) => {
      if (!eventId) throw new Error("No event selected");
      setIsSaving(true);
      const response = await apiRequest(
        "PATCH",
        `/api/event-settings/${eventId}/rsvp`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "RSVP settings updated",
        description: "Your RSVP settings have been saved successfully.",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/event-settings/${eventId}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  function onSubmit(data: RsvpSettingsData) {
    mutation.mutate(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RSVP Settings</CardTitle>
        <CardDescription>
          Configure how guests can RSVP to your wedding events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="allowPlusOnes"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Allow Plus Ones</FormLabel>
                    <FormDescription>
                      Let guests bring additional guests with them
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="allowChildrenDetails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Child Details</FormLabel>
                    <FormDescription>
                      Allow guests to provide details about accompanying children
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customRsvpUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom RSVP URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://your-custom-rsvp-url.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Use a custom domain for your RSVP page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {currentEvent && (
              <Alert className="bg-amber-50 border-amber-300">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Default RSVP Link</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Your guests can RSVP at: {window.location.origin}/guest-rsvp?event={currentEvent.id}
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="gold-gradient"
              disabled={isSaving}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save RSVP Settings
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}