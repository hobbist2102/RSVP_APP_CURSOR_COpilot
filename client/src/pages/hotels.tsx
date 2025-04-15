import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Building, Edit, Hotel, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Hotel form schema
const hotelFormSchema = z.object({
  name: z.string().min(1, { message: "Hotel name is required" }),
  address: z.string().min(1, { message: "Address is required" }),
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

export default function HotelsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentEvent } = useCurrentEvent();
  const eventId = currentEvent?.id;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const navigate = useNavigate();

  // Fetch hotels
  const { data: hotels, isLoading, error } = useQuery({
    queryKey: ['/api/hotels', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiRequest('GET', `/api/hotels/by-event/${eventId}`);
      return await response.json();
    },
    enabled: !!eventId,
  });

  // Form for adding/editing hotels
  const form = useForm<z.infer<typeof hotelFormSchema>>({
    resolver: zodResolver(hotelFormSchema),
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
    },
  });

  // Create hotel mutation
  const createHotelMutation = useMutation({
    mutationFn: async (data: z.infer<typeof hotelFormSchema>) => {
      const response = await apiRequest('POST', '/api/hotels', {
        ...data,
        eventId,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hotels', eventId] });
      toast({
        title: "Hotel created",
        description: "The hotel has been added successfully",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create hotel",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Update hotel mutation
  const updateHotelMutation = useMutation({
    mutationFn: async (data: z.infer<typeof hotelFormSchema> & { id: number }) => {
      const { id, ...hotelData } = data;
      const response = await apiRequest('PUT', `/api/hotels/${id}`, hotelData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hotels', eventId] });
      toast({
        title: "Hotel updated",
        description: "The hotel has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedHotel(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update hotel",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete hotel mutation
  const deleteHotelMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/hotels/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete hotel");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hotels', eventId] });
      toast({
        title: "Hotel deleted",
        description: "The hotel has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedHotel(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete hotel",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof hotelFormSchema>) => {
    if (selectedHotel) {
      updateHotelMutation.mutate({ ...data, id: selectedHotel.id });
    } else {
      createHotelMutation.mutate(data);
    }
  };

  // Edit hotel handler
  const handleEditHotel = (hotel: any) => {
    setSelectedHotel(hotel);
    form.reset({
      name: hotel.name || "",
      address: hotel.address || "",
      phone: hotel.phone || "",
      website: hotel.website || "",
      description: hotel.description || "",
      isDefault: hotel.isDefault || false,
      priceRange: hotel.priceRange || "",
      distanceFromVenue: hotel.distanceFromVenue || "",
      amenities: hotel.amenities || "",
      specialNotes: hotel.specialNotes || "",
      bookingInstructions: hotel.bookingInstructions || "",
    });
    setIsEditDialogOpen(true);
  };

  // Delete hotel handler
  const handleDeleteHotel = (hotel: any) => {
    setSelectedHotel(hotel);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete hotel
  const confirmDeleteHotel = async () => {
    if (!selectedHotel) return;
    setDeleteLoading(true);
    try {
      await deleteHotelMutation.mutateAsync(selectedHotel.id);
    } catch (error) {
      console.error("Error deleting hotel:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Add new hotel
  const handleAddHotel = () => {
    form.reset({
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
    setIsAddDialogOpen(true);
  };

  if (!eventId) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="mb-6">
          <Building className="h-4 w-4" />
          <AlertTitle>No event selected</AlertTitle>
          <AlertDescription>
            Please select an event from the dashboard to manage hotels.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/events")}>Go to Events</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Management</h1>
          <p className="text-muted-foreground">
            Manage hotels and accommodations for your wedding event
          </p>
        </div>
        <Button onClick={handleAddHotel}>
          <Hotel className="mr-2 h-4 w-4" />
          Add New Hotel
        </Button>
      </div>

      <Separator className="my-6" />

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <p className="text-muted-foreground">Loading hotels...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load hotels. Please try again.
          </AlertDescription>
        </Alert>
      ) : hotels?.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hotels found</CardTitle>
            <CardDescription>
              Add hotels to provide accommodation options for your wedding guests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Start by adding a hotel using the "Add New Hotel" button above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels?.map((hotel: any) => (
                <TableRow key={hotel.id}>
                  <TableCell className="font-medium">{hotel.name}</TableCell>
                  <TableCell>{hotel.address}</TableCell>
                  <TableCell>{hotel.priceRange || "Not specified"}</TableCell>
                  <TableCell>
                    {hotel.isDefault && (
                      <Badge variant="default">Default</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditHotel(hotel)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteHotel(hotel)}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Hotel Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Hotel</DialogTitle>
            <DialogDescription>
              Enter the details of the hotel for your wedding guests
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Taj Mahal Palace" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Default Hotel</FormLabel>
                        <FormDescription>
                          Set as the primary hotel for guests
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

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="Full hotel address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., +91 22 6665 3366" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., https://www.tajhotels.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the hotel" 
                        {...field} 
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ₹8,000 - ₹15,000 per night" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distanceFromVenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance from Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2 km from main venue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Pool, Spa, Restaurant, Room Service" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Separate multiple amenities with commas
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
                        placeholder="Instructions for guests to book this hotel" 
                        {...field} 
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information for guests" 
                        {...field} 
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createHotelMutation.isPending}
                >
                  {createHotelMutation.isPending ? "Saving..." : "Save Hotel"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Hotel Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hotel</DialogTitle>
            <DialogDescription>
              Update the details of this hotel
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Taj Mahal Palace" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Default Hotel</FormLabel>
                        <FormDescription>
                          Set as the primary hotel for guests
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

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="Full hotel address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., +91 22 6665 3366" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., https://www.tajhotels.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the hotel" 
                        {...field} 
                        value={field.value || ""}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ₹8,000 - ₹15,000 per night" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distanceFromVenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance from Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2 km from main venue" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Pool, Spa, Restaurant, Room Service" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate multiple amenities with commas
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
                        placeholder="Instructions for guests to book this hotel" 
                        {...field} 
                        value={field.value || ""}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information for guests" 
                        {...field} 
                        value={field.value || ""}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateHotelMutation.isPending}
                >
                  {updateHotelMutation.isPending ? "Saving..." : "Update Hotel"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this hotel? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteHotel}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Hotel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}