import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WeddingEvent, TransportVendor, LocationRepresentative, EventVehicle } from "@shared/schema";
import { Check, Bus, Car, Plus, Plane, MapPin, Users, Phone, FileText, Trash2, Edit, Settings } from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
    mutationFn: (data: any) => apiRequest(`/api/transport/representatives`, {
      method: 'POST',
      body: { ...data, eventId: parseInt(eventId) }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transport/representatives', eventId] });
      setRepDialogOpen(false);
      setRepForm({ name: '', locationType: '', locationName: '', terminalGate: '', phone: '', whatsappNumber: '' });
      toast({ title: "Location representative added successfully" });
    }
  });

  const createVehicleMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/transport/vehicles`, {
      method: 'POST',
      body: { ...data, eventId: parseInt(eventId) }
    }),
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
        <div className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Transport Enabled:</h3>
              <p className="col-span-3">{defaultTransportSettings.enableTransport ? "Yes" : "No"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Grouping Strategy:</h3>
              <p className="col-span-3 capitalize">{defaultTransportSettings.transportGroupingStrategy}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Keep Families Together:</h3>
              <p className="col-span-3">{defaultTransportSettings.keepFamiliesTogether ? "Yes" : "No"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Family Priority Mode:</h3>
              <p className="col-span-3 capitalize">{defaultTransportSettings.familyPriorityMode}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Auto-assign Vehicles:</h3>
              <p className="col-span-3">{defaultTransportSettings.autoAssignVehicles ? "Yes" : "No"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Guest Preferences:</h3>
              <p className="col-span-3">{defaultTransportSettings.allowGuestPreferences ? "Allowed" : "Not Allowed"}</p>
            </div>
          </div>
          
          <h3 className="font-medium mt-4">Vehicles:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {defaultTransportSettings.vehicles.map((vehicle, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{vehicle.name}</CardTitle>
                    {vehicle.type === "Bus" ? 
                      <Bus className="h-5 w-5 text-muted-foreground" /> : 
                      <Car className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                  <CardDescription>{vehicle.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p><span className="font-medium">Capacity:</span> {vehicle.capacity} passengers</p>
                    <p><span className="font-medium">Count:</span> {vehicle.count} vehicles</p>
                    <p className="mt-2 text-muted-foreground">{vehicle.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <Button type="button" onClick={() => setIsEditing(true)}>
          Edit Transport Settings
        </Button>
      </div>
    );
  }

  // Placeholder for editing interface
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-md p-6 text-center">
        <h3 className="text-lg font-medium mb-2">Transport Management</h3>
        <p className="text-muted-foreground text-sm mb-4">
          This is a placeholder for the transport management interface.
          In a complete implementation, you would be able to define vehicle types,
          set up fleet capacities, and configure group allocations based on families.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleComplete} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Save Transport Settings
        </Button>
      </div>
    </div>
  );
}