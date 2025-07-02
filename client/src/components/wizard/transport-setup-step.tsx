import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Car,
  Truck,
  Bus,
  Loader2,
  PlusCircle,
  Trash2,
  Check,
  Info,
  Save,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Link,
  Plane,
} from "lucide-react";

// Constants
export const PROVISION_MODES = {
  NONE: "none",
  ALL: "all",
  SELECTED: "selected",
  SPECIAL_DEAL: "special_deal",
};

// Vehicle type
type Vehicle = {
  id: string;
  type: string;
  capacity: number;
  imageUrl?: string;
};

// Schema for the form
const formSchema = z.object({
  transportMode: z.string().default("none"),
  transportProviderName: z.string().optional(),
  transportProviderPhone: z.string().optional(),
  transportProviderEmail: z.string().optional(),
  transportInstructions: z.string().optional(),
  transportSpecialDeals: z.string().optional(),
  sendTravelUpdates: z.boolean().default(true),
  notifyGuests: z.boolean().default(true),
  providesAirportPickup: z.boolean().default(false),
  providesVenueTransfers: z.boolean().default(false),
  transportPickupNote: z.string().optional(),
  transportReturnNote: z.string().optional(),
  // Flight coordination fields
  flightMode: z.string().default("none"),
  flightInstructions: z.string().optional(),
  flightSpecialDeals: z.string().optional(),
  recommendedAirlines: z.string().optional(),
  airlineDiscountCodes: z.string().optional(),
  offerTravelAssistance: z.boolean().default(false),
});

// Props for the component
interface TransportSetupStepProps {
  eventId: number | string;
  onComplete: (data: any) => void;
  onBack?: () => void;
  isCompleted?: boolean;
}

// Main component
export default function TransportSetupStep({
  eventId,
  onComplete,
  onBack,
  isCompleted
}: TransportSetupStepProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(!isCompleted);
  const [activeTab, setActiveTab] = useState("general");
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 'v1', type: 'Sedan', capacity: 4 },
    { id: 'v2', type: 'SUV', capacity: 6 },
    { id: 'v3', type: 'Minivan', capacity: 8 },
  ]);
  const [newVehicle, setNewVehicle] = useState<{ type: string; capacity: number }>({
    type: '',
    capacity: 4
  });
  
  // Get the current event
  const { data: currentEvent, isLoading: isLoadingEvent, error: eventError } = useQuery({
    queryKey: ['/api/events', eventId],
    queryFn: async () => {
      if (!eventId || eventId === 'new') return null;
      const res = await apiRequest('GET', `/api/events/${eventId}`);
      return res.json();
    },
    enabled: !!eventId && eventId !== 'new',
    retry: 1,
    staleTime: 10000, // Cache for 10 seconds
    refetchOnWindowFocus: false
  });

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transportMode: PROVISION_MODES.NONE,
      transportProviderName: '',
      transportProviderPhone: '',
      transportProviderEmail: '',
      transportInstructions: '',
      transportSpecialDeals: '',
      sendTravelUpdates: true,
      notifyGuests: true,
      providesAirportPickup: false,
      providesVenueTransfers: true,
      transportPickupNote: '',
      transportReturnNote: '',
      // Flight coordination defaults
      flightMode: "none",
      flightInstructions: '',
      flightSpecialDeals: '',
      recommendedAirlines: '',
      airlineDiscountCodes: '',
      offerTravelAssistance: false,
    },
  });

  // Populate form with existing data when available
  useEffect(() => {
    if (currentEvent && !isLoadingEvent) {
      const formData = {
        transportMode: currentEvent.transportMode || PROVISION_MODES.NONE,
        transportProviderName: currentEvent.transportProviderName || '',
        transportProviderPhone: currentEvent.transportProviderContact || '',
        transportProviderEmail: currentEvent.transportProviderEmail || '',
        transportInstructions: currentEvent.transportInstructions || '',
        transportSpecialDeals: currentEvent.transportSpecialDeals || '',
        sendTravelUpdates: currentEvent.sendTravelUpdates ?? true,
        notifyGuests: currentEvent.notifyGuests ?? true,
        providesAirportPickup: currentEvent.providesAirportPickup ?? false,
        providesVenueTransfers: currentEvent.providesVenueTransfers ?? true,
        transportPickupNote: currentEvent.transportPickupNote || '',
        transportReturnNote: currentEvent.transportReturnNote || '',
        // Flight coordination
        flightMode: currentEvent.flightMode || "none",
        flightInstructions: currentEvent.flightInstructions || '',
        flightSpecialDeals: currentEvent.flightSpecialDeals || '',
        recommendedAirlines: currentEvent.recommendedAirlines || '',
        airlineDiscountCodes: currentEvent.airlineDiscountCodes || '',
        offerTravelAssistance: currentEvent.offerTravelAssistance ?? false,
      };
      
      form.reset(formData);
      
      // Load vehicles if any saved
      if (currentEvent.transportVehicles) {
        try {
          const savedVehicles = JSON.parse(currentEvent.transportVehicles);
          if (Array.isArray(savedVehicles) && savedVehicles.length > 0) {
            setVehicles(savedVehicles);
          }
        } catch (error) {
          console.error("Error parsing saved vehicles:", error);
        }
      }
    }
  }, [currentEvent?.id, isLoadingEvent]); // Only depend on event ID and loading state

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const updatedData = {
        ...data,
        transportVehicles: JSON.stringify(vehicles)
      };
      const res = await apiRequest('POST', `/api/wizard/transport`, updatedData);
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['/api/current-event'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wizard'] });
      
      toast({
        title: "Transport settings saved",
        description: "Your transport configuration has been updated.",
      });
      setIsEditing(false);
      onComplete(data);
    },
    onError: (error) => {
      console.error('Transport save error:', error);
      toast({
        title: "Error saving transport settings",
        description: error?.message || "There was a problem saving your transport configuration.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    saveMutation.mutate(data);
  };
  
  // Add new vehicle
  const handleAddVehicle = () => {
    if (!newVehicle.type) {
      toast({
        title: "Vehicle type required",
        description: "Please enter a vehicle type.",
        variant: "destructive",
      });
      return;
    }
    
    const newVehicleObj: Vehicle = {
      id: `v${Date.now()}`,
      ...newVehicle
    };
    
    setVehicles([...vehicles, newVehicleObj]);
    setNewVehicle({
      type: '',
      capacity: 4
    });
    
    toast({
      title: "Vehicle added",
      description: `${newVehicle.type} has been added to your transport fleet.`,
    });
  };
  
  // Remove vehicle
  const handleRemoveVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    toast({
      title: "Vehicle removed",
      description: "Vehicle has been removed from your transport fleet.",
    });
  };
  
  // View the transport assignments
  const handleViewAssignments = () => {
    window.open('/transport-assignments', '_blank');
  };

  // Handle loading and error states
  if (isLoadingEvent) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading transport settings...</p>
        </div>
      </div>
    );
  }

  if (eventError) {
    return (
      <div className="space-y-6">
        <div className="text-center p-12">
          <p className="text-muted-foreground mb-4">Unable to load event data for transport configuration.</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Transport Setup</h1>
          <p className="text-muted-foreground">
            Configure transportation options for your guests
          </p>
        </div>
        
        {isCompleted && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Settings
          </Button>
        )}
      </div>

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="general">
                  General Settings
                </TabsTrigger>
                <TabsTrigger value="fleet">
                  Fleet Management
                </TabsTrigger>
              </TabsList>
              
              {/* General Settings Tab */}
              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transportation Strategy</CardTitle>
                    <CardDescription>
                      Define how transportation will be handled for your guests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="transportMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transportation Mode</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transportation mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={PROVISION_MODES.NONE}>
                                No transportation provided
                              </SelectItem>
                              <SelectItem value={PROVISION_MODES.ALL}>
                                Provided for all guests
                              </SelectItem>
                              <SelectItem value={PROVISION_MODES.SELECTED}>
                                Only for selected guests
                              </SelectItem>
                              <SelectItem value={PROVISION_MODES.SPECIAL_DEAL}>
                                Transportation options/discounts
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How you'll handle transportation for guests
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {(form.watch("transportMode") === PROVISION_MODES.ALL || form.watch("transportMode") === PROVISION_MODES.SELECTED) && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="transportProviderName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Transportation Provider</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Provider name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="transportProviderPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Provider Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Phone number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="transportProviderEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Email address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="transportInstructions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transport Instructions</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Instructions for guests about transportation"
                                  className="min-h-[100px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex space-x-4">
                          <FormField
                            control={form.control}
                            name="providesAirportPickup"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Provides airport pickup
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="providesVenueTransfers"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Provides venue transfers
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}
                    
                    {form.watch("transportMode") === PROVISION_MODES.SPECIAL_DEAL && (
                      <>
                        <FormField
                          control={form.control}
                          name="transportSpecialDeals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transportation Options & Discounts</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Describe the transportation options, discounts, or partnerships available to guests"
                                  className="min-h-[100px]"
                                />
                              </FormControl>
                              <FormDescription>
                                Details about discounted transportation options, partner deals, or preferred providers
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="transportInstructions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Booking Instructions for Guests</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Instructions on how guests can access these transportation options"
                                  className="min-h-[100px]"
                                />
                              </FormControl>
                              <FormDescription>
                                Step-by-step instructions for guests on how to book or access discounted transportation
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
                
                {form.watch("transportMode") !== PROVISION_MODES.NONE && (
                  <div className="mt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleViewAssignments}
                      className="w-full"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      View Transport Assignments
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Fleet Management Tab */}
              <TabsContent value="fleet" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Fleet</CardTitle>
                    <CardDescription>
                      Define the vehicles available for transportation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {form.watch("transportMode") === PROVISION_MODES.NONE ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Transportation Disabled</AlertTitle>
                        <AlertDescription>
                          Enable transportation in the General Settings tab to configure your vehicle fleet.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {vehicles.length > 0 ? (
                            <div className="space-y-4">
                              {vehicles.map((vehicle) => (
                                <div 
                                  key={vehicle.id} 
                                  className="flex items-center justify-between p-3 border rounded-md"
                                >
                                  <div className="flex items-center space-x-3">
                                    {vehicle.type.toLowerCase().includes('bus') ? (
                                      <Bus className="h-5 w-5 text-primary" />
                                    ) : vehicle.capacity > 6 ? (
                                      <Truck className="h-5 w-5 text-primary" />
                                    ) : (
                                      <Car className="h-5 w-5 text-primary" />
                                    )}
                                    <div>
                                      <p className="font-medium">{vehicle.type}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {vehicle.capacity} passengers
                                      </p>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleRemoveVehicle(vehicle.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-6 border rounded-md bg-muted/50">
                              <p className="text-muted-foreground">No vehicles added yet.</p>
                            </div>
                          )}
                          
                          <Separator />
                          
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Add New Vehicle Type</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="vehicle-type">Vehicle Type</Label>
                                <Input 
                                  id="vehicle-type"
                                  placeholder="e.g., Sedan, SUV, Minivan" 
                                  value={newVehicle.type}
                                  onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="vehicle-capacity">Passenger Capacity</Label>
                                <Input 
                                  id="vehicle-capacity"
                                  type="number" 
                                  placeholder="Number of passengers" 
                                  min={1}
                                  max={50}
                                  value={newVehicle.capacity}
                                  onChange={(e) => setNewVehicle({...newVehicle, capacity: parseInt(e.target.value) || 1})}
                                />
                              </div>
                            </div>
                            <Button type="button" onClick={handleAddVehicle}>
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add Vehicle Type
                            </Button>
                          </div>
                        </div>
                        
                        <Alert className="mt-4 bg-blue-50">
                          <Info className="h-4 w-4" />
                          <AlertTitle>About Fleet Management</AlertTitle>
                          <AlertDescription>
                            <p className="mb-2">
                              Define your available vehicle fleet here. You'll be able to assign family groups to specific vehicles in the Transport Assignments page.
                            </p>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleViewAssignments}
                              size="sm"
                              className="mt-2"
                            >
                              <Car className="h-4 w-4 mr-2" />
                              Go to Transport Assignments
                            </Button>
                          </AlertDescription>
                        </Alert>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
            
            {/* Flight Assistance Mode Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Flight Assistance Mode
                </CardTitle>
                <CardDescription>
                  Configure flight coordination and assistance for your guests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="flightMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flight Assistance Mode</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select flight assistance mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No flight coordination</SelectItem>
                          <SelectItem value="collect_requirements">Collect flight requirements from guests</SelectItem>
                          <SelectItem value="provide_flights">Provide flights to guests</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How you'll handle flight coordination for guests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("flightMode") !== "none" && (
                  <>
                    <FormField
                      control={form.control}
                      name="recommendedAirlines"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recommended Airlines</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="List recommended airlines" />
                          </FormControl>
                          <FormDescription>
                            Airlines you recommend for guests (for reference or group bookings)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="airlineDiscountCodes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Airline Discount Codes</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Special discount codes" />
                          </FormControl>
                          <FormDescription>
                            Any group discount codes or special rates available
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="flightInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Flight Booking Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Instructions for guests about flight bookings"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Detailed instructions for guests about booking flights
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("flightMode") === "provide_flights" && (
                      <FormField
                        control={form.control}
                        name="flightSpecialDeals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Flight Deals</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Details about special flight deals or group rates"
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormDescription>
                              Information about special deals, group rates, or booking assistance
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="offerTravelAssistance"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <FormLabel className="text-base">Travel Assistance</FormLabel>
                            <FormDescription>
                              Offer personalized travel assistance to guests
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
                  </>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between pt-4">
              {onBack && (
                <Button type="button" variant="outline" onClick={onBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Transport Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transport Configuration</CardTitle>
              <CardDescription>
                Current transport settings for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between pb-2 border-b">
                  <dt className="font-medium">Transport Mode:</dt>
                  <dd>
                    <Badge variant="outline" className="ml-2">
                      {(() => {
                        switch (currentEvent?.transportMode) {
                          case PROVISION_MODES.ALL:
                            return "Provided for all guests";
                          case PROVISION_MODES.SELECTED:
                            return "Only for selected guests";
                          case PROVISION_MODES.SPECIAL_DEAL:
                            return "Transportation options/discounts";
                          default:
                            return "No transportation provided";
                        }
                      })()}
                    </Badge>
                  </dd>
                </div>
                
                {currentEvent?.transportMode !== PROVISION_MODES.NONE && (
                  <>
                    {currentEvent?.transportProviderName && (
                      <div className="flex flex-col sm:flex-row sm:justify-between pb-2 border-b">
                        <dt className="font-medium">Provider:</dt>
                        <dd>{currentEvent.transportProviderName}</dd>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between pb-2 border-b">
                      <dt className="font-medium">Transport Features:</dt>
                      <dd className="flex flex-wrap gap-2">
                        {currentEvent?.providesAirportPickup && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Airport Pickup
                          </Badge>
                        )}
                        {currentEvent?.providesVenueTransfers && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Venue Transfers
                          </Badge>
                        )}
                        {!currentEvent?.providesAirportPickup && !currentEvent?.providesVenueTransfers && (
                          <span className="text-muted-foreground">None specified</span>
                        )}
                      </dd>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between pb-2 border-b">
                      <dt className="font-medium">Vehicle Fleet:</dt>
                      <dd>
                        {vehicles.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {vehicles.map((vehicle) => (
                              <Badge key={vehicle.id} variant="outline">
                                {vehicle.type} ({vehicle.capacity} seats)
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No vehicles configured</span>
                        )}
                      </dd>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Guest Notifications:</dt>
                      <dd>
                        {currentEvent?.notifyGuests ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <Check className="h-3 w-3 mr-1" /> Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700">
                            Disabled
                          </Badge>
                        )}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
            <CardFooter className="flex justify-between">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <div className="flex space-x-2">
                <Button onClick={() => setIsEditing(true)}>
                  Edit Transport Settings
                </Button>
                <Button variant="outline" onClick={handleViewAssignments}>
                  <Car className="mr-2 h-4 w-4" />
                  Transport Assignments
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}