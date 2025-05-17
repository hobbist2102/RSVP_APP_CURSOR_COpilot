import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Wand2 } from "lucide-react";

interface TravelAccommodationSettingsProps {
  settings: any;
  eventId: number | undefined;
}

export default function TravelAccommodationSettings({ settings, eventId }: TravelAccommodationSettingsProps) {
  const [_, setLocation] = useLocation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel & Accommodation Settings</CardTitle>
        <CardDescription>
          Configure travel and accommodation options in the new Event Setup Wizard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert className="bg-amber-50 border-amber-200">
            <Wand2 className="h-4 w-4 text-amber-600" />
            <AlertTitle>Settings Moved to Setup Wizard</AlertTitle>
            <AlertDescription>
              For a more comprehensive setup experience, all travel and accommodation settings 
              have been moved to the Event Setup Wizard. Please use the wizard to configure these settings.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => setLocation(`/event-setup-wizard/${eventId}`)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Go to Setup Wizard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Define schema for Travel & Accommodation settings with new fields
const travelAccommodationSettingsSchema = z.object({
  // Accommodation Settings
  accommodationMode: z.string().default(PROVISION_MODES.NONE),
  accommodationSpecialDeals: z.string().nullable().optional(),
  accommodationInstructions: z.string().nullable().optional(),
  accommodationHotelName: z.string().nullable().optional(),
  accommodationHotelAddress: z.string().nullable().optional(),
  accommodationHotelPhone: z.string().nullable().optional(),
  accommodationHotelWebsite: z.string().nullable().optional(),
  accommodationSpecialRates: z.string().nullable().optional(),
  
  // Transport Settings
  transportMode: z.string().default(PROVISION_MODES.NONE),
  transportSpecialDeals: z.string().nullable().optional(),
  transportInstructions: z.string().nullable().optional(),
  transportProviderName: z.string().nullable().optional(),
  transportProviderContact: z.string().nullable().optional(),
  transportProviderWebsite: z.string().nullable().optional(),
  defaultArrivalLocation: z.string().nullable().optional(),
  defaultDepartureLocation: z.string().nullable().optional(),
  
  // Flight Settings
  flightMode: z.string().default(PROVISION_MODES.NONE),
  flightSpecialDeals: z.string().nullable().optional(),
  flightInstructions: z.string().nullable().optional(),
  recommendedAirlines: z.string().nullable().optional(),
  airlineDiscountCodes: z.string().nullable().optional(),
  
  // Legacy fields for backward compatibility
  offerTravelAssistance: z.boolean().default(false),
  transportationProvided: z.boolean().default(false),
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
  const [activeTab, setActiveTab] = useState("accommodation");

  // Set up form with default values from settings
  const form = useForm<TravelAccommodationSettingsData>({
    resolver: zodResolver(travelAccommodationSettingsSchema),
    defaultValues: {
      // Accommodation Settings
      accommodationMode: settings?.accommodationMode ?? PROVISION_MODES.NONE,
      accommodationSpecialDeals: settings?.accommodationSpecialDeals ?? null,
      accommodationInstructions: settings?.accommodationInstructions ?? null,
      accommodationHotelName: settings?.accommodationHotelName ?? settings?.defaultHotelName ?? null,
      accommodationHotelAddress: settings?.accommodationHotelAddress ?? settings?.defaultHotelAddress ?? null,
      accommodationHotelPhone: settings?.accommodationHotelPhone ?? settings?.defaultHotelPhone ?? null,
      accommodationHotelWebsite: settings?.accommodationHotelWebsite ?? settings?.defaultHotelWebsite ?? null,
      accommodationSpecialRates: settings?.accommodationSpecialRates ?? settings?.specialHotelRates ?? null,
      
      // Transport Settings
      transportMode: settings?.transportMode ?? PROVISION_MODES.NONE,
      transportSpecialDeals: settings?.transportSpecialDeals ?? null,
      transportInstructions: settings?.transportInstructions ?? null,
      transportProviderName: settings?.transportProviderName ?? null,
      transportProviderContact: settings?.transportProviderContact ?? null,
      transportProviderWebsite: settings?.transportProviderWebsite ?? null,
      defaultArrivalLocation: settings?.defaultArrivalLocation ?? null,
      defaultDepartureLocation: settings?.defaultDepartureLocation ?? null,
      
      // Flight Settings
      flightMode: settings?.flightMode ?? PROVISION_MODES.NONE,
      flightSpecialDeals: settings?.flightSpecialDeals ?? null,
      flightInstructions: settings?.flightInstructions ?? null,
      recommendedAirlines: settings?.recommendedAirlines ?? null,
      airlineDiscountCodes: settings?.airlineDiscountCodes ?? null,
      
      // Legacy fields
      offerTravelAssistance: settings?.offerTravelAssistance ?? false,
      transportationProvided: settings?.transportationProvided ?? false,
      defaultHotelName: settings?.defaultHotelName ?? null,
      defaultHotelAddress: settings?.defaultHotelAddress ?? null,
      defaultHotelPhone: settings?.defaultHotelPhone ?? null,
      defaultHotelWebsite: settings?.defaultHotelWebsite ?? null,
      specialHotelRates: settings?.specialHotelRates ?? null,
      bookingInstructions: settings?.bookingInstructions ?? settings?.accommodationInstructions ?? null,
    },
  });

  // Watch mode values to conditionally show fields
  const accommodationMode = form.watch("accommodationMode");
  const transportMode = form.watch("transportMode");
  const flightMode = form.watch("flightMode");

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

  // Helper function to render the mode select field
  const renderModeSelect = (
    name: "accommodationMode" | "transportMode" | "flightMode",
    label: string,
    description: string
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>{label}</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={PROVISION_MODES.NONE}>
                Do Not Provide
              </SelectItem>
              <SelectItem value={PROVISION_MODES.ALL}>
                Provide for All Outstation Guests
              </SelectItem>
              <SelectItem value={PROVISION_MODES.SPECIAL_DEAL}>
                Special Deals/Arrangements
              </SelectItem>
              <SelectItem value={PROVISION_MODES.SELECTED}>
                Provide for Selected Guests
              </SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            {description}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel & Accommodation Settings</CardTitle>
        <CardDescription>
          Configure travel and accommodation options in the new Event Setup Wizard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert className="bg-amber-50 border-amber-200">
            <Wand2 className="h-4 w-4 text-amber-600" />
            <AlertTitle>Settings Moved to Setup Wizard</AlertTitle>
            <AlertDescription>
              For a more comprehensive setup experience, all travel and accommodation settings 
              have been moved to the Event Setup Wizard. Please use the wizard to configure these settings.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => {
              const [_, setLocation] = useLocation();
              setLocation(`/event-setup-wizard/${eventId}`);
            }}
            className="w-full flex items-center justify-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Go to Setup Wizard
          </Button>
        </div>
              
              {/* Accommodation Tab */}
              <TabsContent value="accommodation" className="space-y-6">
                <div className="grid gap-6">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Accommodation Settings</h3>
                  </div>
                  
                  {renderModeSelect(
                    "accommodationMode",
                    "Accommodation Provision",
                    "How you want to handle accommodation for your guests"
                  )}
                  
                  {accommodationMode !== PROVISION_MODES.NONE && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="accommodationHotelName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hotel Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Taj Palace Hotel"
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
                          name="accommodationHotelPhone"
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
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="accommodationHotelAddress"
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
                      
                      <FormField
                        control={form.control}
                        name="accommodationHotelWebsite"
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
                      
                      {accommodationMode === PROVISION_MODES.SPECIAL_DEAL && (
                        <>
                          <FormField
                            control={form.control}
                            name="accommodationSpecialRates"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Special Hotel Rates</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Special wedding rate: ₹8,000 per night with code WEDDING2025"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Specify any special rates or discount codes negotiated for your guests
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="accommodationSpecialDeals"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Special Deals Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe the special deals or arrangements made with the hotel"
                                    {...field}
                                    value={field.value || ""}
                                    className="min-h-[100px]"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Provide details about the special arrangements so guests understand what's available
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      
                      <FormField
                        control={form.control}
                        name="accommodationInstructions"
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
                              How guests should book their rooms (e.g., booking code, contact person, process)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {accommodationMode === PROVISION_MODES.SELECTED && (
                        <div className="rounded-lg border p-4 bg-muted/20">
                          <h4 className="font-medium mb-2">Guest Selection</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            After saving these settings, you'll be able to select specific guests to receive accommodation
                            from the Guest Management page.
                          </p>
                          <Badge variant="outline" className="bg-primary/10">
                            Coming Soon
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
              
              {/* Transport Tab */}
              <TabsContent value="transport" className="space-y-6">
                <div className="grid gap-6">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Transport Settings</h3>
                  </div>
                  
                  {renderModeSelect(
                    "transportMode",
                    "Transport Provision",
                    "How you want to handle ground transportation for your guests"
                  )}
                  
                  {transportMode !== PROVISION_MODES.NONE && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="defaultArrivalLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Main Arrival Location</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Delhi International Airport"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Where most guests will arrive
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
                              <FormLabel>Main Departure Location</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Wedding Venue"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Where most guests will depart from
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {(transportMode === PROVISION_MODES.SPECIAL_DEAL || transportMode === PROVISION_MODES.ALL) && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="transportProviderName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Transport Provider Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Royal Cabs"
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
                              name="transportProviderContact"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Transport Provider Contact</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., +91 9876543210"
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
                            name="transportProviderWebsite"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Transport Provider Website</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., https://www.royalcabs.com"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      
                      {transportMode === PROVISION_MODES.SPECIAL_DEAL && (
                        <FormField
                          control={form.control}
                          name="transportSpecialDeals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Special Transport Deals</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the special transportation deals or arrangements"
                                  {...field}
                                  value={field.value || ""}
                                  className="min-h-[100px]"
                                />
                              </FormControl>
                              <FormDescription>
                                Details of any special rates or services arranged with the transport provider
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="transportInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transportation Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Instructions for guests to arrange transportation"
                                {...field}
                                value={field.value || ""}
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormDescription>
                              How guests should book or use the transportation services
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {transportMode === PROVISION_MODES.SELECTED && (
                        <div className="rounded-lg border p-4 bg-muted/20">
                          <h4 className="font-medium mb-2">Guest Selection</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            After saving these settings, you'll be able to select specific guests to receive transport
                            from the Guest Management page.
                          </p>
                          <Badge variant="outline" className="bg-primary/10">
                            Coming Soon
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
              
              {/* Flights Tab */}
              <TabsContent value="flights" className="space-y-6">
                <div className="grid gap-6">
                  <div className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Flight Settings</h3>
                  </div>
                  
                  {renderModeSelect(
                    "flightMode",
                    "Flight Provision",
                    "How you want to handle flight arrangements for your outstation guests"
                  )}
                  
                  {flightMode !== PROVISION_MODES.NONE && (
                    <>
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
                      
                      {flightMode === PROVISION_MODES.SPECIAL_DEAL && (
                        <>
                          <FormField
                            control={form.control}
                            name="airlineDiscountCodes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Airline Discount Codes</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., WEDDING2025 (10% off on Air India)"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Any discount codes or special rate information for airlines
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="flightSpecialDeals"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Special Flight Deals</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe the special flight deals or arrangements"
                                    {...field}
                                    value={field.value || ""}
                                    className="min-h-[100px]"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Details of any special rates or services arranged with airlines
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      
                      <FormField
                        control={form.control}
                        name="flightInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Flight Booking Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Instructions for guests to book their flights"
                                {...field}
                                value={field.value || ""}
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormDescription>
                              How guests should book their flights, including any special instructions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {flightMode === PROVISION_MODES.SELECTED && (
                        <div className="rounded-lg border p-4 bg-muted/20">
                          <h4 className="font-medium mb-2">Guest Selection</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            After saving these settings, you'll be able to select specific guests to receive flight bookings
                            from the Guest Management page.
                          </p>
                          <Badge variant="outline" className="bg-primary/10">
                            Coming Soon
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
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