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
import { Loader2, Hotel, BedDouble, Plus, Trash2 } from "lucide-react";
import { WeddingEvent } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { PROVISION_MODES } from "@/lib/constants";

// Define schema for a hotel property
const hotelSchema = z.object({
  name: z.string().min(2, {
    message: "Hotel name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  description: z.string().optional(),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  amenities: z.string().optional(),
  specialDeals: z.string().optional(),
  bookingInstructions: z.string().optional(),
});

// Define schema for a room type
const roomTypeSchema = z.object({
  hotelIndex: z.number(),
  name: z.string().min(2, {
    message: "Room type name must be at least 2 characters.",
  }),
  bedType: z.string(),
  maxOccupancy: z.number().min(1, {
    message: "Maximum occupancy must be at least 1.",
  }),
  totalRooms: z.number().min(1, {
    message: "Total number of rooms must be at least 1.",
  }),
  pricePerNight: z.string().optional(),
  specialFeatures: z.string().optional(),
  description: z.string().optional(),
});

// Define schema for accommodation settings
const accommodationSettingsSchema = z.object({
  accommodationMode: z.enum([
    PROVISION_MODES.NONE,
    PROVISION_MODES.BLOCK,
    PROVISION_MODES.BOOK
  ]),
  accommodationInstructions: z.string().optional(),
  accommodationSpecialDeals: z.string().optional(),
});

// Define combined schema for hotels and room types
const hotelsStepSchema = z.object({
  accommodationSettings: accommodationSettingsSchema,
  hotels: z.array(hotelSchema).optional(),
  roomTypes: z.array(roomTypeSchema).optional(),
});

type HotelData = z.infer<typeof hotelSchema>;
type RoomTypeData = z.infer<typeof roomTypeSchema>;
type AccommodationSettingsData = z.infer<typeof accommodationSettingsSchema>;
type HotelsStepData = z.infer<typeof hotelsStepSchema>;

interface HotelsStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: HotelsStepData) => void;
  isCompleted: boolean;
}

export default function HotelsStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted,
}: HotelsStepProps) {
  // Fetch existing hotel data
  const { 
    data: existingHotels, 
    isLoading: isLoadingHotels 
  } = useQuery({
    queryKey: [`/api/events/${eventId}/hotels`],
    enabled: !!eventId,
  });

  // Fetch existing room types
  const { 
    data: existingRoomTypes, 
    isLoading: isLoadingRoomTypes 
  } = useQuery({
    queryKey: [`/api/events/${eventId}/room-types`],
    enabled: !!eventId,
  });

  // State for hotels and room types
  const [hotels, setHotels] = useState<HotelData[]>(
    existingHotels?.length > 0 
      ? existingHotels 
      : [{
          name: "",
          location: "",
          description: "",
          contactEmail: "",
          contactPhone: "",
          amenities: "",
          specialDeals: "",
          bookingInstructions: "",
        }]
  );

  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>(
    existingRoomTypes?.length > 0 
      ? existingRoomTypes 
      : [{
          hotelIndex: 0,
          name: "Standard Room",
          bedType: "Queen",
          maxOccupancy: 2,
          totalRooms: 10,
          pricePerNight: "₹5000",
          specialFeatures: "",
          description: "",
        }]
  );

  // Create form
  const form = useForm<HotelsStepData>({
    resolver: zodResolver(hotelsStepSchema),
    defaultValues: {
      accommodationSettings: {
        accommodationMode: currentEvent?.accommodationMode || PROVISION_MODES.NONE,
        accommodationInstructions: currentEvent?.accommodationInstructions || "",
        accommodationSpecialDeals: currentEvent?.accommodationSpecialDeals || "",
      },
      hotels: hotels,
      roomTypes: roomTypes,
    },
  });

  // Add hotel handler
  const addHotel = () => {
    const newHotels = [...hotels];
    newHotels.push({
      name: "",
      location: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      amenities: "",
      specialDeals: "",
      bookingInstructions: "",
    });
    setHotels(newHotels);
    form.setValue("hotels", newHotels);
  };

  // Remove hotel handler
  const removeHotel = (index: number) => {
    if (hotels.length > 1) {
      const newHotels = [...hotels];
      newHotels.splice(index, 1);
      setHotels(newHotels);
      form.setValue("hotels", newHotels);

      // Update room types to remove those associated with the deleted hotel
      // and update hotelIndex for room types associated with hotels after the deleted one
      const newRoomTypes = roomTypes.filter(rt => rt.hotelIndex !== index)
        .map(rt => {
          if (rt.hotelIndex > index) {
            return { ...rt, hotelIndex: rt.hotelIndex - 1 };
          }
          return rt;
        });
      setRoomTypes(newRoomTypes);
      form.setValue("roomTypes", newRoomTypes);
    }
  };

  // Add room type handler
  const addRoomType = (hotelIndex: number) => {
    const newRoomTypes = [...roomTypes];
    newRoomTypes.push({
      hotelIndex,
      name: "",
      bedType: "Queen",
      maxOccupancy: 2,
      totalRooms: 10,
      pricePerNight: "",
      specialFeatures: "",
      description: "",
    });
    setRoomTypes(newRoomTypes);
    form.setValue("roomTypes", newRoomTypes);
  };

  // Remove room type handler
  const removeRoomType = (index: number) => {
    const newRoomTypes = [...roomTypes];
    newRoomTypes.splice(index, 1);
    setRoomTypes(newRoomTypes);
    form.setValue("roomTypes", newRoomTypes);
  };

  const accommodationMode = form.watch("accommodationSettings.accommodationMode");

  // Submit handler
  function onSubmit(data: HotelsStepData) {
    onComplete(data);
  }

  if (isLoadingHotels || isLoadingRoomTypes) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading accommodation data...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Accommodation Settings</TabsTrigger>
            <TabsTrigger value="hotels" disabled={accommodationMode === PROVISION_MODES.NONE}>Hotels</TabsTrigger>
            <TabsTrigger value="rooms" disabled={accommodationMode === PROVISION_MODES.NONE}>Room Types</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="accommodationSettings.accommodationMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accommodation Mode</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accommodation mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PROVISION_MODES.NONE}>No Accommodation Provided</SelectItem>
                      <SelectItem value={PROVISION_MODES.BLOCK}>Hotel Block Reserved</SelectItem>
                      <SelectItem value={PROVISION_MODES.BOOK}>Directly Book for Guests</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How you'll handle guest accommodations
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {accommodationMode !== PROVISION_MODES.NONE && (
              <>
                <FormField
                  control={form.control}
                  name="accommodationSettings.accommodationInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Instructions for guests on how to book accommodation..." 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Information guests will need to book their stay
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accommodationSettings.accommodationSpecialDeals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Deals</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Special rates or deals for wedding guests..." 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Any discounts or special arrangements for your guests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="hotels" className="space-y-4 pt-4">
            {hotels.map((hotel, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <Hotel className="h-5 w-5 mr-2" />
                      Hotel {index + 1}
                    </CardTitle>
                    {hotels.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHotel(index)}
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
                        name={`hotels.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hotel Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Grand Hyatt Mumbai" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`hotels.${index}.location`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Santacruz East, Mumbai" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`hotels.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the hotel..." 
                                {...field} 
                                rows={3}
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
                          name={`hotels.${index}.contactEmail`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., reservations@hotel.com" 
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
                          name={`hotels.${index}.contactPhone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Phone</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., +91 22 1234 5678" 
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
                        name={`hotels.${index}.amenities`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amenities</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Free WiFi, Pool, Spa" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`hotels.${index}.bookingInstructions`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Booking Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How guests can book at this hotel..." 
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

                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addRoomType(index)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Room Type
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={addHotel}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Hotel
            </Button>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-4 pt-4">
            {roomTypes.map((roomType, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <BedDouble className="h-5 w-5 mr-2" />
                      Room Type for {hotels[roomType.hotelIndex]?.name || `Hotel ${roomType.hotelIndex + 1}`}
                    </CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRoomType(index)}
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
                        name={`roomTypes.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Type Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Deluxe Double" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`roomTypes.${index}.bedType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bed Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bed type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="Twin">Twin</SelectItem>
                                <SelectItem value="Double">Double</SelectItem>
                                <SelectItem value="Queen">Queen</SelectItem>
                                <SelectItem value="King">King</SelectItem>
                                <SelectItem value="Suite">Suite</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`roomTypes.${index}.maxOccupancy`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Occupancy</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1}
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`roomTypes.${index}.totalRooms`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Rooms</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min={1}
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`roomTypes.${index}.pricePerNight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price per Night</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., ₹5000" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`roomTypes.${index}.specialFeatures`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Features</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Sea view, Balcony" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`roomTypes.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional details about this room type..." 
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