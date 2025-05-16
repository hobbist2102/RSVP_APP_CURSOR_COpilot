import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { formatDateForDisplay } from "@/lib/date-utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DataTable from "@/components/ui/data-table";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import {
  Plane,
  Car,
  Train,
  Bus,
  Users,
  Map,
  Calendar,
  Clock,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Filter,
  CheckSquare,
  Download,
  Upload,
  Search,
  FileText,
  Plus,
  Trash2,
  PenLine,
  UserPlus,
  RefreshCw,
  CircleAlert,
  Award,
  CalendarDays,
  UserCheck,
  Building,
  Send
} from "lucide-react";

// Define travel form schema
const travelFormSchema = z.object({
  guestId: z.number(),
  travelMode: z.string(),
  arrivalDate: z.string().optional(),
  arrivalTime: z.string().optional(),
  arrivalLocation: z.string().optional(),
  departureDate: z.string().optional(),
  departureTime: z.string().optional(),
  departureLocation: z.string().optional(),
  flightNumber: z.string().optional(),
  trainNumber: z.string().optional(),
  busNumber: z.string().optional(),
  needsTransportation: z.boolean().default(false),
  transportationType: z.string().optional(),
  specialInstructions: z.string().optional(),
  numberOfBags: z.coerce.number().optional(),
  travelWith: z.array(z.number()).optional(),
  confirmedStatus: z.boolean().default(false)
});

// Define transportation group schema
const transportGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  notes: z.string().optional(),
  guests: z.array(z.number())
});

export default function Travel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentEvent } = useCurrentEvent();
  const [activeTab, setActiveTab] = useState("guests");
  const [transportFilter, setTransportFilter] = useState<string | null>(null);
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [showTransportGroupForm, setShowTransportGroupForm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const eventId = currentEvent?.id;
  
  // Fetch guests
  const { data: guests = [] } = useQuery({
    queryKey: [`/api/events/${eventId}/guests`],
    enabled: !!eventId,
  });
  
  // Fetch transportation groups
  const { data: transportGroups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: [`/api/events/${eventId}/transport-groups`],
    enabled: !!eventId,
  });
  
  // Travel form
  const travelForm = useForm<z.infer<typeof travelFormSchema>>({
    resolver: zodResolver(travelFormSchema),
    defaultValues: {
      guestId: 0,
      travelMode: "air",
      arrivalDate: "",
      arrivalTime: "",
      arrivalLocation: "",
      departureDate: "",
      departureTime: "",
      departureLocation: "",
      flightNumber: "",
      trainNumber: "",
      busNumber: "",
      needsTransportation: false,
      transportationType: "",
      specialInstructions: "",
      numberOfBags: 1,
      travelWith: [],
      confirmedStatus: false
    },
  });
  
  // Transport group form
  const transportGroupForm = useForm<z.infer<typeof transportGroupSchema>>({
    resolver: zodResolver(transportGroupSchema),
    defaultValues: {
      name: "",
      date: "",
      time: "",
      pickupLocation: "",
      dropoffLocation: "",
      vehicleType: "van",
      capacity: 8,
      notes: "",
      guests: []
    },
  });
  
  // Watch form values for conditional rendering
  const watchTravelMode = travelForm.watch("travelMode");
  const watchNeedsTransportation = travelForm.watch("needsTransportation");
  
  // Create/update travel info mutation
  const saveTravelInfoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof travelFormSchema>) => {
      const response = await apiRequest(
        "POST", 
        `/api/events/${eventId}/guests/${data.guestId}/travel`, 
        data
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/guests`] });
      setShowTravelForm(false);
      setSelectedGuest(null);
      toast({
        title: "Travel Information Saved",
        description: "The travel details have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to Save Travel Information",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Handle travel form submission
  const onSubmitTravelForm = (data: z.infer<typeof travelFormSchema>) => {
    saveTravelInfoMutation.mutate(data);
  };
  
  // Create/update transportation group mutation
  const saveTransportGroupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof transportGroupSchema>) => {
      const url = selectedGroupId 
        ? `/api/events/${eventId}/transport-groups/${selectedGroupId}`
        : `/api/events/${eventId}/transport-groups`;
      
      const method = selectedGroupId ? "PUT" : "POST";
      
      const response = await apiRequest(method, url, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/transport-groups`] });
      setShowTransportGroupForm(false);
      setSelectedGroupId(null);
      setIsEditingGroup(false);
      toast({
        title: isEditingGroup ? "Group Updated" : "Group Created",
        description: `The transportation group has been ${isEditingGroup ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: isEditingGroup ? "Failed to Update Group" : "Failed to Create Group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Handle transport group form submission
  const onSubmitTransportGroupForm = (data: z.infer<typeof transportGroupSchema>) => {
    saveTransportGroupMutation.mutate({
      ...data,
      guests: data.guests.filter(g => g !== 0) // Filter out any placeholder values
    });
  };
  
  // Delete transportation group mutation
  const deleteTransportGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await apiRequest(
        "DELETE",
        `/api/events/${eventId}/transport-groups/${groupId}`
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/transport-groups`] });
      toast({
        title: "Group Deleted",
        description: "The transportation group has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to Delete Group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Handle group deletion
  const handleDeleteTransportGroup = (groupId: number) => {
    if (window.confirm("Are you sure you want to delete this transportation group?")) {
      deleteTransportGroupMutation.mutate(groupId);
    }
  };
  
  // Prepare guest data with travel info
  const guestsWithTravelInfo = guests.map((guest: any) => {
    // Fetch travel info for this guest
    const { data: travelInfo } = useQuery({
      queryKey: [`/api/guests/${guest.id}/travel`],
      enabled: !!guest.id,
      staleTime: Infinity, // Cache the result to avoid unnecessary requests
    });
    
    return {
      ...guest,
      travel: travelInfo,
    };
  });
  
  // Filter guests based on transportation need
  const filteredGuests = transportFilter
    ? guestsWithTravelInfo.filter((guest: any) => {
        if (transportFilter === "needs-transport") {
          return guest.travel?.needsTransportation;
        }
        if (transportFilter === "has-travel-info") {
          return guest.travel;
        }
        if (transportFilter === "no-travel-info") {
          return !guest.travel;
        }
        if (transportFilter === "air") {
          return guest.travel?.travelMode === "air";
        }
        if (transportFilter === "car") {
          return guest.travel?.travelMode === "car";
        }
        if (transportFilter === "train") {
          return guest.travel?.travelMode === "train";
        }
        return true;
      })
    : guestsWithTravelInfo;
  
  // Open travel form dialog for a guest
  const handleEditTravel = (guest: any) => {
    setSelectedGuest(guest);
    setIsLoading(true);
    
    // Fetch travel info if it exists
    apiRequest("GET", `/api/events/${eventId}/guests/${guest.id}/travel`)
      .then(async (response) => {
        const travelInfo = response.ok ? await response.json() : null;
        
        if (travelInfo) {
          // Set form values from existing travel info
          travelForm.reset({
            guestId: guest.id,
            travelMode: travelInfo.travelMode || "air",
            arrivalDate: travelInfo.arrivalDate ? new Date(travelInfo.arrivalDate).toISOString().split('T')[0] : "",
            arrivalTime: travelInfo.arrivalTime || "",
            arrivalLocation: travelInfo.arrivalLocation || "",
            departureDate: travelInfo.departureDate ? new Date(travelInfo.departureDate).toISOString().split('T')[0] : "",
            departureTime: travelInfo.departureTime || "",
            departureLocation: travelInfo.departureLocation || "",
            flightNumber: travelInfo.flightNumber || "",
            trainNumber: travelInfo.trainNumber || "",
            busNumber: travelInfo.busNumber || "",
            needsTransportation: travelInfo.needsTransportation || false,
            transportationType: travelInfo.transportationType || "",
            specialInstructions: travelInfo.specialInstructions || "",
            numberOfBags: travelInfo.numberOfBags || 1,
            travelWith: travelInfo.travelWith || [],
            confirmedStatus: travelInfo.confirmedStatus || false
          });
        } else {
          // Reset form for new travel info
          travelForm.reset({
            guestId: guest.id,
            travelMode: "air",
            arrivalDate: "",
            arrivalTime: "",
            arrivalLocation: "",
            departureDate: "",
            departureTime: "",
            departureLocation: "",
            flightNumber: "",
            trainNumber: "",
            busNumber: "",
            needsTransportation: false,
            transportationType: "",
            specialInstructions: "",
            numberOfBags: 1,
            travelWith: [],
            confirmedStatus: false
          });
        }
        
        setShowTravelForm(true);
      })
      .catch(error => {
        console.error("Error fetching travel info:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch travel information",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  // Handle editing a transport group
  const handleEditTransportGroup = (group: any) => {
    setSelectedGroupId(group.id);
    setIsEditingGroup(true);
    
    transportGroupForm.reset({
      name: group.name,
      date: group.date,
      time: group.time,
      pickupLocation: group.pickupLocation,
      dropoffLocation: group.dropoffLocation,
      vehicleType: group.vehicleType,
      capacity: group.capacity,
      notes: group.notes || "",
      guests: group.guests || []
    });
    
    setShowTransportGroupForm(true);
  };
  
  // Open group creation form
  const handleCreateTransportGroup = () => {
    setSelectedGroupId(null);
    setIsEditingGroup(false);
    transportGroupForm.reset({
      name: "",
      date: "",
      time: "",
      pickupLocation: "",
      dropoffLocation: "",
      vehicleType: "van",
      capacity: 8,
      notes: "",
      guests: []
    });
    setShowTransportGroupForm(true);
  };
  
  // Get icon for travel mode
  const getTravelModeIcon = (mode: string) => {
    switch (mode) {
      case "air":
        return <Plane className="h-4 w-4" />;
      case "car":
        return <Car className="h-4 w-4" />;
      case "train":
        return <Train className="h-4 w-4" />;
      case "bus":
        return <Bus className="h-4 w-4" />;
      default:
        return <Map className="h-4 w-4" />;
    }
  };
  
  // Guest columns for data table
  const guestColumns = [
    {
      header: "Guest",
      accessor: (row: any) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2 bg-primary text-white">
            <AvatarFallback>{getInitials(`${row.firstName} ${row.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Travel Mode",
      accessor: (row: any) => (
        <div className="flex items-center">
          {row.travel ? (
            <>
              {getTravelModeIcon(row.travel.travelMode)}
              <span className="ml-2 capitalize">{row.travel.travelMode || "Not specified"}</span>
            </>
          ) : (
            <span className="text-gray-400">Not specified</span>
          )}
        </div>
      ),
    },
    {
      header: "Arrival",
      accessor: (row: any) => (
        row.travel ? (
          <div>
            {row.travel.arrivalDate ? (
              <div>
                <div>{formatDateForDisplay(row.travel.arrivalDate)}</div>
                <div className="text-sm text-gray-500">
                  {row.travel.arrivalTime || ""} {row.travel.arrivalLocation ? `- ${row.travel.arrivalLocation}` : ""}
                </div>
                {row.travel.travelMode === "air" && row.travel.flightNumber && (
                  <div className="text-xs text-gray-500">Flight: {row.travel.flightNumber}</div>
                )}
              </div>
            ) : (
              <span className="text-gray-400">Not specified</span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">Not specified</span>
        )
      ),
    },
    {
      header: "Departure",
      accessor: (row: any) => (
        row.travel ? (
          <div>
            {row.travel.departureDate ? (
              <div>
                <div>{formatDateForDisplay(row.travel.departureDate)}</div>
                <div className="text-sm text-gray-500">
                  {row.travel.departureTime || ""} {row.travel.departureLocation ? `- ${row.travel.departureLocation}` : ""}
                </div>
              </div>
            ) : (
              <span className="text-gray-400">Not specified</span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">Not specified</span>
        )
      ),
    },
    {
      header: "Transportation",
      accessor: (row: any) => (
        row.travel ? (
          <div>
            {row.travel.needsTransportation ? (
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                {row.travel.transportationType 
                  ? `Needs ${row.travel.transportationType}` 
                  : "Needs transportation"}
              </Badge>
            ) : (
              <span className="text-gray-400">Not needed</span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">Not specified</span>
        )
      ),
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditTravel(row)}
        >
          {row.travel ? "Edit Travel" : "Add Travel"}
        </Button>
      ),
    },
  ];
  
  // Transportation needs summary
  const transportationSummary = {
    total: guestsWithTravelInfo.filter((g: any) => g.travel?.needsTransportation).length,
    pickup: guestsWithTravelInfo.filter((g: any) => 
      g.travel?.needsTransportation && 
      (g.travel?.transportationType === "pickup" || g.travel?.transportationType === "both")
    ).length,
    dropoff: guestsWithTravelInfo.filter((g: any) => 
      g.travel?.needsTransportation && 
      (g.travel?.transportationType === "drop" || g.travel?.transportationType === "both")
    ).length,
    both: guestsWithTravelInfo.filter((g: any) => 
      g.travel?.needsTransportation && g.travel?.transportationType === "both"
    ).length,
  };
  
  // Group arrivals by date
  const arrivalsByDate = guestsWithTravelInfo
    .filter((g: any) => g.travel?.arrivalDate)
    .reduce((acc: any, guest: any) => {
      const date = new Date(guest.travel.arrivalDate).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        guest,
        time: guest.travel.arrivalTime,
        location: guest.travel.arrivalLocation,
        needsPickup: guest.travel.needsTransportation && 
          (guest.travel.transportationType === "pickup" || guest.travel.transportationType === "both"),
      });
      return acc;
    }, {});
  
  // Group departures by date
  const departuresByDate = guestsWithTravelInfo
    .filter((g: any) => g.travel?.departureDate)
    .reduce((acc: any, guest: any) => {
      const date = new Date(guest.travel.departureDate).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        guest,
        time: guest.travel.departureTime,
        location: guest.travel.departureLocation,
        needsDropoff: guest.travel.needsTransportation && 
          (guest.travel.transportationType === "drop" || guest.travel.transportationType === "both"),
      });
      return acc;
    }, {});
    
  // Sort the dates
  const sortedArrivalDates = Object.keys(arrivalsByDate).sort();
  const sortedDepartureDates = Object.keys(departuresByDate).sort();
  
  // Generate a simple transportation schedule
  const generateTransportationSchedule = () => {
    // This is a placeholder for what would be a more complex function
    // to generate optimized transportation schedules
    toast({
      title: "Schedule Generated",
      description: "Transportation schedule has been generated and can be exported.",
    });
  };
  
  // Transportation Group Form Dialog
  const renderTransportGroupForm = () => (
    <Dialog open={showTransportGroupForm} onOpenChange={setShowTransportGroupForm}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditingGroup ? "Edit Transportation Group" : "Create Transportation Group"}
          </DialogTitle>
          <DialogDescription>
            {isEditingGroup ? "Update the transportation group details." : "Create a new transportation group for your guests."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...transportGroupForm}>
          <form onSubmit={transportGroupForm.handleSubmit(onSubmitTransportGroupForm)} className="space-y-4">
            <FormField
              control={transportGroupForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Airport Pickup Group 1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={transportGroupForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transportGroupForm.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={transportGroupForm.control}
              name="pickupLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Airport Terminal 3" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={transportGroupForm.control}
              name="dropoffLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dropoff Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Hotel Taj Palace" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={transportGroupForm.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="minibus">Minibus</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transportGroupForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={transportGroupForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Any special instructions or notes" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={transportGroupForm.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Guests</FormLabel>
                  <div className="border rounded-md p-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((guestId) => {
                        const guest = guests.find((g: any) => g.id === guestId);
                        return guest ? (
                          <Badge key={guestId} variant="outline" className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{guest.firstName} {guest.lastName}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 rounded-full text-muted-foreground hover:text-foreground ml-1"
                              onClick={() => {
                                const updatedGuests = field.value.filter((id) => id !== guestId);
                                field.onChange(updatedGuests);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ) : null;
                      })}
                      {field.value.length === 0 && (
                        <p className="text-sm text-muted-foreground">No guests assigned</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Select
                        onValueChange={(value) => {
                          const guestId = parseInt(value);
                          if (!field.value.includes(guestId) && guestId) {
                            field.onChange([...field.value, guestId]);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Add guest" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {guests
                              .filter((g: any) => !field.value.includes(g.id) && g.travel?.needsTransportation)
                              .map((guest: any) => (
                                <SelectItem key={guest.id} value={guest.id.toString()}>
                                  {guest.firstName} {guest.lastName}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTransportGroupForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveTransportGroupMutation.isPending}>
                {saveTransportGroupMutation.isPending
                  ? isEditingGroup ? "Updating..." : "Creating..."
                  : isEditingGroup ? "Update Group" : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
  
  // Travel Form Dialog
  const renderTravelForm = () => (
    <Dialog open={showTravelForm} onOpenChange={setShowTravelForm}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedGuest ? `${selectedGuest.firstName} ${selectedGuest.lastName}'s Travel Information` : "Travel Information"}
          </DialogTitle>
          <DialogDescription>
            Add or update guest travel and transportation details
          </DialogDescription>
        </DialogHeader>
        
        <Form {...travelForm}>
          <form onSubmit={travelForm.handleSubmit(onSubmitTravelForm)} className="space-y-4">
            <FormField
              control={travelForm.control}
              name="travelMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Travel Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select travel mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="air">
                        <div className="flex items-center">
                          <Plane className="mr-2 h-4 w-4" /> Air
                        </div>
                      </SelectItem>
                      <SelectItem value="car">
                        <div className="flex items-center">
                          <Car className="mr-2 h-4 w-4" /> Car
                        </div>
                      </SelectItem>
                      <SelectItem value="train">
                        <div className="flex items-center">
                          <Train className="mr-2 h-4 w-4" /> Train
                        </div>
                      </SelectItem>
                      <SelectItem value="bus">
                        <div className="flex items-center">
                          <Bus className="mr-2 h-4 w-4" /> Bus
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-2" />
            <h3 className="font-medium text-sm flex items-center">
              <Upload className="mr-2 h-4 w-4 text-primary" /> Arrival Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={travelForm.control}
                name="arrivalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={travelForm.control}
                name="arrivalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={travelForm.control}
              name="arrivalLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arrival Location</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={
                        watchTravelMode === "air"
                          ? "Airport Name / Terminal"
                          : watchTravelMode === "train"
                          ? "Train Station"
                          : watchTravelMode === "bus"
                          ? "Bus Station"
                          : "Arrival Location"
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {watchTravelMode === "air" && (
              <FormField
                control={travelForm.control}
                name="flightNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="AI123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {watchTravelMode === "train" && (
              <FormField
                control={travelForm.control}
                name="trainNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Train Number/Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12345 / Rajdhani Express" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {watchTravelMode === "bus" && (
              <FormField
                control={travelForm.control}
                name="busNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bus Number/Service</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Bus details" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Separator className="my-2" />
            <h3 className="font-medium text-sm flex items-center">
              <Download className="mr-2 h-4 w-4 text-primary" /> Departure Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={travelForm.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={travelForm.control}
                name="departureTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={travelForm.control}
              name="departureLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure Location</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={
                        watchTravelMode === "air"
                          ? "Airport Name / Terminal"
                          : watchTravelMode === "train"
                          ? "Train Station"
                          : watchTravelMode === "bus"
                          ? "Bus Station"
                          : "Departure Location"
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-2" />
            <h3 className="font-medium text-sm flex items-center">
              <Car className="mr-2 h-4 w-4 text-primary" /> Transportation Needs
            </h3>
            
            <FormField
              control={travelForm.control}
              name="needsTransportation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded-md border">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Needs Transportation</FormLabel>
                    <FormDescription>
                      Guest needs transportation assistance during the event
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {watchNeedsTransportation && (
              <>
                <FormField
                  control={travelForm.control}
                  name="transportationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transportation Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pickup">Airport/Station Pickup Only</SelectItem>
                          <SelectItem value="drop">Airport/Station Dropoff Only</SelectItem>
                          <SelectItem value="both">Both Pickup and Dropoff</SelectItem>
                          <SelectItem value="local">Local Transportation During Stay</SelectItem>
                          <SelectItem value="complete">Complete Transportation Package</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={travelForm.control}
                  name="numberOfBags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Bags</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={travelForm.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Any special requirements or instructions"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={travelForm.control}
                  name="confirmedStatus"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded-md border">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Confirmed</FormLabel>
                        <FormDescription>
                          Transportation arrangements have been confirmed
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTravelForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveTravelInfoMutation.isPending}>
                {saveTravelInfoMutation.isPending ? "Saving..." : "Save Travel Info"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
  
  return (
    <DashboardLayout>
      {renderTransportGroupForm()}
      {renderTravelForm()}
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-playfair font-bold text-neutral">Travel Management</h2>
          <p className="text-sm text-gray-500">
            Manage guest travel arrangements and transportation needs
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="border-primary text-primary"
            onClick={handleCreateTransportGroup}
          >
            <Plus className="mr-2 h-4 w-4" /> New Transport Group
          </Button>
          <Button
            variant="outline"
            className="border-primary text-primary"
            onClick={generateTransportationSchedule}
          >
            <Download className="mr-2 h-4 w-4" /> Export Schedule
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold">{transportationSummary.total}</div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-muted-foreground">Need Transportation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold">{transportationSummary.pickup}</div>
              <Upload className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-muted-foreground">Need Airport Pickup</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold">{transportationSummary.dropoff}</div>
              <Download className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-muted-foreground">Need Airport Dropoff</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold">{guestsWithTravelInfo.filter((g: any) => g.travel).length}</div>
              <CheckSquare className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-muted-foreground">Travel Info Provided</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="guests">
            <Users className="mr-2 h-4 w-4" /> Guest Travel
          </TabsTrigger>
          <TabsTrigger value="arrivals">
            <Upload className="mr-2 h-4 w-4" /> Arrivals
          </TabsTrigger>
          <TabsTrigger value="departures">
            <Download className="mr-2 h-4 w-4" /> Departures
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="mr-2 h-4 w-4" /> Transport Groups
          </TabsTrigger>
        </TabsList>
        
        {/* Transport Groups Tab */}
        <TabsContent value="groups">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Transportation Groups</CardTitle>
                <Button onClick={handleCreateTransportGroup}>
                  <Plus className="mr-2 h-4 w-4" /> Create Group
                </Button>
              </div>
              <CardDescription>
                Organize transportation for guests in groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGroups ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : transportGroups && transportGroups.length > 0 ? (
                <div className="space-y-6">
                  {transportGroups.map((group: any) => (
                    <Card key={group.id} className="overflow-hidden">
                      <CardHeader className="pb-3 bg-muted/30">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                              {group.vehicleType === "car" ? (
                                <Car className="h-4 w-4" />
                              ) : group.vehicleType === "bus" ? (
                                <Bus className="h-4 w-4" />
                              ) : (
                                <Users className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{group.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {formatDateForDisplay(group.date)} • {group.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTransportGroup(group)}
                            >
                              <PenLine className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteTransportGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center">
                              <Upload className="h-3 w-3 mr-1 text-primary" /> Pickup
                            </h4>
                            <p className="text-sm">{group.pickupLocation}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center">
                              <Download className="h-3 w-3 mr-1 text-primary" /> Dropoff
                            </h4>
                            <p className="text-sm">{group.dropoffLocation}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <h4 className="text-xs text-muted-foreground">Vehicle</h4>
                            <p className="text-sm font-medium capitalize">{group.vehicleType}</p>
                          </div>
                          <div>
                            <h4 className="text-xs text-muted-foreground">Capacity</h4>
                            <p className="text-sm font-medium">{group.capacity} people</p>
                          </div>
                          <div>
                            <h4 className="text-xs text-muted-foreground">Assigned</h4>
                            <p className="text-sm font-medium">{group.guests?.length || 0} guests</p>
                          </div>
                          <div>
                            <h4 className="text-xs text-muted-foreground">Available</h4>
                            <p className="text-sm font-medium">
                              {Math.max(0, group.capacity - (group.guests?.length || 0))} seats
                            </p>
                          </div>
                        </div>
                        {group.notes && (
                          <div className="mt-2">
                            <h4 className="text-xs text-muted-foreground mb-1">Notes</h4>
                            <p className="text-sm">{group.notes}</p>
                          </div>
                        )}
                        <Separator className="my-4" />
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Users className="h-3 w-3 mr-1 text-primary" /> Assigned Guests
                          </h4>
                          {group.guests?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {group.guests.map((guestId: number) => {
                                const guest = guests.find((g: any) => g.id === guestId);
                                return guest ? (
                                  <Badge key={guestId} variant="outline" className="flex items-center space-x-1">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    <span>{guest.firstName} {guest.lastName}</span>
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No guests assigned</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Transportation Groups</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    You haven't created any transportation groups yet. Create groups to organize transportation for your guests.
                  </p>
                  <Button onClick={handleCreateTransportGroup}>
                    <Plus className="mr-2 h-4 w-4" /> Create First Group
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Groups Dashboard */}
          {transportGroups && transportGroups.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Types Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          Object.entries(
                            transportGroups.reduce((acc: any, group: any) => {
                              const type = group.vehicleType || "other";
                              acc[type] = (acc[type] || 0) + 1;
                              return acc;
                            }, {})
                          ).map(([name, value]) => ({ name, value }))
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(
                          transportGroups.reduce((acc: any, group: any) => {
                            const type = group.vehicleType || "other";
                            acc[type] = (acc[type] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([name, value], index) => (
                          <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Group Capacity Usage</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={transportGroups.map((group: any) => ({
                        name: group.name,
                        capacity: group.capacity,
                        assigned: group.guests?.length || 0,
                        available: Math.max(0, group.capacity - (group.guests?.length || 0))
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="assigned" stackId="a" fill="#8884d8" name="Assigned" />
                      <Bar dataKey="available" stackId="a" fill="#82ca9d" name="Available" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="guests">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Guest Travel Information</CardTitle>
                <div>
                  <Select 
                    value={transportFilter || "all"} 
                    onValueChange={(value) => setTransportFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Guests</SelectItem>
                      <SelectItem value="needs-transport">Needs Transportation</SelectItem>
                      <SelectItem value="has-travel-info">Has Travel Info</SelectItem>
                      <SelectItem value="no-travel-info">No Travel Info</SelectItem>
                      <SelectItem value="air">Air Travel</SelectItem>
                      <SelectItem value="car">Car Travel</SelectItem>
                      <SelectItem value="train">Train Travel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                View and manage guest travel arrangements
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <DataTable
                data={filteredGuests}
                columns={guestColumns}
                keyField="id"
                searchable={true}
                searchPlaceholder="Search guests..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="arrivals">
          <Card>
            <CardHeader>
              <CardTitle>Arrival Schedule</CardTitle>
              <CardDescription>
                Arrivals grouped by date, sorted by time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedArrivalDates.length > 0 ? (
                <div className="space-y-8">
                  {sortedArrivalDates.map(date => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-lg font-medium">{formatDateForDisplay(date)}</h3>
                      </div>
                      
                      <div className="border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Mode</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transportation</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {arrivalsByDate[date]
                              .sort((a: any, b: any) => 
                                (a.time || "").localeCompare(b.time || "")
                              )
                              .map((arrival: any, index: number) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <Avatar className="h-8 w-8 mr-2 bg-primary text-white">
                                        <AvatarFallback>
                                          {getInitials(`${arrival.guest.firstName} ${arrival.guest.lastName}`)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{`${arrival.guest.firstName} ${arrival.guest.lastName}`}</div>
                                        <div className="text-sm text-gray-500">{arrival.guest.phone}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {arrival.time || "Not specified"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {arrival.location || "Not specified"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {getTravelModeIcon(arrival.guest.travel.travelMode)}
                                      <span className="ml-2 capitalize">{arrival.guest.travel.travelMode}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {arrival.needsPickup ? (
                                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                        Needs Pickup
                                      </Badge>
                                    ) : (
                                      <span className="text-gray-400">Not needed</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No Arrivals Scheduled</h3>
                  <p className="text-muted-foreground">
                    When guests provide arrival information, it will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departures">
          <Card>
            <CardHeader>
              <CardTitle>Departure Schedule</CardTitle>
              <CardDescription>
                Departures grouped by date, sorted by time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedDepartureDates.length > 0 ? (
                <div className="space-y-8">
                  {sortedDepartureDates.map(date => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-lg font-medium">{formatDateForDisplay(date)}</h3>
                      </div>
                      
                      <div className="border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Mode</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transportation</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {departuresByDate[date]
                              .sort((a: any, b: any) => 
                                (a.time || "").localeCompare(b.time || "")
                              )
                              .map((departure: any, index: number) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <Avatar className="h-8 w-8 mr-2 bg-primary text-white">
                                        <AvatarFallback>
                                          {getInitials(`${departure.guest.firstName} ${departure.guest.lastName}`)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{`${departure.guest.firstName} ${departure.guest.lastName}`}</div>
                                        <div className="text-sm text-gray-500">{departure.guest.phone}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {departure.time || "Not specified"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {departure.location || "Not specified"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {getTravelModeIcon(departure.guest.travel.travelMode)}
                                      <span className="ml-2 capitalize">{departure.guest.travel.travelMode}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {departure.needsDropoff ? (
                                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                        Needs Dropoff
                                      </Badge>
                                    ) : (
                                      <span className="text-gray-400">Not needed</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No Departures Scheduled</h3>
                  <p className="text-muted-foreground">
                    When guests provide departure information, it will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Travel Form Dialog */}
      <Dialog open={showTravelForm} onOpenChange={setShowTravelForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Travel Information</DialogTitle>
            <DialogDescription>
              {selectedGuest && `Add or edit travel details for ${selectedGuest.firstName} ${selectedGuest.lastName}`}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...travelForm}>
            <form onSubmit={travelForm.handleSubmit(onSubmitTravelForm)} className="space-y-4">
              <FormField
                control={travelForm.control}
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
                          <SelectValue placeholder="Select travel mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="air">
                          <div className="flex items-center">
                            <Plane className="h-4 w-4 mr-2" /> Air
                          </div>
                        </SelectItem>
                        <SelectItem value="car">
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-2" /> Car
                          </div>
                        </SelectItem>
                        <SelectItem value="train">
                          <div className="flex items-center">
                            <Train className="h-4 w-4 mr-2" /> Train
                          </div>
                        </SelectItem>
                        <SelectItem value="bus">
                          <div className="flex items-center">
                            <Bus className="h-4 w-4 mr-2" /> Bus
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchTravelMode === "air" && (
                <FormField
                  control={travelForm.control}
                  name="flightNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flight Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., AA123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Arrival Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={travelForm.control}
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
                    control={travelForm.control}
                    name="arrivalTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrival Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 14:30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={travelForm.control}
                  name="arrivalLocation"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Arrival Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., JFK Airport Terminal 4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Departure Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={travelForm.control}
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
                  
                  <FormField
                    control={travelForm.control}
                    name="departureTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departure Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 10:00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={travelForm.control}
                  name="departureLocation"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Departure Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., JFK Airport Terminal 4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Transportation Needs</h3>
                
                <FormField
                  control={travelForm.control}
                  name="needsTransportation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Transportation Required</FormLabel>
                        <FormDescription>
                          Does this guest need transportation to or from the venue?
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
                
                {watchNeedsTransportation && (
                  <FormField
                    control={travelForm.control}
                    name="transportationType"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Transportation Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="pickup" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Pickup (from arrival location to venue)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="drop" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Drop-off (from venue to departure location)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="both" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Both pickup and drop-off
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="gold-gradient"
                  disabled={saveTravelInfoMutation.isPending}
                >
                  {saveTravelInfoMutation.isPending ? "Saving..." : "Save Travel Information"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
