import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WeddingEvent } from "@shared/schema";
import { Check, Bus, Car, Plane, Train, MapPin, Users, AlertCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TransportStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: any) => void;
  isCompleted: boolean;
}

export default function TransportStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted
}: TransportStepProps) {
  const [isEditing, setIsEditing] = useState(!isCompleted);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dialog states
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [repDialogOpen, setRepDialogOpen] = useState(false);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<TransportVendor | null>(null);
  const [editingRep, setEditingRep] = useState<LocationRepresentative | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<EventVehicle | null>(null);

  // Form states
  const [vendorForm, setVendorForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    whatsappNumber: '',
    specialization: [] as string[]
  });

  const [repForm, setRepForm] = useState({
    name: '',
    locationType: '',
    locationName: '',
    terminalGate: '',
    phone: '',
    whatsappNumber: ''
  });

  const [vehicleForm, setVehicleForm] = useState({
    vendorId: '',
    vehicleType: '',
    vehicleName: '',
    capacity: '',
    availableCount: '',
    hourlyRate: '',
    features: [] as string[]
  });

  // Data queries
  const { data: vendors = [] } = useQuery<TransportVendor[]>({
    queryKey: ['/api/transport/vendors', eventId],
    enabled: !!eventId
  });

  const { data: representatives = [] } = useQuery<LocationRepresentative[]>({
    queryKey: ['/api/transport/representatives', eventId],
    enabled: !!eventId
  });

  const { data: vehicles = [] } = useQuery<EventVehicle[]>({
    queryKey: ['/api/transport/vehicles', eventId],
    enabled: !!eventId
  });

  // Mutations
  const createVendorMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/transport/vendors`, 'POST', { ...data, eventId: parseInt(eventId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transport/vendors', eventId] });
      setVendorDialogOpen(false);
      setVendorForm({ name: '', contactPerson: '', phone: '', email: '', whatsappNumber: '', specialization: [] });
      toast({ title: "Transport vendor added successfully" });
    }
  });

  const createRepMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/transport/representatives`, 'POST', { ...data, eventId: parseInt(eventId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transport/representatives', eventId] });
      setRepDialogOpen(false);
      setRepForm({ name: '', locationType: '', locationName: '', terminalGate: '', phone: '', whatsappNumber: '' });
      toast({ title: "Location representative added successfully" });
    }
  });

  const createVehicleMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/transport/vehicles`, 'POST', { ...data, eventId: parseInt(eventId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transport/vehicles', eventId] });
      setVehicleDialogOpen(false);
      setVehicleForm({ vendorId: '', vehicleType: '', vehicleName: '', capacity: '', availableCount: '', hourlyRate: '', features: [] });
      toast({ title: "Vehicle added successfully" });
    }
  });

  // Form handlers
  const handleVendorSubmit = () => {
    if (!vendorForm.name || !vendorForm.phone) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    createVendorMutation.mutate(vendorForm);
  };

  const handleRepSubmit = () => {
    if (!repForm.name || !repForm.locationType || !repForm.phone) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    createRepMutation.mutate(repForm);
  };

  const handleVehicleSubmit = () => {
    if (!vehicleForm.vendorId || !vehicleForm.vehicleType || !vehicleForm.capacity) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    createVehicleMutation.mutate({
      ...vehicleForm,
      capacity: parseInt(vehicleForm.capacity),
      availableCount: parseInt(vehicleForm.availableCount) || 1
    });
  };

  const handleComplete = () => {
    const transportData = {
      vendors: vendors.length,
      representatives: representatives.length,
      vehicles: vehicles.length,
      coordinationEnabled: true
    };
    onComplete(transportData);
    setIsEditing(false);
  };

  // If step is completed and not editing, show summary view
  if (isCompleted && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6">
          {/* Transport Coordination Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  Transport Vendors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{vendors.length}</p>
                <p className="text-sm text-muted-foreground">Registered vendors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Reps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{representatives.length}</p>
                <p className="text-sm text-muted-foreground">Airport/Station representatives</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{vehicles.length}</p>
                <p className="text-sm text-muted-foreground">Total fleet capacity</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Overview */}
          {vendors.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Recent Vendors</h3>
              <div className="grid gap-2">
                {vendors.slice(0, 3).map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">{vendor.phone}</p>
                    </div>
                    <Badge variant="secondary">{vendor.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Button type="button" onClick={() => setIsEditing(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Manage Transport Coordination
        </Button>
      </div>
    );
  }

  // Main editing interface with tabs for three-party coordination
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Transport Coordination Setup</h3>
          <p className="text-muted-foreground text-sm">
            Configure your three-party transport system: Planner → Vendors → Airport/Station Representatives
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Bus className="h-4 w-4" />
              Transport Vendors
            </TabsTrigger>
            <TabsTrigger value="representatives" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Reps
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicle Fleet
            </TabsTrigger>
          </TabsList>

          {/* Transport Vendors Tab */}
          <TabsContent value="vendors" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Transport Vendors</h4>
                <p className="text-sm text-muted-foreground">External transport service providers</p>
              </div>
              <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Transport Vendor</DialogTitle>
                    <DialogDescription>
                      Register a new transport service provider for coordination
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vendor-name">Vendor Name *</Label>
                      <Input
                        id="vendor-name"
                        value={vendorForm.name}
                        onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})}
                        placeholder="e.g., Goa Elite Transport"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-person">Contact Person</Label>
                      <Input
                        id="contact-person"
                        value={vendorForm.contactPerson}
                        onChange={(e) => setVendorForm({...vendorForm, contactPerson: e.target.value})}
                        placeholder="Primary contact name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vendor-phone">Phone *</Label>
                        <Input
                          id="vendor-phone"
                          value={vendorForm.phone}
                          onChange={(e) => setVendorForm({...vendorForm, phone: e.target.value})}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vendor-whatsapp">WhatsApp</Label>
                        <Input
                          id="vendor-whatsapp"
                          value={vendorForm.whatsappNumber}
                          onChange={(e) => setVendorForm({...vendorForm, whatsappNumber: e.target.value})}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="vendor-email">Email</Label>
                      <Input
                        id="vendor-email"
                        type="email"
                        value={vendorForm.email}
                        onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})}
                        placeholder="contact@vendor.com"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setVendorDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleVendorSubmit}
                      disabled={createVendorMutation.isPending}
                    >
                      {createVendorMutation.isPending ? "Adding..." : "Add Vendor"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {vendors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transport vendors added yet</p>
                  <p className="text-sm">Add vendors to enable transport coordination</p>
                </div>
              ) : (
                vendors.map((vendor) => (
                  <Card key={vendor.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{vendor.name}</CardTitle>
                          <CardDescription>{vendor.contactPerson}</CardDescription>
                        </div>
                        <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                          {vendor.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {vendor.phone}
                        </div>
                        {vendor.email && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {vendor.email}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Location Representatives Tab */}
          <TabsContent value="representatives" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Location Representatives</h4>
                <p className="text-sm text-muted-foreground">Airport and station coordinators</p>
              </div>
              <Dialog open={repDialogOpen} onOpenChange={setRepDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Representative
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Location Representative</DialogTitle>
                    <DialogDescription>
                      Register an airport or station representative for pickup coordination
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rep-name">Representative Name *</Label>
                      <Input
                        id="rep-name"
                        value={repForm.name}
                        onChange={(e) => setRepForm({...repForm, name: e.target.value})}
                        placeholder="e.g., Rajesh Kumar"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location-type">Location Type *</Label>
                        <Select value={repForm.locationType} onValueChange={(value) => setRepForm({...repForm, locationType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="airport">Airport</SelectItem>
                            <SelectItem value="train_station">Train Station</SelectItem>
                            <SelectItem value="hotel">Hotel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location-name">Location Name</Label>
                        <Input
                          id="location-name"
                          value={repForm.locationName}
                          onChange={(e) => setRepForm({...repForm, locationName: e.target.value})}
                          placeholder="e.g., GOI Airport"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="terminal-gate">Terminal/Gate</Label>
                      <Input
                        id="terminal-gate"
                        value={repForm.terminalGate}
                        onChange={(e) => setRepForm({...repForm, terminalGate: e.target.value})}
                        placeholder="e.g., Terminal 1, Gate 3"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rep-phone">Phone *</Label>
                        <Input
                          id="rep-phone"
                          value={repForm.phone}
                          onChange={(e) => setRepForm({...repForm, phone: e.target.value})}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rep-whatsapp">WhatsApp</Label>
                        <Input
                          id="rep-whatsapp"
                          value={repForm.whatsappNumber}
                          onChange={(e) => setRepForm({...repForm, whatsappNumber: e.target.value})}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRepDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRepSubmit}
                      disabled={createRepMutation.isPending}
                    >
                      {createRepMutation.isPending ? "Adding..." : "Add Representative"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {representatives.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No location representatives added yet</p>
                  <p className="text-sm">Add reps to enable pickup coordination</p>
                </div>
              ) : (
                representatives.map((rep) => (
                  <Card key={rep.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{rep.name}</CardTitle>
                          <CardDescription className="capitalize">
                            {rep.locationType?.replace('_', ' ')} - {rep.locationName}
                          </CardDescription>
                        </div>
                        <Badge variant={rep.status === 'active' ? 'default' : 'secondary'}>
                          {rep.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {rep.phone}
                        </div>
                        {rep.terminalGate && (
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-muted-foreground" />
                            {rep.terminalGate}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Vehicle Fleet Tab */}
          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Vehicle Fleet</h4>
                <p className="text-sm text-muted-foreground">Available vehicles for transport</p>
              </div>
              <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={vendors.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Vehicle</DialogTitle>
                    <DialogDescription>
                      Add a vehicle to the fleet for this event
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vehicle-vendor">Vendor *</Label>
                      <Select value={vehicleForm.vendorId} onValueChange={(value) => setVehicleForm({...vehicleForm, vendorId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id.toString()}>{vendor.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicle-type">Vehicle Type *</Label>
                        <Select value={vehicleForm.vehicleType} onValueChange={(value) => setVehicleForm({...vehicleForm, vehicleType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedan">Sedan</SelectItem>
                            <SelectItem value="suv">SUV</SelectItem>
                            <SelectItem value="tempo_traveller">Tempo Traveller</SelectItem>
                            <SelectItem value="mini_bus">Mini Bus</SelectItem>
                            <SelectItem value="coach">Coach</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="vehicle-name">Vehicle Name</Label>
                        <Input
                          id="vehicle-name"
                          value={vehicleForm.vehicleName}
                          onChange={(e) => setVehicleForm({...vehicleForm, vehicleName: e.target.value})}
                          placeholder="e.g., Luxury Coach #1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="capacity">Capacity *</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={vehicleForm.capacity}
                          onChange={(e) => setVehicleForm({...vehicleForm, capacity: e.target.value})}
                          placeholder="Number of passengers"
                        />
                      </div>
                      <div>
                        <Label htmlFor="available-count">Available Count</Label>
                        <Input
                          id="available-count"
                          type="number"
                          value={vehicleForm.availableCount}
                          onChange={(e) => setVehicleForm({...vehicleForm, availableCount: e.target.value})}
                          placeholder="Number available"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="hourly-rate">Hourly Rate</Label>
                      <Input
                        id="hourly-rate"
                        value={vehicleForm.hourlyRate}
                        onChange={(e) => setVehicleForm({...vehicleForm, hourlyRate: e.target.value})}
                        placeholder="₹ per hour"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setVehicleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleVehicleSubmit}
                      disabled={createVehicleMutation.isPending}
                    >
                      {createVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {vehicles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vehicles added yet</p>
                  <p className="text-sm">Add vehicles from your registered vendors</p>
                  {vendors.length === 0 && (
                    <p className="text-xs mt-2">First add transport vendors in the previous tab</p>
                  )}
                </div>
              ) : (
                vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {vehicle.vehicleName || `${vehicle.vehicleType} Vehicle`}
                          </CardTitle>
                          <CardDescription className="capitalize">
                            {vehicle.vehicleType?.replace('_', ' ')}
                          </CardDescription>
                        </div>
                        <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                          {vehicle.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          Capacity: {vehicle.capacity}
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          Available: {vehicle.availableCount}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
        <Button onClick={handleComplete} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Complete Transport Setup
        </Button>
      </div>
    </div>
  );
}