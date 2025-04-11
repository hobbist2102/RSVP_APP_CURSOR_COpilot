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
import { 
  Plus, 
  FileDown, 
  FileUp, 
  Mail, 
  Eye, 
  Pencil, 
  Trash2, 
  Phone, 
  MapPin, 
  Users, 
  UserPlus, 
  Car, 
  Bed 
} from "lucide-react";
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
        // Pass the event context as a parameter
        const response = await apiRequest(
          "PUT", 
          `/api/guests/${id}`, 
          data, 
          { eventId: eventId }
        );
        
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
      // Include the event ID in the request to ensure proper event context verification
      const response = await apiRequest(
        "DELETE", 
        `/api/guests/${id}`, 
        {},
        { eventId: eventId }
      );
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
  
  // Setup table columns with enhanced details
  const columns = [
    {
      header: "Guest",
      accessor: (row: any) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2 bg-primary text-white">
            <AvatarFallback>{getInitials(`${row.firstName} ${row.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{`${row.salutation || ''} ${row.firstName} ${row.lastName}`}</div>
            <div className="text-sm text-gray-500">{row.email || "No email"}</div>
            <div className="text-xs text-primary">
              <Badge variant="outline" className="bg-purple-50 text-primary border-primary mt-1">
                {row.side}
              </Badge>
              {row.gender && (
                <Badge variant="outline" className="ml-1 mt-1 text-gray-600 border-gray-200 bg-gray-50">
                  {row.gender}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact & Location",
      accessor: (row: any) => {
        // Format phone with country code if available
        const formattedPhone = row.countryCode && row.phone 
          ? `${row.countryCode} ${row.phone}`
          : row.phone || "N/A";
            
        return (
          <div>
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1 text-gray-400" />
              <span>{formattedPhone}</span>
              {row.whatsappAvailable && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200 text-xs px-1.5">
                  WhatsApp
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1 flex items-start">
              <MapPin className="h-3 w-3 mr-1 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="truncate max-w-[200px]">{row.address || "No address"}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {row.city && `${row.city}, `}{row.state && `${row.state}, `}{row.country || ''}
            </div>
          </div>
        );
      },
    },
    {
      header: "RSVP & Group",
      accessor: (row: any) => (
        <div>
          <Badge className={getRsvpStatusColor(row.rsvpStatus)}>
            {row.rsvpStatus?.charAt(0).toUpperCase() + row.rsvpStatus?.slice(1) || "Pending"}
          </Badge>
          
          <div className="text-sm mt-2">
            {row.relationshipType && (
              <div className="flex items-center text-gray-600">
                <Users className="h-3 w-3 mr-1" />
                {row.relationshipType}
              </div>
            )}
            
            <div className="mt-1 text-xs text-gray-500">
              {row.group && `Group: ${row.group}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Additional Guests",
      accessor: (row: any) => (
        <div className="space-y-1">
          {row.plusOneAllowed && (
            <div className="flex items-center">
              <UserPlus className="h-3 w-3 mr-1 text-gray-400" />
              <span>
                {row.plusOneName || <span className="text-gray-400 italic">Plus one (unnamed)</span>}
                {row.plusOneRelationship && 
                  <span className="text-xs text-gray-500 ml-1">({row.plusOneRelationship})</span>
                }
              </span>
            </div>
          )}
          
          {/* Enhanced children display showing the complete details */}
          {Array.isArray(row.childrenDetails) && row.childrenDetails.length > 0 && (
            <div className="text-sm">
              <div className="font-medium text-xs text-gray-600 mb-1">Children:</div>
              {row.childrenDetails.map((child: any, index: number) => (
                <div key={index} className="ml-4 text-xs flex items-center">
                  <span>• {child.name}</span>
                  <span className="text-gray-500 ml-1">
                    ({child.age} yrs{child.gender ? `, ${child.gender}` : ''})
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Fallback to old format if new structure isn't available */}
          {!Array.isArray(row.childrenDetails) && row.numberOfChildren > 0 && (
            <div className="text-sm text-gray-500">
              <span className="font-medium text-xs text-gray-600">Children: </span>
              {row.numberOfChildren}
              {row.childrenNames && ` (${row.childrenNames})`}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Travel & Accommodation",
      accessor: (row: any) => {
        // Get travel mode icon
        const getTravelIcon = (mode: string) => {
          if (!mode) return null;
          
          switch (mode?.toLowerCase()) {
            case 'flight':
              return <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
            case 'car':
            case 'taxi':
              return <Car className="h-3 w-3 mr-1" />;
            case 'train':
              return <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>;
            default:
              return <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
          }
        };
        
        return (
          <div className="space-y-2 text-xs">
            {row.travelMode && (
              <div>
                <div className="flex items-center text-gray-700">
                  {getTravelIcon(row.travelMode)}
                  <span>{row.travelMode}</span>
                  {row.needsTransportation && (
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-200 text-xs">
                      Needs Pickup
                    </Badge>
                  )}
                </div>
                
                {row.arrivalDate && (
                  <div className="ml-4 mt-1 text-gray-500">
                    Arrival: {formatDate(row.arrivalDate)}
                    {row.arrivalTime && ` at ${row.arrivalTime}`}
                  </div>
                )}
                
                {row.departureDate && (
                  <div className="ml-4 text-gray-500">
                    Departure: {formatDate(row.departureDate)}
                    {row.departureTime && ` at ${row.departureTime}`}
                  </div>
                )}
              </div>
            )}
            
            {row.accommodationStatus && (
              <div className="flex items-center text-gray-700">
                <Bed className="h-3 w-3 mr-1" />
                <span className="capitalize">{row.accommodationStatus}</span>
                {row.roomNumber && <span className="ml-1">- Room {row.roomNumber}</span>}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Special Requests",
      accessor: (row: any) => (
        <div className="max-w-[150px] text-xs text-gray-600">
          {row.dietaryRestrictions && (
            <div className="mb-1">
              <span className="font-medium">Dietary: </span>
              {row.dietaryRestrictions}
            </div>
          )}
          
          {row.accessibilityNeeds && (
            <div className="mb-1">
              <span className="font-medium">Accessibility: </span>
              {row.accessibilityNeeds}
            </div>
          )}
          
          {row.specialRequests && (
            <div className="mb-1">
              <span className="font-medium">Requests: </span>
              {row.specialRequests}
            </div>
          )}
          
          {(!row.dietaryRestrictions && !row.accessibilityNeeds && !row.specialRequests) && (
            <span className="text-gray-400 italic">None specified</span>
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
