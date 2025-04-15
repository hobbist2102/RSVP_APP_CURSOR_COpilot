import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2, Info } from "lucide-react";

// Define provision modes to match the backend
const PROVISION_MODES = {
  NONE: "none",
  ALL: "all",
  SPECIAL_DEAL: "special_deal",
  SELECTED: "selected"
};

interface RsvpStage2FormProps {
  eventId: number;
  guestId: number;
  defaultValues?: Partial<FormValues>;
  mealOptions: any[];
  onSuccess?: (data: any) => void;
  onBack?: () => void;
}

const formSchema = z.object({
  guestId: z.number(),
  eventId: z.number(),
  // Accommodation details
  needsAccommodation: z.boolean().optional(),
  accommodationPreference: z.enum(['provided', 'self_managed', 'special_arrangement']).optional(),
  accommodationNotes: z.string().optional(),
  hotelPreference: z.string().optional(), // For multi-hotel support
  // Transportation details
  needsTransportation: z.boolean().optional(),
  transportationPreference: z.enum(['provided', 'self_managed', 'special_arrangement']).optional(),
  transportationNotes: z.string().optional(),
  // Travel details
  travelMode: z.enum(['air', 'train', 'bus', 'car']).optional(),
  flightDetails: z.object({
    flightNumber: z.string().optional(),
    airline: z.string().optional(),
    arrivalAirport: z.string().optional(),
    departureAirport: z.string().optional(),
  }).optional(),
  arrivalDate: z.string().optional(),
  arrivalTime: z.string().optional(),
  departureDate: z.string().optional(),
  departureTime: z.string().optional(),
  // Children details as structured data
  childrenDetails: z.array(z.object({
    name: z.string(),
    age: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(0).max(18).optional()
    ),
    gender: z.string().optional(),
    dietaryRestrictions: z.string().optional()
  })).optional(),
  // Meal selections with more detailed structure
  mealSelections: z.array(z.object({
    ceremonyId: z.number(),
    mealOptionId: z.number(),
    notes: z.string().optional()
  })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RsvpStage2Form({ 
  eventId, 
  guestId, 
  defaultValues, 
  mealOptions, 
  onSuccess,
  onBack
}: RsvpStage2FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("accommodation");
  const { toast } = useToast();
  
  // Fetch event settings to determine which sections to show
  const { data: eventSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/events', eventId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/events/${eventId}`);
      return response.json();
    }
  });
  
  // Fetch available hotels for this event if multiple options
  const { data: hotels, isLoading: isLoadingHotels } = useQuery({
    queryKey: ['/api/hotels', eventId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/hotels/by-event/${eventId}`);
      return response.json();
    },
    enabled: !!eventId && (eventSettings?.accommodationMode === PROVISION_MODES.ALL || 
                           eventSettings?.accommodationMode === PROVISION_MODES.SELECTED)
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestId,
      eventId,
      needsAccommodation: defaultValues?.needsAccommodation || false,
      accommodationPreference: defaultValues?.accommodationPreference || 'provided',
      accommodationNotes: defaultValues?.accommodationNotes || "",
      hotelPreference: defaultValues?.hotelPreference || "",
      needsTransportation: defaultValues?.needsTransportation || false,
      transportationPreference: defaultValues?.transportationPreference || 'provided',
      transportationNotes: defaultValues?.transportationNotes || "",
      travelMode: defaultValues?.travelMode || 'air',
      flightDetails: defaultValues?.flightDetails || {
        flightNumber: "",
        airline: "",
        arrivalAirport: "",
        departureAirport: ""
      },
      arrivalDate: defaultValues?.arrivalDate || "",
      arrivalTime: defaultValues?.arrivalTime || "",
      departureDate: defaultValues?.departureDate || "",
      departureTime: defaultValues?.departureTime || "",
      childrenDetails: defaultValues?.childrenDetails || [],
      mealSelections: defaultValues?.mealSelections || [],
    },
  });
  
  const { fields: childrenFields, append: appendChild, remove: removeChild } = useFieldArray({
    control: form.control,
    name: "childrenDetails"
  });
  
  const needsAccommodation = form.watch("needsAccommodation");
  const needsTransportation = form.watch("needsTransportation");
  const travelMode = form.watch("travelMode");
  
  // Get accommodation and transport modes from event settings
  const accommodationMode = eventSettings?.accommodationMode || PROVISION_MODES.NONE;
  const transportMode = eventSettings?.transportMode || PROVISION_MODES.NONE;
  const flightMode = eventSettings?.flightMode || PROVISION_MODES.NONE;
  
  // Set defaults based on event settings
  useEffect(() => {
    if (eventSettings) {
      // For accommodation mode ALL, the guest always needs accommodation
      if (accommodationMode === PROVISION_MODES.ALL) {
        form.setValue("needsAccommodation", true);
      }
      
      // For transport mode ALL, the guest always needs transportation
      if (transportMode === PROVISION_MODES.ALL) {
        form.setValue("needsTransportation", true);
      }
    }
  }, [eventSettings, form, accommodationMode, transportMode]);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Submit RSVP Stage 2
      const rsvpResponse = await apiRequest("POST", "/api/rsvp/stage2", values);
      
      const data = await rsvpResponse.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to submit travel details");
      }
      
      toast({
        title: "Travel Details Submitted",
        description: "Thank you for providing your travel information!",
      });
      
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error("RSVP stage 2 submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting your travel details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChildAdd = () => {
    appendChild({ name: "", age: undefined, gender: "", dietaryRestrictions: "" });
  };
  
  // Group meal options by ceremony
  const mealOptionsByCeremony = mealOptions.reduce<Record<number, any[]>>((acc, option) => {
    if (!acc[option.ceremonyId]) {
      acc[option.ceremonyId] = [];
    }
    acc[option.ceremonyId].push(option);
    return acc;
  }, {});
  
  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading event settings...</span>
      </div>
    );
  }
  
  // Determine which tabs to show based on event settings
  const showAccommodationTab = accommodationMode !== PROVISION_MODES.NONE;
  const showTransportationTab = transportMode !== PROVISION_MODES.NONE;
  const showFlightTab = flightMode !== PROVISION_MODES.NONE;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            {showAccommodationTab && <TabsTrigger value="accommodation">Accommodation</TabsTrigger>}
            {showTransportationTab && <TabsTrigger value="transportation">Transportation</TabsTrigger>}
            {form.getValues().childrenDetails?.length > 0 && <TabsTrigger value="children">Children</TabsTrigger>}
            {Object.keys(mealOptionsByCeremony).length > 0 && <TabsTrigger value="meals">Meal Selection</TabsTrigger>}
          </TabsList>
          
          {/* Accommodation Tab */}
          {showAccommodationTab && (
            <TabsContent value="accommodation" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4 font-playfair">Accommodation Details</h3>
                  
                  {accommodationMode === PROVISION_MODES.SPECIAL_DEAL && (
                    <Alert className="mb-4 bg-amber-50">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Special Hotel Rates Available</AlertTitle>
                      <AlertDescription>
                        {eventSettings?.accommodationSpecialDeals || 
                        "Special hotel rates have been arranged for wedding guests. See details below."}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* For SELECTED mode, show checkbox */}
                  {accommodationMode === PROVISION_MODES.SELECTED && (
                    <FormField
                      control={form.control}
                      name="needsAccommodation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              I need accommodation for the wedding
                            </FormLabel>
                            <FormDescription>
                              Let us know if you need us to arrange your stay
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
                  )}
                  
                  {/* For ALL mode, show message that accommodation is included */}
                  {accommodationMode === PROVISION_MODES.ALL && (
                    <Alert className="mb-4 bg-green-50">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Accommodation Included</AlertTitle>
                      <AlertDescription>
                        Your accommodation is included and will be arranged at {eventSettings?.accommodationHotelName || "the wedding venue"}.
                        {eventSettings?.accommodationInstructions && (
                          <p className="mt-2">{eventSettings.accommodationInstructions}</p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Show accommodation options when accommodation is needed or automatically provided */}
                  {((accommodationMode === PROVISION_MODES.SELECTED && needsAccommodation) || 
                    accommodationMode === PROVISION_MODES.ALL || 
                    accommodationMode === PROVISION_MODES.SPECIAL_DEAL) && (
                    <div className="mt-4 space-y-4">
                      {/* Show hotel dropdown when multiple hotels are available */}
                      {hotels && hotels.length > 1 && (
                        <FormField
                          control={form.control}
                          name="hotelPreference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hotel Preference</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your preferred hotel" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {hotels.map((hotel: any) => (
                                    <SelectItem key={hotel.id} value={hotel.id.toString()}>
                                      {hotel.name} {hotel.pricePerNight && `(₹${hotel.pricePerNight}/night)`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Select your preferred hotel from the options available.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* If there's one hotel, show its details */}
                      {eventSettings?.accommodationHotelName && !(hotels && hotels.length > 1) && (
                        <div className="p-4 border rounded-md bg-slate-50">
                          <h4 className="font-medium">{eventSettings.accommodationHotelName}</h4>
                          {eventSettings.accommodationHotelAddress && (
                            <p className="text-sm mt-1">{eventSettings.accommodationHotelAddress}</p>
                          )}
                          {eventSettings.accommodationHotelPhone && (
                            <p className="text-sm mt-1">Phone: {eventSettings.accommodationHotelPhone}</p>
                          )}
                          {eventSettings.accommodationHotelWebsite && (
                            <p className="text-sm mt-1">
                              <a 
                                href={eventSettings.accommodationHotelWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Visit Website
                              </a>
                            </p>
                          )}
                        </div>
                      )}
                                            
                      <FormField
                        control={form.control}
                        name="accommodationNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special requirements or details about your accommodation needs..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="arrivalDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arrival Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="departureDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Departure Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* For SPECIAL_DEAL mode, show special rates */}
                  {accommodationMode === PROVISION_MODES.SPECIAL_DEAL && eventSettings?.accommodationSpecialRates && (
                    <div className="mt-4 p-4 border rounded-md bg-blue-50">
                      <h4 className="font-medium">Special Rates Information</h4>
                      <p className="mt-1 text-sm">{eventSettings.accommodationSpecialRates}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onBack}>
                  Back to Basic Details
                </Button>
                
                {showTransportationTab ? (
                  <Button type="button" onClick={() => setActiveTab("transportation")}>
                    Next: Transportation
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                )}
              </div>
            </TabsContent>
          )}
          
          {/* Transportation Tab */}
          {showTransportationTab && (
            <TabsContent value="transportation" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4 font-playfair">Transportation Details</h3>
                  
                  {transportMode === PROVISION_MODES.SPECIAL_DEAL && (
                    <Alert className="mb-4 bg-amber-50">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Special Transportation Arrangements</AlertTitle>
                      <AlertDescription>
                        {eventSettings?.transportSpecialDeals || 
                        "Special transportation arrangements are available for wedding guests."}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* For SELECTED mode, show checkbox */}
                  {transportMode === PROVISION_MODES.SELECTED && (
                    <FormField
                      control={form.control}
                      name="needsTransportation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              I need transportation assistance
                            </FormLabel>
                            <FormDescription>
                              Let us know if you need help with transportation during your stay
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
                  )}
                  
                  {/* For ALL mode, show message that transportation is included */}
                  {transportMode === PROVISION_MODES.ALL && (
                    <Alert className="mb-4 bg-green-50">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Transportation Included</AlertTitle>
                      <AlertDescription>
                        Transportation is included for all guests
                        {eventSettings?.transportInstructions && (
                          <p className="mt-2">{eventSettings.transportInstructions}</p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Show transportation options when transportation is needed or automatically provided */}
                  {((transportMode === PROVISION_MODES.SELECTED && needsTransportation) || 
                    transportMode === PROVISION_MODES.ALL || 
                    transportMode === PROVISION_MODES.SPECIAL_DEAL) && (
                    <div className="mt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="travelMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Travel Mode</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your travel mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="air">Flight</SelectItem>
                                <SelectItem value="train">Train</SelectItem>
                                <SelectItem value="bus">Bus</SelectItem>
                                <SelectItem value="car">Car</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {travelMode === 'air' && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="flightDetails.airline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Airline</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Air India, IndiGo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="flightDetails.flightNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Flight Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., AI123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="flightDetails.arrivalAirport"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Arrival Airport</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., DEL" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="flightDetails.departureAirport"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Departure Airport</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., BOM" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="arrivalTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arrival Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="departureTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Departure Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="transportationNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Transportation Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any specific transportation requirements..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                {showAccommodationTab ? (
                  <Button type="button" variant="outline" onClick={() => setActiveTab("accommodation")}>
                    Back to Accommodation
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={onBack}>
                    Back to Basic Details
                  </Button>
                )}
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </TabsContent>
          )}
          
          {/* Children Tab */}
          <TabsContent value="children" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium font-playfair">Children Details</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleChildAdd}
                    size="sm"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Child
                  </Button>
                </div>
                
                {childrenFields.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>No children added yet. Click "Add Child" to add details.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {childrenFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-md relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => removeChild(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        
                        <h4 className="font-medium mb-3">Child {index + 1}</h4>
                        
                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name={`childrenDetails.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`childrenDetails.${index}.age`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Age</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0" 
                                      max="18" 
                                      {...field} 
                                      onChange={(e) => field.onChange(e.target.value)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`childrenDetails.${index}.gender`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gender</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`childrenDetails.${index}.dietaryRestrictions`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dietary Restrictions</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Any dietary requirements or allergies..."
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveTab(showTransportationTab ? "transportation" : "accommodation")}
              >
                Back
              </Button>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Meal Selection Tab */}
          <TabsContent value="meals" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 font-playfair">Meal Preferences</h3>
                
                {Object.entries(mealOptionsByCeremony).length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>No meal options available for selection.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(mealOptionsByCeremony).map(([ceremonyId, options]) => (
                      <div key={ceremonyId} className="p-4 border rounded-md">
                        <h4 className="font-medium mb-3">
                          {options[0]?.ceremonyName || `Ceremony ${ceremonyId}`}
                        </h4>
                        
                        <FormField
                          control={form.control}
                          name={`mealSelections.${parseInt(ceremonyId) - 1}.mealOptionId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meal Option</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
                                defaultValue={field.value?.toString() || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your meal preference" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {options.map((option: any) => (
                                    <SelectItem key={option.id} value={option.id.toString()}>
                                      {option.name} 
                                      {option.isVegetarian && " (Vegetarian)"}
                                      {option.isVegan && " (Vegan)"}
                                      {option.isGlutenFree && " (Gluten-free)"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <input 
                          type="hidden" 
                          {...form.register(`mealSelections.${parseInt(ceremonyId) - 1}.ceremonyId`)}
                          value={ceremonyId} 
                        />
                        
                        <FormField
                          control={form.control}
                          name={`mealSelections.${parseInt(ceremonyId) - 1}.notes`}
                          render={({ field }) => (
                            <FormItem className="mt-3">
                              <FormLabel>Special Instructions</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any specific meal requirements or allergies..."
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("children")}>
                Back to Children Details
              </Button>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}