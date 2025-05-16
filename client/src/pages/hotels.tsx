import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Building, Hotel, BedDouble } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiEndpoints } from "@/lib/api-utils";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Define schemas
const hotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  priceRange: z.string().optional(),
  distanceFromVenue: z.string().optional(),
  amenities: z.string().optional(),
  specialNotes: z.string().optional(),
  bookingInstructions: z.string().optional(),
});

type Hotel = {
  id: number;
  eventId: number;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  description?: string;
  isDefault: boolean;
  priceRange?: string;
  distanceFromVenue?: string;
  amenities?: string;
  specialNotes?: string;
  bookingInstructions?: string;
  createdAt: string;
};

const accommodationSchema = z.object({
  hotelId: z.number(),
  name: z.string().min(1, "Room name is required"),
  roomType: z.string().min(1, "Room type is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  totalRooms: z.number().min(1, "Total rooms must be at least 1"),
  pricePerNight: z.string().optional(),
  specialFeatures: z.string().optional(),
  globalRoomTypeId: z.number().optional(),
  showPricing: z.boolean().default(false),
  createGlobalType: z.boolean().default(true),
});

type Accommodation = {
  id: number;
  eventId: number;
  hotelId: number;
  globalRoomTypeId?: number;
  name: string;
  roomType: string;
  capacity: number;
  totalRooms: number;
  allocatedRooms: number;
  pricePerNight?: string;
  specialFeatures?: string;
  showPricing?: boolean;
};

type GlobalRoomType = {
  id: number;
  hotelName: string;
  name: string;
  category: string;
  capacity: number;
  specialFeatures?: string;
  createdAt: string;
};

const HotelsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentEvent } = useCurrentEvent();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isAddingHotel, setIsAddingHotel] = useState(false);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  
  // Fetch hotels for current event
  const {
    data: hotels = [],
    isLoading: hotelsLoading,
    error: hotelsError
  } = useQuery({
    queryKey: ['hotels', currentEvent?.id],
    queryFn: async () => {
      if (!currentEvent) return [];
      const response = await fetch(`/api/hotels/by-event/${currentEvent.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }
      return response.json();
    },
    enabled: !!currentEvent
  });
  
  // Create hotel form
  const hotelForm = useForm<z.infer<typeof hotelSchema>>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      website: "",
      description: "",
      isDefault: false,
      priceRange: "",
      distanceFromVenue: "",
      amenities: "",
      specialNotes: "",
      bookingInstructions: "",
    }
  });
  
  // Create accommodation form
  const accommodationForm = useForm<z.infer<typeof accommodationSchema>>({
    resolver: zodResolver(accommodationSchema),
    defaultValues: {
      hotelId: 0,
      name: "",
      roomType: "",
      capacity: 1,
      totalRooms: 1,
      pricePerNight: "",
      specialFeatures: "",
      globalRoomTypeId: undefined,
      showPricing: false,
      createGlobalType: true
    }
  });
  
  // Reset forms when selection changes
  React.useEffect(() => {
    if (selectedHotel) {
      hotelForm.reset({
        name: selectedHotel.name,
        address: selectedHotel.address,
        phone: selectedHotel.phone || "",
        website: selectedHotel.website || "",
        description: selectedHotel.description || "",
        isDefault: selectedHotel.isDefault,
        priceRange: selectedHotel.priceRange || "",
        distanceFromVenue: selectedHotel.distanceFromVenue || "",
        amenities: selectedHotel.amenities || "",
        specialNotes: selectedHotel.specialNotes || "",
        bookingInstructions: selectedHotel.bookingInstructions || "",
      });
    } else {
      hotelForm.reset({
        name: "",
        address: "",
        phone: "",
        website: "",
        description: "",
        isDefault: false,
        priceRange: "",
        distanceFromVenue: "",
        amenities: "",
        specialNotes: "",
        bookingInstructions: "",
      });
    }
  }, [selectedHotel, hotelForm]);
  
  React.useEffect(() => {
    if (selectedHotel) {
      accommodationForm.setValue("hotelId", selectedHotel.id);
    }
  }, [selectedHotel, accommodationForm]);
  
  // Fetch global room types
  const {
    data: globalRoomTypes = [],
    isLoading: globalRoomTypesLoading
  } = useQuery({
    queryKey: ['globalRoomTypes'],
    queryFn: async () => {
      const response = await fetch('/api/global-room-types');
      if (!response.ok) {
        throw new Error('Failed to fetch global room types');
      }
      return response.json();
    }
  });
  
  // Fetch global room types for selected hotel
  const {
    data: hotelGlobalRoomTypes = [],
    isLoading: hotelGlobalRoomTypesLoading
  } = useQuery({
    queryKey: ['globalRoomTypes', selectedHotel?.name],
    queryFn: async () => {
      if (!selectedHotel) return [];
      const response = await fetch(`/api/global-room-types/hotel/${encodeURIComponent(selectedHotel.name)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch global room types for hotel');
      }
      return response.json();
    },
    enabled: !!selectedHotel
  });
  
  // Fetch accommodations for selected hotel
  const {
    data: accommodations = [],
    isLoading: accommodationsLoading,
    error: accommodationsError
  } = useQuery({
    queryKey: ['accommodations', currentEvent?.id, selectedHotel?.id],
    queryFn: async () => {
      if (!currentEvent || !selectedHotel) return [];
      const response = await fetch(`/api/events/${currentEvent.id}/accommodations?hotelId=${selectedHotel.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch accommodations');
      }
      return response.json();
    },
    enabled: !!currentEvent && !!selectedHotel
  });
  
  // Create hotel mutation
  const createHotelMutation = useMutation({
    mutationFn: async (hotelData: z.infer<typeof hotelSchema>) => {
      if (!currentEvent) throw new Error('No event selected');
      const response = await fetch(`/api/hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...hotelData,
          eventId: currentEvent.id,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create hotel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hotel created successfully",
      });
      setIsAddingHotel(false);
      queryClient.invalidateQueries({queryKey: ['hotels', currentEvent?.id]});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update hotel mutation
  const updateHotelMutation = useMutation({
    mutationFn: async (hotelData: z.infer<typeof hotelSchema>) => {
      if (!selectedHotel) throw new Error('No hotel selected');
      const response = await fetch(`/api/hotels/${selectedHotel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update hotel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hotel updated successfully",
      });
      setSelectedHotel(null);
      queryClient.invalidateQueries({queryKey: ['hotels', currentEvent?.id]});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete hotel mutation
  const deleteHotelMutation = useMutation({
    mutationFn: async (hotelId: number) => {
      const response = await fetch(`/api/hotels/${hotelId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete hotel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hotel deleted successfully",
      });
      setSelectedHotel(null);
      queryClient.invalidateQueries({queryKey: ['hotels', currentEvent?.id]});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create accommodation mutation
  const createAccommodationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof accommodationSchema>) => {
      if (!currentEvent) throw new Error('No event selected');
      const response = await fetch(`/api/events/${currentEvent.id}/accommodations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          eventId: currentEvent.id,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create accommodation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room type created successfully",
      });
      setIsAddingRoom(false);
      accommodationForm.reset();
      queryClient.invalidateQueries({queryKey: ['accommodations', currentEvent?.id, selectedHotel?.id]});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update accommodation mutation
  const updateAccommodationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof accommodationSchema>) => {
      if (!selectedAccommodation) throw new Error('No accommodation selected');
      const response = await fetch(`/api/accommodations/${selectedAccommodation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update accommodation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room type updated successfully",
      });
      setSelectedAccommodation(null);
      accommodationForm.reset();
      queryClient.invalidateQueries({queryKey: ['accommodations', currentEvent?.id, selectedHotel?.id]});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Hotel form submit handler
  const onHotelSubmit = (data: z.infer<typeof hotelSchema>) => {
    if (selectedHotel) {
      updateHotelMutation.mutate(data);
    } else {
      createHotelMutation.mutate(data);
    }
  };
  
  // Accommodation form submit handler
  const onAccommodationSubmit = (data: z.infer<typeof accommodationSchema>) => {
    if (selectedAccommodation) {
      updateAccommodationMutation.mutate(data);
    } else {
      createAccommodationMutation.mutate(data);
    }
  };
  
  // Render loading state
  if (hotelsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading hotels...</span>
        </div>
      </DashboardLayout>
    );
  }
  
  // Render error state
  if (hotelsError) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load hotels. Please try again later.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Hotels & Accommodations</h1>
            <p className="text-muted-foreground">
              Manage hotels and room types for guest accommodation
            </p>
          </div>
          <Button onClick={() => {
            setSelectedHotel(null);
            setIsAddingHotel(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Hotel
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        {hotels.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <Building className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Hotels Added Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Get started by adding hotels where your guests will stay during the event.
              </p>
              <Button onClick={() => {
                setSelectedHotel(null);
                setIsAddingHotel(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Hotel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel: Hotel) => (
              <Card key={hotel.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{hotel.name}</CardTitle>
                    {hotel.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  <CardDescription>{hotel.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {hotel.phone && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2">Phone:</span>
                      <span>{hotel.phone}</span>
                    </div>
                  )}
                  {hotel.website && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2">Website:</span>
                      <a 
                        href={hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Site
                      </a>
                    </div>
                  )}
                  {hotel.description && (
                    <p className="text-sm mt-2">{hotel.description}</p>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedHotel(hotel)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setSelectedHotel(hotel);
                    setIsAddingRoom(true);
                  }}>
                    <BedDouble className="mr-2 h-4 w-4" />
                    Rooms
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Hotel Dialog */}
      <Dialog open={isAddingHotel || !!selectedHotel} onOpenChange={(open) => {
        if (!open) {
          setIsAddingHotel(false);
          setSelectedHotel(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedHotel ? "Edit Hotel" : "Add New Hotel"}</DialogTitle>
            <DialogDescription>
              {selectedHotel ? "Update hotel details or make changes to its information." : "Enter details for the new hotel to add it to your event."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...hotelForm}>
            <form onSubmit={hotelForm.handleSubmit(onHotelSubmit)} className="space-y-6">
              <Tabs defaultValue="basic">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Additional Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <FormField
                    control={hotelForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hotel Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Grand Hotel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={hotelForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Full hotel address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={hotelForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={hotelForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="www.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={hotelForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description of the hotel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={hotelForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Default Hotel</FormLabel>
                          <FormDescription>
                            Make this the default accommodation for guests
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <FormField
                    control={hotelForm.control}
                    name="priceRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Range</FormLabel>
                        <FormControl>
                          <Input placeholder="₹5000-10000 per night" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={hotelForm.control}
                    name="distanceFromVenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance from Venue</FormLabel>
                        <FormControl>
                          <Input placeholder="5 km or 15 minutes by car" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={hotelForm.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amenities</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="WiFi, Swimming Pool, Restaurant, Spa, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter amenities separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={hotelForm.control}
                    name="specialNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special notes for guests"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={hotelForm.control}
                    name="bookingInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Instructions for making reservations"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsAddingHotel(false);
                    setSelectedHotel(null);
                  }}
                >
                  Cancel
                </Button>
                {selectedHotel && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this hotel? This action cannot be undone.")) {
                        deleteHotelMutation.mutate(selectedHotel.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
                <Button type="submit" disabled={hotelForm.formState.isSubmitting}>
                  {hotelForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    selectedHotel ? "Update Hotel" : "Add Hotel"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Accommodations Dialog */}
      <Dialog open={isAddingRoom || !!selectedAccommodation} onOpenChange={(open) => {
        if (!open) {
          setIsAddingRoom(false);
          setSelectedAccommodation(null);
        }
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAccommodation ? "Edit Room Type" : "Add Room Type"}
            </DialogTitle>
            <DialogDescription>
              {selectedHotel ? `Managing rooms for ${selectedHotel.name}` : "Add a new room type to this hotel"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedHotel ? (
            <>
              {!selectedAccommodation && accommodations.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mb-3">Existing Room Types</h3>
                  <div className="mb-6 space-y-2 max-h-[200px] overflow-y-auto">
                    {accommodations.map((acc: Accommodation) => (
                      <div 
                        key={acc.id} 
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => {
                          setSelectedAccommodation(acc);
                          accommodationForm.reset({
                            hotelId: acc.hotelId,
                            name: acc.name,
                            roomType: acc.roomType,
                            capacity: acc.capacity,
                            totalRooms: acc.totalRooms,
                            pricePerNight: acc.pricePerNight || "",
                            specialFeatures: acc.specialFeatures || "",
                          });
                        }}
                      >
                        <div>
                          <div className="font-medium">{acc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {acc.roomType} · Capacity: {acc.capacity} · {acc.totalRooms} rooms
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Separator className="mb-6" />
                </>
              )}
            
              <Form {...accommodationForm}>
                <form onSubmit={accommodationForm.handleSubmit(onAccommodationSubmit)} className="space-y-4">
                  <FormField
                    control={accommodationForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Deluxe Room" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accommodationForm.control}
                    name="roomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Deluxe">Deluxe</SelectItem>
                            <SelectItem value="Suite">Suite</SelectItem>
                            <SelectItem value="Executive">Executive</SelectItem>
                            <SelectItem value="Family">Family</SelectItem>
                            <SelectItem value="Presidential">Presidential</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={accommodationForm.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1}
                              {...field}
                              value={field.value}
                              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accommodationForm.control}
                      name="totalRooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Rooms</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1}
                              {...field}
                              value={field.value}
                              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={accommodationForm.control}
                    name="pricePerNight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Per Night</FormLabel>
                        <FormControl>
                          <Input placeholder="₹5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accommodationForm.control}
                    name="specialFeatures"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Features</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="King-sized bed, ocean view, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsAddingRoom(false);
                        setSelectedAccommodation(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={accommodationForm.formState.isSubmitting}>
                      {accommodationForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        selectedAccommodation ? "Update Room" : "Add Room"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          ) : (
            <div className="py-8 text-center">
              <Alert>
                <AlertTitle>No Hotel Selected</AlertTitle>
                <AlertDescription>
                  Please select a hotel first to manage its room types.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HotelsPage;