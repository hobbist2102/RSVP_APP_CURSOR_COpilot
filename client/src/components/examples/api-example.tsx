/**
 * Example component showcasing the standardized API utilities
 * This demonstrates patterns for API interaction in a component
 */
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Loader2, Send, Plus, RefreshCw, Trash } from "lucide-react";
import { useEventManagement } from "@/hooks/use-api-example";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Event form schema using Zod
const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  coupleNames: z.string().min(1, "Couple names are required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function ApiExample() {
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");

  // Use our custom hook that leverages the API utilities
  const {
    events,
    isLoadingEvents,
    event,
    isLoadingEvent,
    createEvent,
    isCreatingEvent,
    updateEvent,
    isUpdatingEvent,
    deleteEvent,
    isDeletingEvent,
    sendTestEmail,
    isSendingTestEmail
  } = useEventManagement(selectedEventId);

  // Form for creating a new event
  const createForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      coupleNames: "",
      startDate: "",
      endDate: "",
      location: "",
      description: ""
    }
  });

  // Form for editing an event
  const editForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      coupleNames: event?.coupleNames || "",
      startDate: event?.startDate || "",
      endDate: event?.endDate || "",
      location: event?.location || "",
      description: event?.description || ""
    }
  });

  // Update edit form when selected event changes
  React.useEffect(() => {
    if (event) {
      editForm.reset({
        title: event.title,
        coupleNames: event.coupleNames,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        description: event.description || ""
      });
    }
  }, [event, editForm]);

  // Handle create event form submission
  const onCreateSubmit = (data: EventFormValues) => {
    createEvent(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      }
    });
  };

  // Handle edit event form submission
  const onEditSubmit = (data: EventFormValues) => {
    if (selectedEventId) {
      updateEvent({
        id: selectedEventId,
        data
      }, {
        onSuccess: () => {
          setIsEditDialogOpen(false);
        }
      });
    }
  };

  // Handle delete event
  const onDeleteConfirm = () => {
    if (selectedEventId) {
      deleteEvent(selectedEventId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedEventId(undefined);
        }
      });
    }
  };

  // Handle send test email
  const onSendTestEmail = () => {
    if (selectedEventId && testEmailAddress) {
      sendTestEmail({
        eventId: selectedEventId,
        email: testEmailAddress
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Event Management API Example</CardTitle>
          <CardDescription>
            This example demonstrates the standardized API utilities in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Events</h3>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new wedding event
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Wedding Event Title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="coupleNames"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Couple Names</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="John & Jane" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={createForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Event Location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Event Description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isCreatingEvent}>
                          {isCreatingEvent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Event
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            {isLoadingEvents ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events && events.length > 0 ? (
              <div className="divide-y">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className={`py-4 px-2 cursor-pointer hover:bg-muted/50 transition-colors rounded ${
                      selectedEventId === event.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.coupleNames}</p>
                        <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{event.startDate} to {event.endDate}</span>
                          <span>•</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                      {selectedEventId === event.id && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No events found. Create your first event to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {selectedEventId && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Event Details</CardTitle>
            <CardDescription>Manage the selected event</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEvent ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : event ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Title</Label>
                    <p className="font-medium">{event.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Couple</Label>
                    <p className="font-medium">{event.coupleNames}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <p className="font-medium">{event.startDate}</p>
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <p className="font-medium">{event.endDate}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs">Location</Label>
                  <p className="font-medium">{event.location}</p>
                </div>
                
                {event.description && (
                  <div>
                    <Label className="text-xs">Description</Label>
                    <p className="text-sm">{event.description}</p>
                  </div>
                )}
                
                <div className="border-t pt-4 mt-6">
                  <h4 className="font-medium mb-3">Send Test Email</h4>
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                    />
                    <Button 
                      disabled={!testEmailAddress || isSendingTestEmail}
                      onClick={onSendTestEmail}
                      className="flex gap-2 items-center whitespace-nowrap"
                    >
                      {isSendingTestEmail ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Event details not available.
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the details of the selected event
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="coupleNames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couple Names</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingEvent}>
                  {isUpdatingEvent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDeleteConfirm} 
              disabled={isDeletingEvent}
            >
              {isDeletingEvent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}