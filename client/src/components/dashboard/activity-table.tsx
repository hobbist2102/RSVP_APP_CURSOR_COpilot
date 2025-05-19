import React, { useState, useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateForDisplay } from "@/lib/date-utils";
import { Eye, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/ui/data-table";

export interface RsvpActivity {
  id: number;
  guest: {
    id: number;
    name: string;
    email: string;
    initials: string;
  };
  status: "confirmed" | "declined" | "pending";
  date: string;
  plusOne: string | null;
}

interface ActivityTableProps {
  activities: RsvpActivity[];
  onViewGuest?: (guestId: number) => void;
  onEditGuest?: (guestId: number) => void;
  onFilterChange?: (filter: string) => void;
}

// Memoized cell components for improved performance
const GuestCell = memo(({ guest }: { guest: RsvpActivity['guest'] }) => (
  <div className="flex items-center">
    <Avatar className="h-8 w-8 rounded-full bg-primary text-white">
      <AvatarFallback>{guest.initials}</AvatarFallback>
    </Avatar>
    <div className="ml-4">
      <div className="text-sm font-medium text-neutral">{guest.name}</div>
      <div className="text-xs text-gray-500">{guest.email}</div>
    </div>
  </div>
));

const StatusCell = memo(({ status }: { status: RsvpActivity['status'] }) => {
  const statusColor = useMemo(() => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "declined": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }, [status]);
  
  return (
    <Badge 
      variant="outline" 
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
});

const ActionsCell = memo(({ 
  guestId, 
  onViewGuest, 
  onEditGuest 
}: { 
  guestId: number;
  onViewGuest?: (id: number) => void;
  onEditGuest?: (id: number) => void;
}) => (
  <div className="flex space-x-3">
    <button
      onClick={() => onViewGuest && onViewGuest(guestId)}
      className="text-primary hover:text-opacity-80"
    >
      <Eye className="h-4 w-4" />
      <span className="sr-only">View</span>
    </button>
    <button
      onClick={() => onEditGuest && onEditGuest(guestId)}
      className="text-neutral hover:text-opacity-80"
    >
      <Edit className="h-4 w-4" />
      <span className="sr-only">Edit</span>
    </button>
  </div>
));

// Main component with enhanced performance
const ActivityTable = memo(function ActivityTable({
  activities,
  onViewGuest,
  onEditGuest,
  onFilterChange,
}: ActivityTableProps) {
  // Memoize filtered activities to prevent unnecessary calculations
  const [filter, setFilter] = useState<string>("all");
  
  const filteredActivities = useMemo(() => {
    if (filter === "all") {
      return activities;
    }
    return activities.filter(activity => activity.status === filter);
  }, [activities, filter]);

  // Memoized handler to prevent recreation on re-render
  const handleFilterChange = useCallback((value: string) => {
    setFilter(value);
    
    if (onFilterChange) {
      onFilterChange(value);
    }
  }, [onFilterChange]);

  // Memoized columns definition to prevent recreation on re-render
  const columns = useMemo(() => [
    {
      header: "Guest",
      accessor: (row: RsvpActivity) => row.guest.name,
      cell: (row: RsvpActivity) => <GuestCell guest={row.guest} />,
    },
    {
      header: "Status",
      accessor: (row: RsvpActivity) => row.status,
      cell: (row: RsvpActivity) => <StatusCell status={row.status} />,
    },
    {
      header: "Date",
      accessor: (row: RsvpActivity) => row.date,
      cell: (row: RsvpActivity) => formatDateForDisplay(row.date),
    },
    {
      header: "Plus One",
      accessor: (row: RsvpActivity) => row.plusOne || "N/A",
    },
    {
      header: "Actions",
      accessor: (row: RsvpActivity) => "",
      cell: (row: RsvpActivity) => (
        <ActionsCell 
          guestId={row.guest.id} 
          onViewGuest={onViewGuest} 
          onEditGuest={onEditGuest}
        />
      ),
    },
  ], [onViewGuest, onEditGuest]);

  return (
    <Card>
      <CardHeader className="py-5 px-6 border-b border-gray-200 flex justify-between items-center flex-wrap sm:flex-nowrap">
        <CardTitle className="text-lg font-medium font-playfair mb-3 sm:mb-0">Recent RSVP Activity</CardTitle>
        <div className="flex space-x-2">
          <Select defaultValue="all" onValueChange={handleFilterChange}>
            <SelectTrigger className="text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary h-9 w-[150px]">
              <SelectValue placeholder="All Responses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Responses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={filteredActivities}
          columns={columns}
          keyField="id"
          defaultItemsPerPage={5}
          itemsPerPageOptions={[5, 10, 25]}
          virtualized={true} // Enable virtualization for better performance with large datasets
          virtualizedHeight={300} // Set a fixed height for virtualization
        />
      </CardContent>
    </Card>
  );
});

export default ActivityTable;
