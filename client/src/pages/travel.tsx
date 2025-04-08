import React, { useState } from "react";
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
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DataTable from "@/components/ui/data-table";
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
  Filter,
  CheckSquare,
  Download,
  Upload,
  Search
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
  needsTransportation: z.boolean().default(false),
  transportationType: z.string().optional(),
});

export default function Travel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("guests");
  const [transportFilter, setTransportFilter] = useState<string | null>(null);
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  
  // Fetch the first event
  const { data: events } = useQuery({
    queryKey: ['/api/events'],
  });
  
  const eventId = events?.[0]?.id || 1;
  
  // Fetch guests
  const { data: guests = [] } = useQuery({
    queryKey: [`/api/events/${eventId}/guests`],
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
      needsTransportation: false,
      transportationType: "",
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
        `/api/guests/${data.guestId}/travel`, 
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
    
    // Fetch travel info if it exists
    fetch(`/api/guests/${guest.id}/travel`, {
      credentials: "include",
    })
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(travelInfo => {
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
            needsTransportation: travelInfo.needsTransportation || false,
            transportationType: travelInfo.transportationType || "",
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
            needsTransportation: false,
            transportationType: "",
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
      });
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
                <div>{formatDate(row.travel.arrivalDate)}</div>
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
                <div>{formatDate(row.travel.departureDate)}</div>
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
  
  return (
    <DashboardLayout>
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
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="guests">
            <Users className="mr-2 h-4 w-4" /> Guest Travel
          </TabsTrigger>
          <TabsTrigger value="arrivals">
            <Upload className="mr-2 h-4 w-4" /> Arrivals
          </TabsTrigger>
          <TabsTrigger value="departures">
            <Download className="mr-2 h-4 w-4" /> Departures
          </TabsTrigger>
        </TabsList>
        
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
                        <h3 className="text-lg font-medium">{formatDate(date)}</h3>
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
                        <h3 className="text-lg font-medium">{formatDate(date)}</h3>
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
