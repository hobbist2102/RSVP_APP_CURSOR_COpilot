import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrentEvent } from "@/hooks/use-current-event";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Save, Plane, Building } from "lucide-react";

// Define schema for Travel & Accommodation settings
const travelAccommodationSettingsSchema = z.object({
  // Travel settings
  offerTravelAssistance: z.boolean().default(false),
  transportationProvided: z.boolean().default(false),
  defaultArrivalLocation: z.string().nullable().optional(),
  defaultDepartureLocation: z.string().nullable().optional(),
  recommendedAirlines: z.string().nullable().optional(),
  
  // Accommodation settings
  defaultHotelName: z.string().nullable().optional(),
  defaultHotelAddress: z.string().nullable().optional(),
  defaultHotelPhone: z.string().nullable().optional(),
  defaultHotelWebsite: z.string().nullable().optional(),
  specialHotelRates: z.string().nullable().optional(),
  bookingInstructions: z.string().nullable().optional(),
});

type TravelAccommodationSettingsData = z.infer<typeof travelAccommodationSettingsSchema>;

interface TravelAccommodationSettingsProps {
  settings: any;
  eventId: number | undefined;
}

export default function TravelAccommodationSettings({ settings, eventId }: TravelAccommodationSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentEvent } = useCurrentEvent();
  const [isSaving, setIsSaving] = useState(false);

  // Set up form with default values from settings
  const form = useForm<TravelAccommodationSettingsData>({
    resolver: zodResolver(travelAccommodationSettingsSchema),
    defaultValues: {
      offerTravelAssistance: settings?.offerTravelAssistance ?? false,
      transportationProvided: settings?.transportationProvided ?? false,
      defaultArrivalLocation: settings?.defaultArrivalLocation ?? null,
      defaultDepartureLocation: settings?.defaultDepartureLocation ?? null,
      recommendedAirlines: settings?.recommendedAirlines ?? null,
      defaultHotelName: settings?.defaultHotelName ?? null,
      defaultHotelAddress: settings?.defaultHotelAddress ?? null,
      defaultHotelPhone: settings?.defaultHotelPhone ?? null,
      defaultHotelWebsite: settings?.defaultHotelWebsite ?? null,
      specialHotelRates: settings?.specialHotelRates ?? null,
      bookingInstructions: settings?.bookingInstructions ?? null,
    },
  });

  // Update event settings mutation
  const mutation = useMutation({
    mutationFn: async (data: TravelAccommodationSettingsData) => {
      if (!eventId) throw new Error("No event selected");
      setIsSaving(true);
      const response = await apiRequest(
        "PATCH",
        `/api/event-settings/${eventId}/travel-accommodation`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Travel & Accommodation settings updated",
        description: "Your settings have been saved successfully.",
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

  function onSubmit(data: TravelAccommodationSettingsData) {
    mutation.mutate(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel & Accommodation Settings</CardTitle>
        <CardDescription>
          Configure travel and accommodation options for your guests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Travel Arrangements</h3>
              </div>
              
              <FormField
                control={form.control}
                name="offerTravelAssistance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Offer Travel Assistance</FormLabel>
                      <FormDescription>
                        Enable if you plan to assist guests with travel arrangements
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
                name="transportationProvided"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Transportation Provided</FormLabel>
                      <FormDescription>
                        Enable if you are providing transportation for guests
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
                name="defaultArrivalLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Arrival Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Delhi International Airport"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Where most guests will arrive for your wedding
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="defaultDepartureLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Departure Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Mumbai International Airport"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Where most guests will depart from after your wedding
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recommendedAirlines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommended Airlines</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Air India, IndiGo, SpiceJet"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      List airlines you recommend for your guests
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="my-6" />
              
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Accommodation Details</h3>
              </div>
              
              <FormField
                control={form.control}
                name="defaultHotelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Hotel Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Taj Palace Hotel"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Main hotel for your wedding guests
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="defaultHotelAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Full address of the hotel"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="defaultHotelPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., +91 1234567890"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="defaultHotelWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., https://www.tajhotels.com"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="specialHotelRates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Hotel Rates Information</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Special wedding rate: ₹8,000 per night"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Any special rates negotiated for your guests
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bookingInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instructions for guests to book their accommodation"
                        {...field}
                        value={field.value || ""}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>
                      How guests should book their rooms (e.g., booking code, contact person)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="gold-gradient mt-6"
              disabled={isSaving}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Travel & Accommodation Settings
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}