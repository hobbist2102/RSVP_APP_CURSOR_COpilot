import { useQuery, useMutation } from '@tanstack/react-query';
import { TransportGroup, Guest } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";

// Transport Group Component
const TransportGroupCard = ({ group, onEdit, onDelete }: { 
  group: TransportGroup, 
  onEdit: (group: TransportGroup) => void,
  onDelete: (groupId: number) => void
}) => {
  const { data: allocations, isLoading } = useQuery({
    queryKey: ['/api/transport-groups', group.id, 'allocations'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/transport-groups/${group.id}`);
      const data = await res.json();
      return data.allocations;
    }
  });

  const totalGuests = allocations?.length || 0;
  const totalPeople = allocations?.reduce((total, allocation) => {
    let count = 1; // The guest
    if (allocation.includesPlusOne) count += 1;
    if (allocation.includesChildren) count += allocation.childrenCount;
    return total + count;
  }, 0) || 0;

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{group.name}</CardTitle>
            <CardDescription className="mt-1">
              {group.transportMode === 'car' ? 
                `${group.vehicleType.charAt(0).toUpperCase() + group.vehicleType.slice(1)} (${group.vehicleCapacity} seats)` : 
                `${group.transportMode.charAt(0).toUpperCase() + group.transportMode.slice(1)} (${group.vehicleCapacity * group.vehicleCount} total seats)`
              }
            </CardDescription>
          </div>
          <Badge variant={group.status === 'confirmed' ? 'default' : 'secondary'}>
            {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pickup:</span>
            <span className="font-medium">{group.pickupLocation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">
              {group.pickupDate ? format(new Date(group.pickupDate), 'MMM dd, yyyy') : 'Not set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">{group.pickupTimeSlot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dropoff:</span>
            <span className="font-medium">{group.dropoffLocation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Guests:</span>
            <span className="font-medium">{isLoading ? 'Loading...' : `${totalGuests} (${totalPeople} total people)`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vehicles:</span>
            <span className="font-medium">{group.vehicleCount} {group.vehicleType}(s)</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <Button variant="outline" size="sm" onClick={() => onEdit(group)}>
          Edit Group
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(group.id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

// Schema for the transport form
const transportGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  transportMode: z.enum(["car", "bus", "shuttle"]),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleCapacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  vehicleCount: z.coerce.number().min(1, "Count must be at least 1"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  pickupLocationDetails: z.string().optional(),
  pickupDate: z.string().min(1, "Date is required"),
  pickupTimeSlot: z.string().min(1, "Time slot is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  status: z.enum(["draft", "pending", "confirmed"])
});

type TransportGroupFormValues = z.infer<typeof transportGroupSchema>;

// Transport Group Form Component
const TransportGroupForm = ({ 
  group, 
  onSave, 
  onCancel 
}: { 
  group?: TransportGroup, 
  onSave: (data: TransportGroupFormValues) => void,
  onCancel: () => void
}) => {
  // Form configuration
  const form = useForm<TransportGroupFormValues>({
    resolver: zodResolver(transportGroupSchema),
    defaultValues: group ? {
      ...group,
      pickupDate: group.pickupDate || ''
    } : {
      name: '',
      transportMode: 'car',
      vehicleType: 'sedan',
      vehicleCapacity: 4,
      vehicleCount: 1,
      pickupLocation: '',
      pickupLocationDetails: '',
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTimeSlot: '10:00-12:00',
      dropoffLocation: '',
      status: 'draft'
    }
  });

  // Handle transport mode change to update default vehicle type and capacity
  const transportMode = form.watch('transportMode');
  
  useEffect(() => {
    if (transportMode === 'bus') {
      form.setValue('vehicleType', 'bus');
      form.setValue('vehicleCapacity', 50);
    } else if (transportMode === 'shuttle') {
      form.setValue('vehicleType', 'shuttle');
      form.setValue('vehicleCapacity', 15);
    } else if (!group) {
      form.setValue('vehicleType', 'sedan');
      form.setValue('vehicleCapacity', 4);
    }
  }, [transportMode, form, group]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Transport Group Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="transportMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport Mode</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., sedan, van" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="vehicleCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="vehicleCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Count</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="pickupDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pickup Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pickupTimeSlot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Slot</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 10:00-12:00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="pickupLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Airport Terminal 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="pickupLocationDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Details (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Any additional details about the pickup location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dropoffLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dropoff Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Hotel Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Transport Group</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Main Transport Page Component
export default function TransportPage() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TransportGroup | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Get current event ID from session
  const { data: currentEvent } = useQuery({
    queryKey: ['/api/current-event'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/current-event');
      return res.json();
    }
  });
  
  const eventId = currentEvent?.id;
  
  // Get all transport groups for the event
  const { 
    data: transportGroups = [], 
    isLoading: isLoadingGroups,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['/api/events', eventId, 'transport-groups'],
    queryFn: async () => {
      if (!eventId) return [];
      const res = await apiRequest('GET', `/api/events/${eventId}/transport-groups`);
      return res.json();
    },
    enabled: !!eventId
  });
  
  // Check for transport updates
  const { 
    data: transportUpdates,
    isLoading: isCheckingUpdates,
    refetch: checkUpdates 
  } = useQuery({
    queryKey: ['/api/events', eventId, 'check-transport-updates'],
    queryFn: async () => {
      if (!eventId) return { needsUpdate: false, modifiedGuests: [] };
      const res = await apiRequest('GET', `/api/events/${eventId}/check-transport-updates`);
      return res.json();
    },
    enabled: !!eventId
  });
  
  // Create transport group
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/transport-groups', {
        ...data,
        eventId
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transport group created",
        description: "The transport group has been created successfully.",
      });
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'transport-groups'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create transport group",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update transport group
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PUT', `/api/transport-groups/${selectedGroup?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transport group updated",
        description: "The transport group has been updated successfully.",
      });
      setIsFormOpen(false);
      setSelectedGroup(undefined);
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'transport-groups'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update transport group",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete transport group
  const deleteMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const res = await apiRequest('DELETE', `/api/transport-groups/${groupId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transport group deleted",
        description: "The transport group has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'transport-groups'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete transport group",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Generate transport groups
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) throw new Error("No event selected");
      const res = await apiRequest('POST', `/api/events/${eventId}/generate-transport-groups`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transport groups generated",
        description: `Generated ${data.length} transport groups based on guest travel information.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'transport-groups'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate transport groups",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter groups based on selected tab
  const filteredGroups = transportGroups.filter((group: TransportGroup) => {
    if (selectedTab === 'all') return true;
    return group.status === selectedTab;
  });
  
  // Handle save form (create or update)
  const handleSaveForm = (data: TransportGroupFormValues) => {
    if (selectedGroup) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Handle edit group
  const handleEditGroup = (group: TransportGroup) => {
    setSelectedGroup(group);
    setIsFormOpen(true);
  };
  
  // Handle delete group with confirmation
  const handleDeleteGroup = (groupId: number) => {
    if (confirm("Are you sure you want to delete this transport group?")) {
      deleteMutation.mutate(groupId);
    }
  };
  
  // Create new group
  const handleAddGroup = () => {
    setSelectedGroup(undefined);
    setIsFormOpen(true);
  };
  
  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedGroup(undefined);
  };

  if (!eventId) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Event Selected</h2>
          <p className="text-muted-foreground mb-4">Please select an event to manage transport groups</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transport Groups</h1>
          <p className="text-muted-foreground mt-1">Manage transportation for all guests</p>
        </div>
        <div className="flex gap-2">
          {transportUpdates?.needsUpdate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 max-w-md">
              <AlertTriangle className="h-5 w-5" />
              <div className="text-sm">
                <p className="font-medium">Transport groups need updating</p>
                <p className="text-xs">
                  {transportUpdates.modifiedGuests.length} guests have updated their travel info.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2" 
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Regenerate
              </Button>
            </div>
          )}
          <Button onClick={handleAddGroup}>
            <Plus className="h-4 w-4 mr-1" />
            Add Group
          </Button>
          <Button 
            onClick={() => generateMutation.mutate()} 
            variant="outline" 
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Auto-Generate
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          {isLoadingGroups ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h3 className="text-xl font-semibold mb-2">No transport groups found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedTab === 'all' ? 
                  "You haven't created any transport groups yet." : 
                  `You don't have any ${selectedTab} transport groups.`}
              </p>
              <Button onClick={handleAddGroup}>Create a Transport Group</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group: TransportGroup) => (
                <TransportGroupCard 
                  key={group.id} 
                  group={group} 
                  onEdit={handleEditGroup}
                  onDelete={handleDeleteGroup}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedGroup ? 'Edit Transport Group' : 'Create New Transport Group'}</DialogTitle>
            <DialogDescription>
              {selectedGroup ? 'Update the details of this transport group' : 'Fill in the details to create a new transport group'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="px-1 py-2">
              <TransportGroupForm 
                group={selectedGroup} 
                onSave={handleSaveForm} 
                onCancel={handleCloseForm} 
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}