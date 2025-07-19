import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Download, Upload, Users, TrendingUp, Plane, MapPin, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { get, post, put } from '@/lib/api-utils';
import { format } from 'date-fns';
import FlightDataTable from './FlightDataTable';

interface FlightInfo {
  id: number;
  guestId: number;
  guestName: string;
  flightNumber: string;
  airline: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalLocation: string;
  departureDate?: string;
  departureTime?: string;
  departureLocation?: string;
  terminal?: string;
  gate?: string;
  status: 'scheduled' | 'confirmed' | 'delayed' | 'cancelled';
  needsTransportation: boolean;
  specialRequirements?: string;
  contactNumber?: string;
  bufferTime?: number; // minutes
}

interface FlightCoordinationDashboardProps {
  eventId: number;
}

export default function FlightCoordinationDashboard({ eventId }: FlightCoordinationDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('management');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');

  // Fetch all guests for flight input
  const { data: guests = [] } = useQuery({
    queryKey: [`/api/events/${eventId}/guests`],
    queryFn: async () => {
      const response = await get(`/api/events/${eventId}/guests`);
      return response.data;
    },
    enabled: !!eventId
  });

  // Fetch flight information for all guests
  const { data: flightData = [], isLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/flights`],
    queryFn: async () => {
      const response = await get(`/api/events/${eventId}/flights`);
      return response.data;
    },
    enabled: !!eventId
  });

  // Fetch event configuration for buffer times
  const { data: eventConfig } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    queryFn: async () => {
      const response = await get(`/api/events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId
  });

  // Export guest list for travel agent
  const exportForTravelAgent = useMutation({
    mutationFn: async () => {
      const response = await post(`/api/events/${eventId}/travel/export-for-agent`, {});
      return response.data;
    },
    onSuccess: (data) => {
      // Download CSV file
      const blob = new Blob([data.csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-guest-travel-list-${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Guest List Exported",
        description: "Travel agent CSV file has been downloaded successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export guest list for travel agent.",
      });
    }
  });

  // Import flight details from travel agent
  const importFlightDetails = useMutation({
    mutationFn: async (csvData: string) => {
      const response = await post(`/api/events/${eventId}/travel/import-flights`, {
        csvData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/flights`] });
      setIsImportDialogOpen(false);
      setImportData('');
      toast({
        title: "Flight Details Imported",
        description: "Flight information has been successfully imported and guests will be notified.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Failed to import flight details. Please check the CSV format.",
      });
    }
  });

  // Update flight status
  const updateFlightStatus = useMutation({
    mutationFn: async ({ flightId, status }: { flightId: number; status: string }) => {
      const response = await put(`/api/flights/${flightId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/flights`] });
      toast({
        title: "Flight Status Updated",
        description: "Flight status has been updated successfully.",
      });
    }
  });



  // Statistics
  const totalFlights = flightData.length;
  const needingTransport = flightData.filter((f: FlightInfo) => f.needsTransportation).length;
  const confirmed = flightData.filter((f: FlightInfo) => f.status === 'confirmed').length;
  const pending = flightData.filter((f: FlightInfo) => f.status === 'scheduled').length;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'scheduled': return 'secondary';
      case 'delayed': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlights}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Transport</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{needingTransport}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="management">Guest Flight Management</TabsTrigger>
            <TabsTrigger value="coordination">Coordination Workflow</TabsTrigger>
            <TabsTrigger value="transport">Transport Assignment</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => exportForTravelAgent.mutate()}
              disabled={exportForTravelAgent.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Export for Travel Agent
            </Button>
            
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Flight Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import Flight Details</DialogTitle>
                  <DialogDescription>
                    Paste the CSV data received from your travel agent with flight details.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="csvData">CSV Data</Label>
                    <Textarea
                      id="csvData"
                      placeholder="Paste CSV content here..."
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      rows={10}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => importFlightDetails.mutate(importData)}
                      disabled={!importData.trim() || importFlightDetails.isPending}
                    >
                      Import Flights
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="management" className="space-y-4">
          <FlightDataTable 
            eventId={eventId}
            guests={guests}
            flightData={flightData}
          />
        </TabsContent>

        <TabsContent value="coordination" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flight Information</CardTitle>
              <CardDescription>
                Overview of all guest flight details and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Use the Guest Flight Management Tab</h3>
                <p className="text-muted-foreground">
                  Click the "Guest Flight Management" tab above to view and edit flight information using our industry-standard inline editing interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coordination" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flight Coordination Workflow</CardTitle>
              <CardDescription>
                Manage the complete flight coordination process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                    <h3 className="font-medium">Collect Guest List</h3>
                    <p className="text-sm text-muted-foreground">Export guest information</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                    <h3 className="font-medium">Send to Travel Agent</h3>
                    <p className="text-sm text-muted-foreground">Share CSV with agent</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                    <h3 className="font-medium">Import Flight Details</h3>
                    <p className="text-sm text-muted-foreground">Upload flight information</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">4</div>
                    <h3 className="font-medium">Notify Guests</h3>
                    <p className="text-sm text-muted-foreground">Send confirmations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transport Assignment</CardTitle>
              <CardDescription>
                Automatic transport assignment based on flight arrivals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flightData
                  .filter((flight: FlightInfo) => flight.needsTransportation)
                  .map((flight: FlightInfo) => (
                    <div key={flight.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{flight.guestName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Arriving {format(new Date(flight.arrivalDate), 'MMM dd')} at {flight.arrivalTime}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            From {flight.arrivalLocation}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          Transport Needed
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}