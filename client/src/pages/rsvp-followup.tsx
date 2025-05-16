import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { apiRequest } from "@/lib/api-utils";
import DashboardLayout from "@/components/layout/dashboard-layout";
import RsvpFollowupConfiguration from "@/components/rsvp/rsvp-followup-configuration";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDateForDisplay } from "@/lib/date-utils";
import { 
  ArrowUpDown, 
  Mail, 
  MessageSquare, 
  Check, 
  X, 
  Clock, 
  RefreshCw,
  Calendar,
  User
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RsvpFollowupPage() {
  const { toast } = useToast();
  const { currentEvent } = useCurrentEvent();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [logs, setLogs] = useState<any[]>([]);
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch follow-up logs
  useEffect(() => {
    if (!currentEvent) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest(
          "GET", 
          `/api/events/${currentEvent.id}/rsvp-followup-logs`
        );
        const data = await response.json();
        setLogs(data);
        
        // Filter for pending messages
        const pending = data.filter(
          (log: any) => log.status === "scheduled" || log.status === "pending"
        );
        setPendingMessages(pending);
      } catch (error) {
        console.error("Error fetching follow-up logs:", error);
        toast({
          title: "Error",
          description: "Failed to load follow-up communication logs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentEvent]);
  
  // Trigger sending of pending communications
  const handleProcessPending = async () => {
    if (!currentEvent) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "POST", 
        `/api/events/${currentEvent.id}/rsvp-followup/process-pending`
      );
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Processing pending communications",
        });
        // Refresh data after processing
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: "Failed to process pending communications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing pending communications:", error);
      toast({
        title: "Error",
        description: "Failed to process pending communications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" /> Sent</Badge>;
      case "failed":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Failed</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="text-blue-600"><Calendar className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Filter logs by status
  const filteredLogs = statusFilter === "all" 
    ? logs 
    : logs.filter(log => log.status === statusFilter);
    
  // Log columns for data table
  const logColumns = [
    {
      accessorKey: "guest",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Guest
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-primary" />
          <span>{row.original.guestName || `Guest ID: ${row.original.guestId}`}</span>
        </div>
      ),
    },
    {
      accessorKey: "templateType",
      header: "Template Type",
      cell: ({ row }: any) => {
        const type = row.original.templateType || "";
        // Convert snake_case to Title Case with spaces
        const formattedType = type
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return <span>{formattedType}</span>;
      },
    },
    {
      accessorKey: "channel",
      header: "Channel",
      cell: ({ row }: any) => {
        const channel = row.original.channel;
        return (
          <div className="flex items-center">
            {channel === "email" ? (
              <>
                <Mail className="h-4 w-4 mr-2 text-blue-500" />
                <span>Email</span>
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                <span>WhatsApp</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "sentAt",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => {
        const date = row.original.sentAt 
          ? formatDateForDisplay(new Date(row.original.sentAt))
          : "Not sent yet";
        return <span>{date}</span>;
      },
    },
    {
      accessorKey: "error",
      header: "Error",
      cell: ({ row }: any) => (
        <span className="text-red-500 text-sm">
          {row.original.errorMessage || ""}
        </span>
      ),
    },
  ];
  
  // Render dashboard content
  const renderDashboard = () => {
    if (!currentEvent) {
      return (
        <div className="text-center p-8">
          <p>Please select an event to view RSVP follow-up data</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{logs.length}</div>
              <div className="text-sm text-muted-foreground mt-1">All time</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {logs.length > 0 
                  ? `${Math.round((logs.filter(log => log.status === "sent").length / logs.length) * 100)}%` 
                  : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {logs.filter(log => log.status === "sent").length} successful sends
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pending Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingMessages.length}</div>
              <div className="flex justify-between items-center mt-1">
                <div className="text-sm text-muted-foreground">
                  Waiting to be sent
                </div>
                {pendingMessages.length > 0 && (
                  <Button 
                    size="sm" 
                    onClick={handleProcessPending}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Process Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Communication Log</CardTitle>
                <CardDescription>
                  History of all RSVP follow-up communications
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <DataTable 
                columns={logColumns} 
                data={filteredLogs} 
                defaultSortingColumn="sentAt"
                defaultSortingDirection="desc"
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No communication logs found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold font-playfair">RSVP Follow-up Management</h1>
          <p className="text-muted-foreground">
            Track, configure and manage follow-up communications with guests
          </p>
        </div>
        
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-[400px]">
            <TabsTrigger value="dashboard">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="configuration">
              Configuration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            {renderDashboard()}
          </TabsContent>
          
          <TabsContent value="configuration" className="mt-6">
            <RsvpFollowupConfiguration />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}