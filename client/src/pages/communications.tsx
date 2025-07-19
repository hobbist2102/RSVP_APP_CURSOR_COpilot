import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { get, post, put } from "@/lib/api-utils";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { 
  MessageSquare, 
  Mail, 
  Settings, 
  Users, 
  Clock, 
  Send, 
  Eye,
  Bell,
  BellOff,
  ShieldCheck,
  Zap,
  BarChart3,
  Filter,
  Plus,
  Calendar,
  Hotel,
  Car,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

interface CommunicationConfig {
  eventId: number;
  familySettings: {
    communicationStyle: 'traditional' | 'modern' | 'minimal';
    approvalRequired: boolean;
    disablePreAssignmentNotifications: boolean;
    language: 'english' | 'hindi' | 'mixed';
  };
  moduleConfigurations: {
    rsvp: {
      enabled: boolean;
      reminderFrequency: number;
      maxReminders: number;
      stage2AutoTrigger: boolean;
    };
    accommodation: {
      enabled: boolean;
      preAssignmentNotifications: boolean;
      checkInReminders: boolean;
      notificationTiming: {
        preAssignment: number;
        checkInReminder: number;
      };
    };
    transport: {
      enabled: boolean;
      driverAssignmentNotifications: boolean;
      pickupConfirmations: boolean;
      notificationTiming: {
        driverAssignment: number;
        pickupConfirmation: number;
      };
    };
    venue: {
      enabled: boolean;
      ceremonyUpdates: boolean;
      weatherAlerts: boolean;
      finalDetailsPackage: boolean;
    };
  };
}

interface GuestCommunicationStats {
  totalGuests: number;
  rsvpStatus: { confirmed: number; pending: number; declined: number };
  accommodationStatus: { assigned: number; pending: number };
  transportStatus: { assigned: number; pending: number };
  communicationStatus: { 
    emailAvailable: number; 
    whatsappAvailable: number; 
    unreachable: number; 
  };
}

interface ActiveAutomation {
  id: string;
  name: string;
  module: string;
  type: 'time_based' | 'status_based' | 'manual';
  status: 'active' | 'paused' | 'completed';
  nextRun?: Date;
  guestsAffected: number;
  lastRun?: Date;
}

export default function Communications() {
  const { data: currentEvent } = useCurrentEvent();
  const currentEventId = currentEvent?.data?.id;
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  // Fetch communication configuration
  const { data: commConfig, isLoading: configLoading } = useQuery({
    queryKey: ['communication-config', currentEventId],
    queryFn: () => get(`/api/events/${currentEventId}/communication/config`),
    enabled: !!currentEventId,
  });

  // Fetch guest communication stats
  const { data: guestStats, isLoading: statsLoading } = useQuery({
    queryKey: ['communication-stats', currentEventId],
    queryFn: () => get(`/api/events/${currentEventId}/communication/stats`),
    enabled: !!currentEventId,
  });

  // Fetch active automations
  const { data: automations, isLoading: automationsLoading } = useQuery({
    queryKey: ['active-automations', currentEventId],
    queryFn: () => get(`/api/events/${currentEventId}/communication/automations`),
    enabled: !!currentEventId,
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: (config: Partial<CommunicationConfig>) =>
      put(`/api/events/${currentEventId}/communication/config`, config),
    onSuccess: () => {
      toast({ title: "Settings updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['communication-config'] });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  if (!currentEventId) {
    return <div>Please select an event first</div>;
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Communication Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestStats?.totalGuests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all modules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Available</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {guestStats?.communicationStatus?.emailAvailable || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Can receive emails
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Available</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {guestStats?.communicationStatus?.whatsappAvailable || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Can receive WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unreachable</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {guestStats?.communicationStatus?.unreachable || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              No contact method
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Module Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              RSVP Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confirmed</span>
                <span className="text-green-600 font-medium">
                  {guestStats?.rsvpStatus?.confirmed || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span className="text-yellow-600 font-medium">
                  {guestStats?.rsvpStatus?.pending || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Declined</span>
                <span className="text-red-600 font-medium">
                  {guestStats?.rsvpStatus?.declined || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Accommodation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Assigned</span>
                <span className="text-green-600 font-medium">
                  {guestStats?.accommodationStatus?.assigned || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span className="text-yellow-600 font-medium">
                  {guestStats?.accommodationStatus?.pending || 0}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {commConfig?.moduleConfigurations?.accommodation?.preAssignmentNotifications ? (
                  <><Bell className="h-3 w-3 text-green-500" /> Notifications On</>
                ) : (
                  <><BellOff className="h-3 w-3 text-red-500" /> Notifications Off</>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Car className="h-4 w-4" />
              Transport
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Assigned</span>
                <span className="text-green-600 font-medium">
                  {guestStats?.transportStatus?.assigned || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span className="text-yellow-600 font-medium">
                  {guestStats?.transportStatus?.pending || 0}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {commConfig?.moduleConfigurations?.transport?.driverAssignmentNotifications ? (
                  <><Bell className="h-3 w-3 text-green-500" /> Notifications On</>
                ) : (
                  <><BellOff className="h-3 w-3 text-red-500" /> Notifications Off</>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Venue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                {commConfig?.moduleConfigurations?.venue?.ceremonyUpdates ? (
                  <><CheckCircle className="h-3 w-3 text-green-500" /> Updates Active</>
                ) : (
                  <><XCircle className="h-3 w-3 text-red-500" /> Updates Disabled</>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {commConfig?.moduleConfigurations?.venue?.weatherAlerts ? (
                  <><CheckCircle className="h-3 w-3 text-green-500" /> Weather Alerts</>
                ) : (
                  <><XCircle className="h-3 w-3 text-red-500" /> No Weather Alerts</>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Emergency Always On
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Automations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Active Automations
          </CardTitle>
          <CardDescription>
            Real-time automation rules across all modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automations?.map((automation: ActiveAutomation) => (
              <div key={automation.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={automation.status === 'active' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {automation.status === 'active' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {automation.status}
                  </Badge>
                  <div>
                    <p className="font-medium">{automation.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {automation.module} • {automation.guestsAffected} guests affected
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {automation.nextRun && (
                    <p>Next: {new Date(automation.nextRun).toLocaleDateString()}</p>
                  )}
                  {automation.lastRun && (
                    <p>Last: {new Date(automation.lastRun).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
            
            {(!automations || automations.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active automations</p>
                <p className="text-sm">Configure triggers in the Automation tab</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuickMessage = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Quick Message Center
          </CardTitle>
          <CardDescription>
            Send messages to specific guest groups with smart channel selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Audience Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="audience-filter">Audience Filter</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Guests</SelectItem>
                  <SelectItem value="confirmed">RSVP Confirmed</SelectItem>
                  <SelectItem value="pending">RSVP Pending</SelectItem>
                  <SelectItem value="bride-side">Bride's Family</SelectItem>
                  <SelectItem value="groom-side">Groom's Family</SelectItem>
                  <SelectItem value="accommodation-needed">Need Accommodation</SelectItem>
                  <SelectItem value="transport-needed">Need Transport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="communication-channel">Channel</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smart">Smart (Email + WhatsApp)</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message-urgency">Urgency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message Composition */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input placeholder="Message subject..." />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea 
                placeholder="Type your message here..."
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Use variables: {{guest_name}}, {{bride_name}}, {{groom_name}}, {{wedding_date}}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
            <p className="text-muted-foreground">
              Manage guest communication across all modules with smart automation
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setShowMessageDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quick-message">Quick Message</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="quick-message">
            {renderQuickMessage()}
          </TabsContent>

          <TabsContent value="automation">
            <div className="text-center py-12">
              <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Automation Rules</h3>
              <p className="text-muted-foreground">
                Configure smart triggers and automation rules
              </p>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Template Library</h3>
              <p className="text-muted-foreground">
                Manage communication templates across all modules
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Communication History</h3>
              <p className="text-muted-foreground">
                View sent messages and analytics
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}