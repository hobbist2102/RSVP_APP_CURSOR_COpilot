import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Bus, Car, Plus, Trash2 } from "lucide-react";
import { WeddingEvent } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

// Define schema for a transport mode
const transportModeSchema = z.object({
  name: z.string().min(2, {
    message: "Transport mode name must be at least 2 characters.",
  }),
  transportMode: z.enum(["car", "bus", "shuttle"]),
  vehicleType: z.string().min(2, {
    message: "Vehicle type must be at least 2 characters.",
  }),
  vehicleCapacity: z.number().min(1, {
    message: "Capacity must be at least 1.",
  }),
  count: z.number().min(1, {
    message: "Number of vehicles must be at least 1.",
  }),
  providerName: z.string().optional(),
  providerContact: z.string().optional(),
  notes: z.string().optional(),
});

// Define schema for a transport route
const transportRouteSchema = z.object({
  name: z.string().min(2, {
    message: "Route name must be at least 2 characters.",
  }),
  transportModeIndex: z.number(),
  pickupLocation: z.string().min(2, {
    message: "Pickup location must be at least 2 characters.",
  }),
  pickupDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Pickup date must be a valid date",
  }),
  pickupTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Pickup time must be in format HH:MM",
  }),
  dropoffLocation: z.string().min(2, {
    message: "Dropoff location must be at least 2 characters.",
  }),
  capacity: z.number().min(1, {
    message: "Capacity must be at least 1.",
  }),
  specialInstructions: z.string().optional(),
});

// Define combined schema for transport options
const transportStepSchema = z.object({
  transportModes: z.array(transportModeSchema).min(1, {
    message: "At least one transport mode is required",
  }),
  transportRoutes: z.array(transportRouteSchema).optional(),
  transportNotes: z.string().optional(),
  groupFamiliesTogether: z.boolean().default(true),
  priorityForElderlyAndChildren: z.boolean().default(true),
});

type TransportModeData = z.infer<typeof transportModeSchema>;
type TransportRouteData = z.infer<typeof transportRouteSchema>;
type TransportStepData = z.infer<typeof transportStepSchema>;

interface TransportStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: TransportStepData) => void;
  isCompleted: boolean;
}

export default function TransportStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted,
}: TransportStepProps) {
  // Fetch existing transport data
  const { 
    data: existingTransportFleet, 
    isLoading: isLoadingFleet 
  } = useQuery({
    queryKey: [`/api/events/${eventId}/transport-fleet`],
    enabled: !!eventId,
  });

  const { 
    data: existingTransportGroups, 
    isLoading: isLoadingGroups 
  } = useQuery({
    queryKey: [`/api/events/${eventId}/transport-groups`],
    enabled: !!eventId,
  });

  // State for transport modes and routes
  const [transportModes, setTransportModes] = useState<TransportModeData[]>(
    existingTransportFleet?.length > 0 
      ? existingTransportFleet 
      : [{
          name: "Wedding Shuttle",
          transportMode: "shuttle",
          vehicleType: "Minibus",
          vehicleCapacity: 20,
          count: 2,
          providerName: "",
          providerContact: "",
          notes: "",
        }]
  );

  const [transportRoutes, setTransportRoutes] = useState<TransportRouteData[]>(
    existingTransportGroups?.length > 0
      ? existingTransportGroups.map((group: any) => ({
          name: group.name,
          transportModeIndex: 0, // Default to first transport mode
          pickupLocation: group.pickupLocation,
          pickupDate: group.pickupDate || currentEvent?.startDate || new Date().toISOString().split('T')[0],
          pickupTime: group.pickupTime || "10:00",
          dropoffLocation: group.dropoffLocation,
          capacity: group.vehicleCapacity || 20,
          specialInstructions: group.specialInstructions || "",
        }))
      : [{
          name: "Hotel to Venue",
          transportModeIndex: 0,
          pickupLocation: "Main Hotel",
          pickupDate: currentEvent?.startDate || new Date().toISOString().split('T')[0],
          pickupTime: "10:00",
          dropoffLocation: "Wedding Venue",
          capacity: 20,
          specialInstructions: "",
        }]
  );

  // Create form
  const form = useForm<TransportStepData>({
    resolver: zodResolver(transportStepSchema),
    defaultValues: {
      transportModes: transportModes,
      transportRoutes: transportRoutes,
      transportNotes: "",
      groupFamiliesTogether: true,
      priorityForElderlyAndChildren: true,
    },
  });

  // Add transport mode handler
  const addTransportMode = () => {
    const newTransportModes = [...transportModes];
    newTransportModes.push({
      name: "",
      transportMode: "car",
      vehicleType: "",
      vehicleCapacity: 4,
      count: 1,
      providerName: "",
      providerContact: "",
      notes: "",
    });
    setTransportModes(newTransportModes);
    form.setValue("transportModes", newTransportModes);
  };

  // Remove transport mode handler
  const removeTransportMode = (index: number) => {
    if (transportModes.length > 1) {
      const newTransportModes = [...transportModes];
      newTransportModes.splice(index, 1);
      setTransportModes(newTransportModes);
      form.setValue("transportModes", newTransportModes);

      // Update routes that use this transport mode
      const newRoutes = transportRoutes.map(route => {
        if (route.transportModeIndex === index) {
          return { ...route, transportModeIndex: 0 };
        } else if (route.transportModeIndex > index) {
          return { ...route, transportModeIndex: route.transportModeIndex - 1 };
        }
        return route;
      });
      setTransportRoutes(newRoutes);
      form.setValue("transportRoutes", newRoutes);
    }
  };

  // Add transport route handler
  const addTransportRoute = () => {
    const newRoutes = [...transportRoutes];
    newRoutes.push({
      name: "",
      transportModeIndex: 0,
      pickupLocation: "",
      pickupDate: currentEvent?.startDate || new Date().toISOString().split('T')[0],
      pickupTime: "10:00",
      dropoffLocation: "",
      capacity: transportModes[0]?.vehicleCapacity || 4,
      specialInstructions: "",
    });
    setTransportRoutes(newRoutes);
    form.setValue("transportRoutes", newRoutes);
  };

  // Remove transport route handler
  const removeTransportRoute = (index: number) => {
    const newRoutes = [...transportRoutes];
    newRoutes.splice(index, 1);
    setTransportRoutes(newRoutes);
    form.setValue("transportRoutes", newRoutes);
  };

  // Submit handler
  function onSubmit(data: TransportStepData) {
    onComplete(data);
  }

  if (isLoadingFleet || isLoadingGroups) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading transport data...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="fleet" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fleet">Transport Fleet</TabsTrigger>
            <TabsTrigger value="routes">Transport Routes</TabsTrigger>
            <TabsTrigger value="settings">Transport Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="fleet" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Define the types of vehicles available for guest transportation
            </p>
            
            {transportModes.map((mode, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      {mode.transportMode === "bus" ? (
                        <Bus className="h-5 w-5 mr-2" />
                      ) : (
                        <Car className="h-5 w-5 mr-2" />
                      )}
                      Vehicle Type {index + 1}
                    </CardTitle>
                    {transportModes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTransportMode(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`transportModes.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Wedding Shuttle" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              A name for this transport type
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`transportModes.${index}.transportMode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transport Mode</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select transport mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="car">Car</SelectItem>
                                <SelectItem value="bus">Bus</SelectItem>
                                <SelectItem value="shuttle">Shuttle</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`transportModes.${index}.vehicleType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Type</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Minibus, SUV, Sedan" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`transportModes.${index}.vehicleCapacity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacity</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1}
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Passengers per vehicle
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`transportModes.${index}.count`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Count</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min={1}
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Number of vehicles
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`transportModes.${index}.providerName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., City Transports Ltd." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`transportModes.${index}.providerContact`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider Contact</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., +91 98765 43210" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name={`transportModes.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional information about this transport mode..." 
                              {...field} 
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={addTransportMode}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Vehicle Type
            </Button>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Define transport routes for your guests
            </p>
            
            {transportRoutes.map((route, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      Route {index + 1}
                    </CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTransportRoute(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`transportRoutes.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Route Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Hotel to Ceremony" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`transportRoutes.${index}.transportModeIndex`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transport Mode</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select transport mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {transportModes.map((mode, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {mode.name || `Transport Type ${i + 1}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`transportRoutes.${index}.pickupLocation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pickup Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Grand Hyatt Lobby" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`transportRoutes.${index}.dropoffLocation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dropoff Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Wedding Venue Main Entrance" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`transportRoutes.${index}.pickupDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`transportRoutes.${index}.pickupTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pickup Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="time" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`transportRoutes.${index}.capacity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min={1}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Total passengers for this route
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`transportRoutes.${index}.specialInstructions`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional information about this route..." 
                                {...field} 
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={addTransportRoute}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Route
            </Button>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transport Allocation Settings</CardTitle>
                <CardDescription>
                  Configure how guests are assigned to transport groups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="groupFamiliesTogether"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Group families together</FormLabel>
                        <FormDescription>
                          Keep family members in the same vehicle whenever possible
                        </FormDescription>
                      </div>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priorityForElderlyAndChildren"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Priority for elderly and children</FormLabel>
                        <FormDescription>
                          Give priority to elderly guests and families with children
                        </FormDescription>
                      </div>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transportNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transport Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="General notes about transportation arrangements..." 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        These notes will be shared with the transport coordinator
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting || isCompleted}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isCompleted ? (
              "Completed"
            ) : (
              "Complete & Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}