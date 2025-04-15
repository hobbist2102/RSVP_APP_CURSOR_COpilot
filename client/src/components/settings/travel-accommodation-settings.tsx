import React from "react";
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
import { 
  AlertCircle,
  Plane, 
  Hotel,
  Car, 
  CircleDollarSign
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

// Define the form schema
const travelAccommodationSchema = z.object({
  // Travel settings
  offerTravelAssistance: z.boolean().default(false),
  defaultArrivalLocation: z.string().optional(),
  defaultDepartureLocation: z.string().optional(),
  transportationProvided: z.boolean().default(false),
  
  // Accommodation settings
  defaultHotelName: z.string().optional(),
  defaultHotelAddress: z.string().optional(),
  defaultHotelPhone: z.string().optional(),
  defaultHotelWebsite: z.string().optional(),
  specialHotelRates: z.boolean().default(false),
  bookingInstructions: z.string().optional(),
});

interface TravelAccommodationSettingsProps {
  settings: any;
  eventId: number | undefined;
}

export default function TravelAccommodationSettings({ settings, eventId }: TravelAccommodationSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize form with settings values
  const form = useForm<z.infer<typeof travelAccommodationSchema>>({
    resolver: zodResolver(travelAccommodationSchema),
    defaultValues: {
      offerTravelAssistance: settings?.offerTravelAssistance ?? false,
      defaultArrivalLocation: settings?.defaultArrivalLocation || "",
      defaultDepartureLocation: settings?.defaultDepartureLocation || "",
      transportationProvided: settings?.transportationProvided ?? false,
      defaultHotelName: settings?.defaultHotelName || "",
      defaultHotelAddress: settings?.defaultHotelAddress || "",
      defaultHotelPhone: settings?.defaultHotelPhone || "",
      defaultHotelWebsite: settings?.defaultHotelWebsite || "",
      specialHotelRates: settings?.specialHotelRates ?? false,
      bookingInstructions: settings?.bookingInstructions || "",
    },
  });
  
  // Mutation to update Travel & Accommodation settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof travelAccommodationSchema>) => {
      if (!eventId) throw new Error("Event ID is required");
      
      const res = await apiRequest(
        "PATCH",
        `/api/event-settings/${eventId}/settings`,
        { travelAccommodation: data }
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update Travel & Accommodation settings");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/event-settings/${eventId}/settings`] });
      
      toast({
        title: "Settings saved",
        description: "Travel & Accommodation settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating settings",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: z.infer<typeof travelAccommodationSchema>) => {
    updateSettingsMutation.mutate(data);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Travel & Accommodation Settings</CardTitle>
        <CardDescription>
          Configure travel assistance and accommodation options for your guests
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Coming Soon</AlertTitle>
          <AlertDescription className="text-amber-700">
            This feature is currently under development. You can configure these settings now, 
            and they will be available when the travel and accommodation modules are released.
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center"><Plane className="mr-2 h-4 w-4" /> Travel Settings</h3>
              
              <FormField
                control={form.control}
                name="offerTravelAssistance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Offer Travel Assistance</FormLabel>
                      <FormDescription>
                        Enable travel assistance features for guests
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="defaultArrivalLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Arrival Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mumbai International Airport" {...field} />
                      </FormControl>
                      <FormDescription>
                        Default location where guests are expected to arrive
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
                        <Input placeholder="e.g., Mumbai International Airport" {...field} />
                      </FormControl>
                      <FormDescription>
                        Default location from where guests are expected to depart
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="transportationProvided"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center"><Car className="mr-2 h-4 w-4" /> Transportation Provided</FormLabel>
                      <FormDescription>
                        Indicate if you are providing transportation for guests
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
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center"><Hotel className="mr-2 h-4 w-4" /> Accommodation Settings</h3>
              
              <FormField
                control={form.control}
                name="defaultHotelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Hotel Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Grand Hyatt" {...field} />
                    </FormControl>
                    <FormDescription>
                      Name of the main hotel where guests will be accommodated
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
                    <FormLabel>Default Hotel Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Main St, Mumbai, India" {...field} />
                    </FormControl>
                    <FormDescription>
                      Complete address of the hotel
                    </FormDescription>
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
                        <Input placeholder="e.g., +91 1234567890" {...field} />
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
                        <Input placeholder="e.g., https://www.hotel.com" {...field} />
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center"><CircleDollarSign className="mr-2 h-4 w-4" /> Special Hotel Rates</FormLabel>
                      <FormDescription>
                        Indicate if you have negotiated special rates for guests
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
                name="bookingInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide instructions for how guests should book their accommodations"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      These instructions will be shown to guests when they are booking accommodations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Travel & Accommodation Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}