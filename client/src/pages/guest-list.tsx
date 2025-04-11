import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DataTable from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exportToExcel, formatGuestsForExport } from "@/lib/xlsx-utils";
import GuestForm from "@/components/ui/guest-form";
import GuestImportDialog from "@/components/guest/guest-import-dialog";
import GuestDetailDialog from "@/components/guest/guest-detail-dialog";
import { getRsvpStatusColor, getInitials, formatDate } from "@/lib/utils";
import { Plus, FileDown, FileUp, Mail, Eye, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentEvent } from "@/hooks/use-current-event";

export default function GuestList() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Use current event hook to get the current event ID
  const { currentEventId } = useCurrentEvent();
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Selected guest for operations
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  
  // Get parameters from URL query params
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const editGuestId = urlParams.get("edit");
  const addGuest = urlParams.get("add");
  const filter = urlParams.get("filter"); // Get filter parameter for RSVP status
  
  // Use the current event ID from the context
  const eventId = currentEventId || 1;
  
  // Fetch guests
  const { data: guests = [], isLoading: isLoadingGuests, refetch: refetchGuests } = useQuery({
    queryKey: [`/api/events/${eventId}/guests`],
    enabled: !!eventId,
  });
  
  // Create guest mutation
  const createGuestMutation = useMutation({
    mutationFn: async (guestData: any) => {
      const response = await apiRequest("POST", `/api/events/${eventId}/guests`, guestData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/guests`] });
      setShowAddDialog(false);
      toast({
        title: "Guest Added",
        description: "The guest has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to Add Guest",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Update guest mutation with enhanced error handling
  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      try {
        console.log(`Submitting update for guest ${id} with data:`, data);
        const response = await apiRequest("PUT", `/api/guests/${id}`, data);
        
        if (!response.ok) {
          // Parse error response
          const errorData = await response.json().catch(() => null);
          console.error("Error response from server:", errorData);
          
          // Throw a meaningful error with details from the server if available
          throw new Error(
            errorData?.message || 
            errorData?.details || 
            `Server error: ${response.status} ${response.statusText}`
          );
        }
        
        return await response.json();
      } catch (err) {
        console.error("Guest update error:", err);
        throw err; // Re-throw for the mutation to catch
      }
    },
    onSuccess: (data) => {
      console.log("Guest updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/guests`] });
      setShowEditDialog(false);
      toast({
        title: "Guest Updated",
        description: "The guest has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Mutation error handler:", error);
      
      // Handle database-specific errors
      if (error.message?.includes("terminating connection") || 
          error.message?.includes("database")) {
        toast({
          variant: "destructive",
          title: "Database Connection Error",
          description: "The database connection was interrupted. Please try again in a moment.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Update Guest",
          description: error.message || "An unknown error occurred while updating the guest",
        });
      }
      
      // Don't close the dialog so user can try again
    },
  });
  
  // Delete guest mutation
  const deleteGuestMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/guests/${id}`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/guests`] });
      setShowDeleteDialog(false);
      setSelectedGuest(null);
      toast({
        title: "Guest Deleted",
        description: "The guest has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to Delete Guest",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Get current event for export filename
  const { currentEvent } = useCurrentEvent();

  // Handle export
  const handleExport = () => {
    try {
      const formattedData = formatGuestsForExport(guests);
      exportToExcel(
        formattedData, 
        `Guest_List_${currentEvent?.title.replace(/\s+/g, '_') || 'Wedding'}_${new Date().toISOString().split('T')[0]}`
      );
      
      toast({
        title: "Export Successful",
        description: "The guest list has been exported to Excel.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An error occurred while exporting the guest list.",
      });
    }
  };
  
  // Handle add guest
  const handleAddGuest = (data: any) => {
    createGuestMutation.mutate(data);
  };
  
  // Handle edit guest
  const handleEditGuest = (data: any) => {
    if (selectedGuest) {
      updateGuestMutation.mutate({ id: selectedGuest.id, data });
    }
  };
  
  // Handle delete guest
  const handleDeleteGuest = () => {
    if (selectedGuest) {
      deleteGuestMutation.mutate(selectedGuest.id);
    }
  };
  
  // Handle view guest details
  const handleViewGuest = (guest: any) => {
    setSelectedGuest(guest);
    setShowDetailDialog(true);
  };
  
  // Handle import success
  const handleImportSuccess = () => {
    refetchGuests();
  };
  
  // Handle send reminder email (placeholder functionality)
  const handleSendReminder = (guestId: number) => {
    toast({
      title: "Reminder Sent",
      description: "The reminder email has been sent to the guest.",
    });
  };
  
  // Setup table columns
  const columns = [
    {
      header: "Guest",
      accessor: (row: any) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2 bg-primary text-white">
            <AvatarFallback>{getInitials(`${row.firstName} ${row.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (row: any) => (
        <div>
          <div>{row.phone || "N/A"}</div>
          <div className="text-sm text-gray-500 truncate max-w-[150px]">{row.address || "No address"}</div>
        </div>
      ),
    },
    {
      header: "RSVP Status",
      accessor: "rsvpStatus",
      cell: (row: any) => (
        <Badge className={getRsvpStatusColor(row.rsvpStatus)}>
          {row.rsvpStatus.charAt(0).toUpperCase() + row.rsvpStatus.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Guests",
      accessor: (row: any) => (
        <div>
          {row.plusOneAllowed && (
            <div>
              +1: {row.plusOneName || <span className="text-gray-400">Not specified</span>}
            </div>
          )}
          {row.numberOfChildren > 0 && (
            <div className="text-sm text-gray-500">
              Children: {row.numberOfChildren}
              {row.childrenNames && ` (${row.childrenNames})`}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleSendReminder(row.id);
            }}
            title="Send Reminder"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedGuest(row);
              setShowDetailDialog(true);
            }}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedGuest(row);
              setShowEditDialog(true);
            }}
            title="Edit Guest"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedGuest(row);
              setShowDeleteDialog(true);
            }}
            title="Delete Guest"
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  // Check for URL parameters to auto-open dialogs
  useEffect(() => {
    if (editGuestId && !showEditDialog) {
      const guestToEdit = guests.find((g: any) => g.id === parseInt(editGuestId));
      if (guestToEdit) {
        setSelectedGuest(guestToEdit);
        setShowEditDialog(true);
      }
    }
    
    if (addGuest === "true" && !showAddDialog) {
      setShowAddDialog(true);
    }
  }, [editGuestId, addGuest, guests, showEditDialog, showAddDialog]);

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-playfair font-bold text-neutral">Guest List</h2>
          <p className="text-sm text-gray-500">
            Manage your wedding guest list and RSVPs
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
            className="border-primary text-primary"
          >
            <FileUp className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="border-primary text-primary"
          >
            <FileDown className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="gold-gradient"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Guest
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {/* Add filter status banner if filtering is active */}
        {filter && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <Badge className={`mr-2 ${filter === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                filter === 'declined' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Badge>
              <p>Showing {filter} guests only</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setLocation('/guests')}>
              Clear Filter
            </Button>
          </div>
        )}
        
        <DataTable
          data={filter ? guests.filter((guest: any) => guest.rsvpStatus === filter) : guests}
          columns={columns}
          keyField="id"
          onRowClick={handleViewGuest}
          searchable={true}
          searchPlaceholder="Search guests..."
        />
      </div>
      
      {/* Add Guest Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
          </DialogHeader>
          <GuestForm
            eventId={eventId}
            onSubmit={handleAddGuest}
            isLoading={createGuestMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Guest Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <GuestForm
              eventId={eventId}
              initialData={selectedGuest}
              onSubmit={handleEditGuest}
              isLoading={updateGuestMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete {selectedGuest?.firstName} {selectedGuest?.lastName}?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGuest}
              disabled={deleteGuestMutation.isPending}
            >
              {deleteGuestMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog */}
      <GuestImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        eventId={eventId}
        onSuccess={handleImportSuccess}
      />
      
      {/* Guest Detail Dialog */}
      <GuestDetailDialog
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        guest={selectedGuest}
        onEdit={(guestId) => {
          setShowDetailDialog(false);
          const guestToEdit = guests.find((g: any) => g.id === guestId);
          if (guestToEdit) {
            setSelectedGuest(guestToEdit);
            setShowEditDialog(true);
          }
        }}
      />
    </DashboardLayout>
  );
}
