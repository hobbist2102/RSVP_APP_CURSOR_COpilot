import React, { useState } from "react";
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

export default function ActivityTable({
  activities,
  onViewGuest,
  onEditGuest,
  onFilterChange,
}: ActivityTableProps) {
  const [filteredActivities, setFilteredActivities] = useState(activities);
  
  // Update filteredActivities when the activities prop changes
  React.useEffect(() => {
    setFilteredActivities(activities);
  }, [activities]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleFilterChange = (value: string) => {
    if (value === "all") {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => activity.status === value));
    }
    
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  const columns = [
    {
      header: "Guest",
      accessor: (row: RsvpActivity) => row.guest.name,
      cell: (row: RsvpActivity) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 rounded-full bg-primary text-white">
            <AvatarFallback>{row.guest.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <div className="text-sm font-medium text-neutral">{row.guest.name}</div>
            <div className="text-xs text-gray-500">{row.guest.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: RsvpActivity) => row.status,
      cell: (row: RsvpActivity) => (
        <Badge 
          variant="outline" 
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(row.status)}`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
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
        <div className="flex space-x-3">
          <button
            onClick={() => onViewGuest && onViewGuest(row.guest.id)}
            className="text-primary hover:text-opacity-80"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </button>
          <button
            onClick={() => onEditGuest && onEditGuest(row.guest.id)}
            className="text-neutral hover:text-opacity-80"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </button>
        </div>
      ),
    },
  ];

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
          defaultItemsPerPage={3}
          itemsPerPageOptions={[3, 5, 10]}
        />
      </CardContent>
    </Card>
  );
}
