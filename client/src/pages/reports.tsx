import React, { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { BarChart3, Users, FileSpreadsheet, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDateForDisplay } from "@/lib/date-utils";
import RsvpStatusDisplay from "@/components/rsvp/rsvp-status-display";
import { useCurrentEvent } from "@/hooks/use-current-event";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use the current event from the context
  const { currentEventId } = useCurrentEvent();
  
  // Fallback to first event only if currentEventId is not available
  const { data: events = [] } = useQuery<any[]>({
    queryKey: ['/api/events'],
  });
  
  const eventId = currentEventId || events?.[0]?.id || 1;
  
  // Fetch guests
  const { data: guests = [], isLoading: isLoadingGuests } = useQuery<any[]>({
    queryKey: [`/api/events/${eventId}/guests`],
    enabled: !!eventId,
  });
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-4xl font-serif font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-gray-500">
          View event statistics and track progress
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="rsvp">
            <Users className="mr-2 h-4 w-4" /> RSVP Progress
          </TabsTrigger>
          <TabsTrigger value="events">
            <CalendarDays className="mr-2 h-4 w-4" /> Event Statistics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Reports Overview</CardTitle>
              <CardDescription>Get a snapshot of your event statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center text-center py-8">
                <h3 className="text-lg font-medium mb-2">Additional Reports Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mb-2">
                  More comprehensive reporting features are under development and will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rsvp">
          <Card>
            <CardHeader>
              <CardTitle>RSVP Completion Status</CardTitle>
              <CardDescription>
                Track which guests have completed each stage of the RSVP process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>RSVP Status</TableHead>
                      <TableHead>Responded On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(guests) && guests.map(guest => (
                      <TableRow key={guest.id}>
                        <TableCell>
                          {guest.firstName} {guest.lastName}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            {guest.email && <span>{guest.email}</span>}
                            {guest.phone && <span>{guest.phone}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <RsvpStatusDisplay guest={guest} />
                        </TableCell>
                        <TableCell>
                          {guest.rsvpStatus !== "pending" ? formatDateForDisplay(guest.updatedAt) : "Not yet responded"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Event Statistics</CardTitle>
              <CardDescription>View attendance and participation metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center text-center py-8">
                <h3 className="text-lg font-medium mb-2">Event Reports Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mb-2">
                  Detailed event statistics and attendance data will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}