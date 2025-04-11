import React, { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCard from "@/components/dashboard/stats-card";
import RsvpChart from "@/components/dashboard/rsvp-chart";
import Tasks from "@/components/dashboard/tasks";
import ActivityTable from "@/components/dashboard/activity-table";
import AccommodationStatus from "@/components/dashboard/accommodation-status";
import { Button } from "@/components/ui/button";
import { FolderInput, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDate, getInitials } from "@/lib/utils";
import { useEventStats } from "@/hooks/use-stats";
import GuestImportDialog from "@/components/guest/guest-import-dialog";
import GuestDetailDialog from "@/components/guest/guest-detail-dialog";
import { useCurrentEvent } from "@/hooks/use-current-event";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [chartPeriod, setChartPeriod] = useState<"weekly" | "monthly">("monthly");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [showGuestDetailDialog, setShowGuestDetailDialog] = useState(false);
  
  // Get the current event from our custom hook
  const { currentEvent, currentEventId } = useCurrentEvent();
  
  // Use the current event ID
  const eventId = currentEventId || 1;
  
  // Get event statistics
  const { stats, isLoadingStats, generateRsvpProgressData } = useEventStats(eventId);
  
  // Fetch recent activities (RSVP responses)
  const { data: guests, refetch: refetchGuests } = useQuery({
    queryKey: [`/api/events/${eventId}/guests`],
    enabled: !!eventId,
  });
  
  // Fetch accommodations
  const { data: accommodations } = useQuery({
    queryKey: [`/api/events/${eventId}/accommodations`],
    enabled: !!eventId,
  });
  
  // Sample tasks
  const tasks = [
    { id: 1, title: "Send RSVP reminder email", dueDate: "in 2 days", completed: false },
    { id: 2, title: "Confirm florist arrangements", dueDate: "tomorrow", completed: false },
    { id: 3, title: "Update dinner seating chart", dueDate: "in 3 days", completed: false },
    { id: 4, title: "Confirm transportation for VIP guests", dueDate: "in 5 days", completed: false },
  ];
  
  // Prepare recent RSVP activity data
  const recentActivities = guests
    ? guests
        .slice(0, 5)
        .map((guest: any) => ({
          id: guest.id,
          guest: {
            id: guest.id,
            name: `${guest.firstName} ${guest.lastName}`,
            email: guest.email,
            initials: getInitials(`${guest.firstName} ${guest.lastName}`),
          },
          status: guest.rsvpStatus,
          date: guest.createdAt,
          plusOne: guest.plusOneName || (guest.plusOneAllowed ? "Allowed, but not specified" : null),
        }))
    : [];
  
  // Prepare accommodation data
  const accommodationData = accommodations
    ? accommodations.map((acc: any) => ({
        id: acc.id,
        name: acc.roomType,
        total: acc.totalRooms,
        allocated: acc.allocatedRooms,
        percentage: Math.round((acc.allocatedRooms / acc.totalRooms) * 100),
      }))
    : [];
  
  // Sample special requirements
  const specialRequirements = [
    { id: 1, text: "3 rooms with accessibility features", status: "completed" },
    { id: 2, text: "2 rooms with cribs", status: "completed" },
    { id: 3, text: "4 additional rooms on hold", status: "pending" },
  ];
  
  // Handle view guest
  const handleViewGuest = (guestId: number) => {
    const guest = guests.find((g: any) => g.id === guestId);
    if (guest) {
      setSelectedGuest(guest);
      setShowGuestDetailDialog(true);
    }
  };
  
  // Handle edit guest
  const handleEditGuest = (guestId: number) => {
    setLocation(`/guests?edit=${guestId}`);
  };
  
  // Handle import success
  const handleImportSuccess = () => {
    refetchGuests();
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-playfair font-bold text-neutral">Dashboard</h2>
          <p className="text-sm text-gray-500">
            Wedding: <span className="font-medium">{currentEvent?.title || "Loading..."}</span> | 
            Dates: <span className="font-medium">
              {currentEvent ? `${formatDate(currentEvent.startDate)} - ${formatDate(currentEvent.endDate)}` : "Loading..."}
            </span>
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            variant="outline" 
            className="border-primary text-primary"
            onClick={() => setShowImportDialog(true)}
          >
            <FolderInput className="mr-2 h-4 w-4" />
            Import Guests
          </Button>
          <Button 
            className="gold-gradient"
            onClick={() => setLocation("/guests?add=true")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="RSVP Confirmed"
          value={stats?.confirmed || 0}
          change={{ value: 12, text: "from last week" }}
          icon="confirmed"
          onClick={() => setLocation(`/guests?filter=confirmed`)}
        />
        
        <StatsCard
          title="RSVP Declined"
          value={stats?.declined || 0}
          change={{ value: 0, text: "No change from last week" }}
          icon="declined"
          onClick={() => setLocation(`/guests?filter=declined`)}
        />
        
        <StatsCard
          title="Awaiting Response"
          value={stats?.pending || 0}
          change={{ value: -8, text: "from last week" }}
          icon="pending"
          onClick={() => setLocation(`/guests?filter=pending`)}
        />
        
        <StatsCard
          title="Total Guests"
          value={stats?.total || 0}
          change={{ value: 5, text: "from last week" }}
          icon="total"
          onClick={() => setLocation(`/guests`)}
        />
      </div>

      {/* RSVP Progress + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RsvpChart 
            data={generateRsvpProgressData(chartPeriod)} 
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
          />
        </div>
        
        <Tasks initialTasks={tasks} />
      </div>

      {/* Recent Activity + Accommodations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityTable 
            activities={recentActivities} 
            onViewGuest={handleViewGuest}
            onEditGuest={handleEditGuest}
          />
        </div>
        
        <AccommodationStatus 
          accommodations={accommodationData}
          specialRequirements={specialRequirements}
          onManageClick={() => setLocation("/accommodations")}
        />
      </div>
      
      {/* Import Dialog */}
      <GuestImportDialog 
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        eventId={eventId}
        onSuccess={handleImportSuccess}
      />
      
      {/* Guest Detail Dialog */}
      <GuestDetailDialog
        isOpen={showGuestDetailDialog}
        onClose={() => setShowGuestDetailDialog(false)}
        guest={selectedGuest}
        onEdit={handleEditGuest}
      />
    </DashboardLayout>
  );
}
