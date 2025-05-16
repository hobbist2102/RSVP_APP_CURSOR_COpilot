import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCurrentEvent } from "@/hooks/use-current-event";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { apiRequest } from "@/lib/api-utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Building2, 
  Plus, 
  Search, 
  Bed, 
  MapPin, 
  Phone, 
  Globe, 
  User, 
  ArrowUpDown, 
  Calendar, 
  Pencil, 
  Trash2 
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Form schemas for validation
const hotelFormSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  totalRooms: z.coerce.number().positive("Must be a positive number"),
  bookingInstructions: z.string().optional(),
  hasShuttle: z.boolean().default(false),
  specialRates: z.boolean().default(false),
  specialRatesDetails: z.string().optional(),
  specialNotes: z.string().optional(),
});

const roomAllocationSchema = z.object({
  guestId: z.coerce.number().positive("Guest is required"),
  hotelId: z.coerce.number().positive("Hotel is required"),
  roomNumber: z.string().optional(),
  roomType: z.string().optional(),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  specialRequests: z.string().optional(),
});

export default function Accommodations() {
  const { toast } = useToast();
  const { currentEvent } = useCurrentEvent();
  const [activeTab, setActiveTab] = useState("hotels");
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [showAddHotelDialog, setShowAddHotelDialog] = useState(false);
  const [showEditHotelDialog, setShowEditHotelDialog] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [showAddAllocationDialog, setShowAddAllocationDialog] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<any | null>(null);
  const [showEditAllocationDialog, setShowEditAllocationDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const hotelForm = useForm<z.infer<typeof hotelFormSchema>>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      website: "",
      description: "",
      totalRooms: 0,
      bookingInstructions: "",
      hasShuttle: false,
      specialRates: false,
      specialRatesDetails: "",
      specialNotes: "",
    },
  });
  
  const allocationForm = useForm<z.infer<typeof roomAllocationSchema>>({
    resolver: zodResolver(roomAllocationSchema),
    defaultValues: {
      guestId: 0,
      hotelId: 0,
      roomNumber: "",
      roomType: "",
      checkIn: "",
      checkOut: "",
      specialRequests: "",
    },
  });
  
  // Load hotels and allocations data
  useEffect(() => {
    if (!currentEvent) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch hotels
        const hotelsResponse = await apiRequest(
          "GET", 
          `/api/events/${currentEvent.id}/hotels`
        );
        const hotelsData = await hotelsResponse.json();
        setHotels(hotelsData);
        
        // Fetch room allocations
        const allocationsResponse = await apiRequest(
          "GET", 
          `/api/events/${currentEvent.id}/room-allocations`
        );
        const allocationsData = await allocationsResponse.json();
        setAllocations(allocationsData);
        
        // Fetch guests for allocation form
        const guestsResponse = await apiRequest(
          "GET", 
          `/api/events/${currentEvent.id}/guests`
        );
        const guestsData = await guestsResponse.json();
        setGuests(guestsData);
        
      } catch (error) {
        console.error("Error fetching accommodation data:", error);
        toast({
          title: "Error",
          description: "Failed to load accommodation data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentEvent, toast]);
  
  // Handle add hotel form submission
  const onSubmitAddHotel = async (data: z.infer<typeof hotelFormSchema>) => {
    if (!currentEvent) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "POST", 
        `/api/events/${currentEvent.id}/hotels`, 
        {
          ...data,
          eventId: currentEvent.id
        }
      );
      
      if (response.ok) {
        const newHotel = await response.json();
        setHotels([...hotels, newHotel]);
        setShowAddHotelDialog(false);
        hotelForm.reset();
        toast({
          title: "Success",
          description: "Hotel added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add hotel",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding hotel:", error);
      toast({
        title: "Error",
        description: "Failed to add hotel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit hotel form
  const onSubmitEditHotel = async (data: z.infer<typeof hotelFormSchema>) => {
    if (!currentEvent || !selectedHotel) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "PUT", 
        `/api/events/${currentEvent.id}/hotels/${selectedHotel.id}`, 
        data
      );
      
      if (response.ok) {
        const updatedHotel = await response.json();
        setHotels(hotels.map(hotel => 
          hotel.id === updatedHotel.id ? updatedHotel : hotel
        ));
        setShowEditHotelDialog(false);
        toast({
          title: "Success",
          description: "Hotel updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update hotel",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating hotel:", error);
      toast({
        title: "Error",
        description: "Failed to update hotel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete hotel
  const handleDeleteHotel = async (hotelId: number) => {
    if (!currentEvent) return;
    
    if (!confirm("Are you sure you want to delete this hotel? This will also remove all room allocations for this hotel.")) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "DELETE", 
        `/api/events/${currentEvent.id}/hotels/${hotelId}`
      );
      
      if (response.ok) {
        setHotels(hotels.filter(hotel => hotel.id !== hotelId));
        // Also filter out related allocations
        setAllocations(allocations.filter(allocation => allocation.hotelId !== hotelId));
        toast({
          title: "Success",
          description: "Hotel deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete hotel",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting hotel:", error);
      toast({
        title: "Error",
        description: "Failed to delete hotel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle add room allocation form submission
  const onSubmitAddAllocation = async (data: z.infer<typeof roomAllocationSchema>) => {
    if (!currentEvent) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "POST", 
        `/api/events/${currentEvent.id}/room-allocations`, 
        data
      );
      
      if (response.ok) {
        const newAllocation = await response.json();
        setAllocations([...allocations, newAllocation]);
        setShowAddAllocationDialog(false);
        allocationForm.reset();
        toast({
          title: "Success",
          description: "Room allocation added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add room allocation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding room allocation:", error);
      toast({
        title: "Error",
        description: "Failed to add room allocation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit room allocation
  const onSubmitEditAllocation = async (data: z.infer<typeof roomAllocationSchema>) => {
    if (!currentEvent || !selectedAllocation) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "PUT", 
        `/api/events/${currentEvent.id}/room-allocations/${selectedAllocation.id}`, 
        data
      );
      
      if (response.ok) {
        const updatedAllocation = await response.json();
        setAllocations(allocations.map(allocation => 
          allocation.id === updatedAllocation.id ? updatedAllocation : allocation
        ));
        setShowEditAllocationDialog(false);
        toast({
          title: "Success",
          description: "Room allocation updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update room allocation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating room allocation:", error);
      toast({
        title: "Error",
        description: "Failed to update room allocation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete room allocation
  const handleDeleteAllocation = async (allocationId: number) => {
    if (!currentEvent) return;
    
    if (!confirm("Are you sure you want to delete this room allocation?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "DELETE", 
        `/api/events/${currentEvent.id}/room-allocations/${allocationId}`
      );
      
      if (response.ok) {
        setAllocations(allocations.filter(allocation => allocation.id !== allocationId));
        toast({
          title: "Success",
          description: "Room allocation deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete room allocation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting room allocation:", error);
      toast({
        title: "Error",
        description: "Failed to delete room allocation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Prepare data for hotel statistics
  const prepareHotelStats = () => {
    // Count allocations per hotel
    const hotelAllocationCounts = hotels.map(hotel => {
      const count = allocations.filter(allocation => allocation.hotelId === hotel.id).length;
      return {
        name: hotel.name,
        count,
      };
    });
    
    return hotelAllocationCounts;
  };
  
  // Define hotel table columns
  const hotelColumns = [
    {
      accessorKey: "name",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Hotel Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-gray-500" />
          <span>{row.original.address}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalRooms",
      header: "Total Rooms",
      cell: ({ row }: any) => (
        <div className="text-center">{row.original.totalRooms}</div>
      ),
    },
    {
      accessorKey: "allocatedRooms",
      header: "Allocated",
      cell: ({ row }: any) => {
        const hotelId = row.original.id;
        const allocated = allocations.filter(a => a.hotelId === hotelId).length;
        const total = row.original.totalRooms;
        const percentage = total > 0 ? Math.round((allocated / total) * 100) : 0;
        
        return (
          <div className="text-center">
            <span>{allocated} / {total}</span>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "features",
      header: "Features",
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          {row.original.hasShuttle && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Shuttle
            </Badge>
          )}
          {row.original.specialRates && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Special Rates
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedHotel(row.original);
              hotelForm.reset({
                name: row.original.name,
                address: row.original.address,
                phone: row.original.phone || "",
                website: row.original.website || "",
                description: row.original.description || "",
                totalRooms: row.original.totalRooms,
                bookingInstructions: row.original.bookingInstructions || "",
                hasShuttle: row.original.hasShuttle || false,
                specialRates: row.original.specialRates || false,
                specialRatesDetails: row.original.specialRatesDetails || "",
                specialNotes: row.original.specialNotes || "",
              });
              setShowEditHotelDialog(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={() => handleDeleteHotel(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  // Define allocations table columns
  const allocationColumns = [
    {
      accessorKey: "guestName",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Guest
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => {
        const guest = guests.find(g => g.id === row.original.guestId);
        const guestName = guest 
          ? `${guest.firstName} ${guest.lastName}` 
          : `Guest ID: ${row.original.guestId}`;
        
        return (
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4 text-gray-500" />
            <span className="font-medium">{guestName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "hotelName",
      header: "Hotel",
      cell: ({ row }: any) => {
        const hotel = hotels.find(h => h.id === row.original.hotelId);
        return (
          <div className="flex items-center">
            <Building2 className="mr-2 h-4 w-4 text-gray-500" />
            <span>{hotel ? hotel.name : `Hotel ID: ${row.original.hotelId}`}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "roomDetails",
      header: "Room",
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <Bed className="mr-2 h-4 w-4 text-gray-500" />
          <span>
            {row.original.roomNumber 
              ? `Room ${row.original.roomNumber}` 
              : "No room number"
            }
            {row.original.roomType && ` (${row.original.roomType})`}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "dates",
      header: "Dates",
      cell: ({ row }: any) => {
        const checkIn = new Date(row.original.checkIn).toLocaleDateString();
        const checkOut = new Date(row.original.checkOut).toLocaleDateString();
        
        return (
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            <span>{checkIn} - {checkOut}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedAllocation(row.original);
              allocationForm.reset({
                guestId: row.original.guestId,
                hotelId: row.original.hotelId,
                roomNumber: row.original.roomNumber || "",
                roomType: row.original.roomType || "",
                checkIn: row.original.checkIn.substring(0, 10), // Format yyyy-mm-dd for date input
                checkOut: row.original.checkOut.substring(0, 10),
                specialRequests: row.original.specialRequests || "",
              });
              setShowEditAllocationDialog(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={() => handleDeleteAllocation(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  // Prepare hotel statistics for visualization
  const hotelStats = prepareHotelStats();
  const totalAllocated = allocations.length;
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-playfair font-bold text-neutral">Accommodations</h2>
          <p className="text-sm text-gray-500">
            Manage hotel accommodations and room allocations for your event
          </p>
        </div>
        
        <Tabs defaultValue="hotels" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-[400px]">
            <TabsTrigger value="hotels">
              <Building2 className="mr-2 h-4 w-4" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="allocations">
              <Bed className="mr-2 h-4 w-4" />
              Room Allocations
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              Dashboard
            </TabsTrigger>
          </TabsList>
          
          {/* Hotels Tab */}
          <TabsContent value="hotels">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Hotels</h3>
              <Button onClick={() => {
                hotelForm.reset();
                setShowAddHotelDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Hotel
              </Button>
            </div>
            
            {hotels.length > 0 ? (
              <Card>
                <CardContent className="py-4">
                  <DataTable 
                    columns={hotelColumns} 
                    data={hotels} 
                    searchField="name"
                    defaultSortingColumn="name"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Building2 className="h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium mb-2">No Hotels Added</h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                      You haven't added any hotels for this event yet. Add hotels to manage accommodations for your guests.
                    </p>
                    <Button onClick={() => {
                      hotelForm.reset();
                      setShowAddHotelDialog(true);
                    }}>
                      <Plus className="mr-2 h-4 w-4" /> Add First Hotel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Room Allocations Tab */}
          <TabsContent value="allocations">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Room Allocations</h3>
              <Button 
                onClick={() => {
                  allocationForm.reset();
                  setShowAddAllocationDialog(true);
                }}
                disabled={hotels.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" /> Assign Room
              </Button>
            </div>
            
            {hotels.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Building2 className="h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium mb-2">No Hotels Available</h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                      You need to add hotels first before you can assign rooms to guests.
                    </p>
                    <Button onClick={() => {
                      setActiveTab("hotels");
                      hotelForm.reset();
                      setShowAddHotelDialog(true);
                    }}>
                      <Plus className="mr-2 h-4 w-4" /> Add First Hotel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : allocations.length > 0 ? (
              <Card>
                <CardContent className="py-4">
                  <DataTable 
                    columns={allocationColumns} 
                    data={allocations} 
                    defaultSortingColumn="guestName"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Bed className="h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium mb-2">No Room Allocations</h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                      You haven't assigned any rooms to guests yet. Assign rooms to help manage accommodations.
                    </p>
                    <Button onClick={() => {
                      allocationForm.reset();
                      setShowAddAllocationDialog(true);
                    }}>
                      <Plus className="mr-2 h-4 w-4" /> Assign First Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Occupancy Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Hotel Occupancy</CardTitle>
                  <CardDescription>Room allocation status across all hotels</CardDescription>
                </CardHeader>
                <CardContent>
                  {hotels.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={hotels.map(hotel => {
                            const allocated = allocations.filter(a => a.hotelId === hotel.id).length;
                            const available = hotel.totalRooms - allocated;
                            return {
                              name: hotel.name,
                              allocated,
                              available
                            };
                          })}
                          margin={{ top: 10, right: 30, left: 0, bottom: 70 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="allocated" stackId="a" fill="#8884d8" name="Allocated" />
                          <Bar dataKey="available" stackId="a" fill="#82ca9d" name="Available" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-80 text-center">
                      <Building2 className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-muted-foreground">
                        No hotels added yet. Add hotels to see occupancy statistics.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Room Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Distribution</CardTitle>
                  <CardDescription>Distribution of room allocations by hotel</CardDescription>
                </CardHeader>
                <CardContent>
                  {allocations.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={hotelStats.filter(stat => stat.count > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {hotelStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-80 text-center">
                      <Bed className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-muted-foreground">
                        No room allocations yet. Assign rooms to see distribution statistics.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Summary Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Accommodation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Total Hotels</span>
                      <span className="text-3xl font-bold">{hotels.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Total Room Capacity</span>
                      <span className="text-3xl font-bold">
                        {hotels.reduce((sum, hotel) => sum + (hotel.totalRooms || 0), 0)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Rooms Allocated</span>
                      <span className="text-3xl font-bold">{allocations.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Hotel Dialog */}
      <Dialog open={showAddHotelDialog} onOpenChange={setShowAddHotelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Hotel</DialogTitle>
            <DialogDescription>
              Add a new hotel for guest accommodations.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...hotelForm}>
            <form onSubmit={hotelForm.handleSubmit(onSubmitAddHotel)} className="space-y-4">
              <FormField
                control={hotelForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Taj Palace Hotel" />
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
                      <Textarea {...field} placeholder="Full hotel address" rows={2} />
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+91 98765 43210" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={hotelForm.control}
                  name="totalRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Rooms</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={hotelForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://hotel-website.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={hotelForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Brief description of the hotel" rows={2} />
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
                      <Textarea {...field} placeholder="Instructions for guests to book rooms" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={hotelForm.control}
                  name="hasShuttle"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Has Shuttle Service</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={hotelForm.control}
                  name="specialRates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Special Rates Available</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              {hotelForm.watch("specialRates") && (
                <FormField
                  control={hotelForm.control}
                  name="specialRatesDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Rates Details</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Details about special rates" rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={hotelForm.control}
                name="specialNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any additional notes about the hotel" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddHotelDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Hotel"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Hotel Dialog */}
      <Dialog open={showEditHotelDialog} onOpenChange={setShowEditHotelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Hotel</DialogTitle>
            <DialogDescription>
              Update hotel information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...hotelForm}>
            <form onSubmit={hotelForm.handleSubmit(onSubmitEditHotel)} className="space-y-4">
              {/* Same form fields as Add Hotel dialog */}
              <FormField
                control={hotelForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Taj Palace Hotel" />
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
                      <Textarea {...field} placeholder="Full hotel address" rows={2} />
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+91 98765 43210" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={hotelForm.control}
                  name="totalRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Rooms</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={hotelForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://hotel-website.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={hotelForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Brief description of the hotel" rows={2} />
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
                      <Textarea {...field} placeholder="Instructions for guests to book rooms" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={hotelForm.control}
                  name="hasShuttle"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Has Shuttle Service</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={hotelForm.control}
                  name="specialRates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Special Rates Available</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              {hotelForm.watch("specialRates") && (
                <FormField
                  control={hotelForm.control}
                  name="specialRatesDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Rates Details</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Details about special rates" rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={hotelForm.control}
                name="specialNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any additional notes about the hotel" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditHotelDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Hotel"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Room Allocation Dialog */}
      <Dialog open={showAddAllocationDialog} onOpenChange={setShowAddAllocationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Room</DialogTitle>
            <DialogDescription>
              Assign a hotel room to a guest.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...allocationForm}>
            <form onSubmit={allocationForm.handleSubmit(onSubmitAddAllocation)} className="space-y-4">
              <FormField
                control={allocationForm.control}
                name="guestId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a guest" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guests.map(guest => (
                          <SelectItem key={guest.id} value={guest.id.toString()}>
                            {guest.firstName} {guest.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={allocationForm.control}
                name="hotelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a hotel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hotels.map(hotel => (
                          <SelectItem key={hotel.id} value={hotel.id.toString()}>
                            {hotel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={allocationForm.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="101" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={allocationForm.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Deluxe">Deluxe</SelectItem>
                          <SelectItem value="Suite">Suite</SelectItem>
                          <SelectItem value="Presidential">Presidential</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={allocationForm.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={allocationForm.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={allocationForm.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any special requirements or requests" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddAllocationDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Assigning..." : "Assign Room"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Room Allocation Dialog */}
      <Dialog open={showEditAllocationDialog} onOpenChange={setShowEditAllocationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Room Assignment</DialogTitle>
            <DialogDescription>
              Update guest room assignment details.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...allocationForm}>
            <form onSubmit={allocationForm.handleSubmit(onSubmitEditAllocation)} className="space-y-4">
              {/* Same form fields as Add Allocation dialog */}
              <FormField
                control={allocationForm.control}
                name="guestId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a guest" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guests.map(guest => (
                          <SelectItem key={guest.id} value={guest.id.toString()}>
                            {guest.firstName} {guest.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={allocationForm.control}
                name="hotelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a hotel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hotels.map(hotel => (
                          <SelectItem key={hotel.id} value={hotel.id.toString()}>
                            {hotel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={allocationForm.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="101" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={allocationForm.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Deluxe">Deluxe</SelectItem>
                          <SelectItem value="Suite">Suite</SelectItem>
                          <SelectItem value="Presidential">Presidential</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={allocationForm.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={allocationForm.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={allocationForm.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any special requirements or requests" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditAllocationDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Assignment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}