import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, getInitials } from "@/lib/utils";
import { Phone, Mail, MapPin, Calendar, Utensils, Car, Bed, Gift, FileText } from "lucide-react";

interface GuestDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  guest: any;
  onEdit: (guestId: number) => void;
}

export default function GuestDetailDialog({
  isOpen,
  onClose,
  guest,
  onEdit,
}: GuestDetailDialogProps) {
  if (!guest) return null;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Confirmed</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Declined</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Guest Details {getStatusBadge(guest.rsvpStatus)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4">
          <Avatar className="h-16 w-16 text-lg bg-primary">
            <AvatarFallback>{getInitials(`${guest.firstName} ${guest.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold font-playfair">
              {guest.firstName} {guest.lastName}
            </h2>
            <p className="text-muted-foreground">{guest.relationship || "Guest"}</p>
          </div>
        </div>

        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="rsvp">RSVP</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="space-y-2">
              {guest.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{guest.email}</span>
                </div>
              )}
              
              {guest.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{guest.phone}</span>
                </div>
              )}
              
              {guest.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span>{guest.address}</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Family Member</p>
                <p>{guest.isFamily ? "Yes" : "No"}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p>{formatDate(guest.createdAt)}</p>
              </div>
            </div>
            
            {guest.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center">
                    <FileText className="h-4 w-4 mr-1" /> Notes
                  </p>
                  <p className="text-sm">{guest.notes}</p>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="rsvp" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">RSVP Status</p>
                <p className="capitalize">{guest.rsvpStatus}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Table Assignment</p>
                <p>{guest.tableAssignment || "Not assigned"}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Plus One Allowed</p>
                <p>{guest.plusOneAllowed ? "Yes" : "No"}</p>
              </div>
              
              {guest.plusOneAllowed && (
                <div>
                  <p className="text-sm text-muted-foreground">Plus One Name</p>
                  <p>{guest.plusOneName || "Not specified"}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Number of Children</p>
                <p>{guest.numberOfChildren}</p>
              </div>
              
              {guest.numberOfChildren > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Children Names</p>
                  <p>{guest.childrenNames || "Not specified"}</p>
                </div>
              )}
            </div>
            
            {guest.dietaryRestrictions && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center">
                    <Utensils className="h-4 w-4 mr-1" /> Dietary Restrictions
                  </p>
                  <p className="text-sm">{guest.dietaryRestrictions}</p>
                </div>
              </>
            )}
            
            {guest.giftTracking && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center">
                    <Gift className="h-4 w-4 mr-1" /> Gift Tracking
                  </p>
                  <p className="text-sm">{guest.giftTracking}</p>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="events" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> Event Attendance
            </p>
            
            {guest.ceremonies ? (
              <div className="space-y-2">
                {guest.ceremonies.map((ceremony: any) => (
                  <div key={ceremony.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{ceremony.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(ceremony.date)} | {ceremony.startTime} - {ceremony.endTime}
                        </p>
                        <p className="text-sm text-muted-foreground">{ceremony.location}</p>
                      </div>
                      <Badge variant={ceremony.attending ? "default" : "outline"}>
                        {ceremony.attending ? "Attending" : "Not Attending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm">No ceremony attendance information available</p>
            )}
          </TabsContent>
          
          <TabsContent value="logistics" className="space-y-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center mb-2">
                <Car className="h-4 w-4 mr-1" /> Travel Information
              </p>
              
              {guest.travel ? (
                <div className="p-3 border rounded-md space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Travel Mode</p>
                      <p className="capitalize">{guest.travel.travelMode || "Not specified"}</p>
                    </div>
                    
                    {guest.travel.flightNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">Flight Number</p>
                        <p>{guest.travel.flightNumber}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Arrival</p>
                      <p>
                        {guest.travel.arrivalDate ? formatDate(guest.travel.arrivalDate) : "Not specified"}
                        {guest.travel.arrivalTime ? ` at ${guest.travel.arrivalTime}` : ""}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Departure</p>
                      <p>
                        {guest.travel.departureDate ? formatDate(guest.travel.departureDate) : "Not specified"}
                        {guest.travel.departureTime ? ` at ${guest.travel.departureTime}` : ""}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Needs Transportation</p>
                      <p>{guest.travel.needsTransportation ? "Yes" : "No"}</p>
                    </div>
                    
                    {guest.travel.needsTransportation && (
                      <div>
                        <p className="text-sm text-muted-foreground">Transportation Type</p>
                        <p className="capitalize">{guest.travel.transportationType || "Not specified"}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm">No travel information available</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground flex items-center mb-2">
                <Bed className="h-4 w-4 mr-1" /> Accommodation
              </p>
              
              {guest.accommodation ? (
                <div className="p-3 border rounded-md space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Hotel</p>
                      <p>{guest.accommodation.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Room Type</p>
                      <p>{guest.accommodation.roomType}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Room Number</p>
                      <p>{guest.accommodation.roomNumber || "Not assigned"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Check-in/Check-out</p>
                      <p>
                        {guest.accommodation.checkIn ? formatDate(guest.accommodation.checkIn) : "TBD"} - {" "}
                        {guest.accommodation.checkOut ? formatDate(guest.accommodation.checkOut) : "TBD"}
                      </p>
                    </div>
                  </div>
                  
                  {guest.accommodation.specialRequests && (
                    <div>
                      <p className="text-sm text-muted-foreground">Special Requests</p>
                      <p className="text-sm">{guest.accommodation.specialRequests}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm">No accommodation information available</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => onEdit(guest.id)} className="gold-gradient">Edit Guest</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
