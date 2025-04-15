import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the form schema
const rsvpSettingsSchema = z.object({
  // RSVP deadline settings
  rsvpDeadline: z.string().optional(),
  
  // RSVP form options
  allowPlusOnes: z.boolean().default(true),
  allowChildrenDetails: z.boolean().default(true),
  customRsvpUrl: z.string().optional(),
  
  // Communication settings
  emailConfigured: z.boolean().default(false),
  whatsappConfigured: z.boolean().default(false),
});

interface RsvpSettingsProps {
  settings: any;
  eventId: number | undefined;
}

export default function RsvpSettings({ settings, eventId }: RsvpSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize form with settings values
  const form = useForm<z.infer<typeof rsvpSettingsSchema>>({
    resolver: zodResolver(rsvpSettingsSchema),
    defaultValues: {
      rsvpDeadline: settings?.rsvpDeadline || "",
      allowPlusOnes: settings?.allowPlusOnes ?? true,
      allowChildrenDetails: settings?.allowChildrenDetails ?? true,
      customRsvpUrl: settings?.customRsvpUrl || "",
      emailConfigured: settings?.emailConfigured ?? false,
      whatsappConfigured: settings?.whatsappConfigured ?? false,
    },
  });
  
  // Mutation to update RSVP settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof rsvpSettingsSchema>) => {
      if (!eventId) throw new Error("Event ID is required");
      
      const res = await apiRequest(
        "PATCH",
        `/api/event-settings/${eventId}/settings`,
        { rsvp: data }
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update RSVP settings");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/event-settings/${eventId}/settings`] });
      
      toast({
        title: "Settings saved",
        description: "RSVP settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating RSVP settings",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: z.infer<typeof rsvpSettingsSchema>) => {
    updateSettingsMutation.mutate(data);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>RSVP Settings</CardTitle>
        <CardDescription>
          Configure RSVP form options and communication settings
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">RSVP Deadline</h3>
              
              <FormField
                control={form.control}
                name="rsvpDeadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>RSVP Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Set a deadline for guests to respond to the invitation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">RSVP Form Options</h3>
              
              <FormField
                control={form.control}
                name="allowPlusOnes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Plus Ones</FormLabel>
                      <FormDescription>
                        Allow guests to bring additional guests with them
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
                      <FormLabel className="text-base">Children Details</FormLabel>
                      <FormDescription>
                        Allow guests to provide details about their children
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
                      <Input placeholder="https://your-custom-domain.com/rsvp" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional: Provide a custom URL for your RSVP form (leave blank to use the default URL)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Communication Channels</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These settings are managed in the Email & OAuth tab and are shown here for reference only.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Email Status</h4>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${settings?.emailConfigured ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                    <span>{settings?.emailConfigured ? 'Configured' : 'Not Configured'}</span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">WhatsApp Status</h4>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${settings?.whatsappConfigured ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                    <span>{settings?.whatsappConfigured ? 'Configured' : 'Not Configured'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save RSVP Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}