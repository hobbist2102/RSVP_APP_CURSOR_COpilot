import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2, Calendar, MapPin, Clock, Plus, Trash2 } from "lucide-react";
import { WeddingEvent } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

// Define schema for a venue
const venueSchema = z.object({
  name: z.string().min(2, {
    message: "Venue name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  description: z.string().optional(),
  date: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Date must be a valid date",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Start time must be in format HH:MM",
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "End time must be in format HH:MM",
  }),
  attireCode: z.string().optional(),
});

// Define schema for venues array
const venuesSchema = z.object({
  venues: z.array(venueSchema).min(1, {
    message: "At least one venue is required",
  }),
});

type VenueData = z.infer<typeof venueSchema>;
type VenuesData = z.infer<typeof venuesSchema>;

interface VenuesStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: VenuesData) => void;
  isCompleted: boolean;
}

export default function VenuesStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted,
}: VenuesStepProps) {
  // Fetch existing venues
  const { 
    data: existingVenues, 
    isLoading: isLoadingVenues 
  } = useQuery({
    queryKey: [`/api/events/${eventId}/venues`],
    enabled: !!eventId,
  });

  // State for venues list (to allow adding/removing dynamically)
  const [venues, setVenues] = useState<VenueData[]>(
    existingVenues?.length > 0 
      ? existingVenues 
      : [{
          name: "",
          location: "",
          description: "",
          date: currentEvent?.startDate || new Date().toISOString().split('T')[0],
          startTime: "10:00",
          endTime: "12:00",
          attireCode: "",
        }]
  );

  // Create form
  const form = useForm<VenuesData>({
    resolver: zodResolver(venuesSchema),
    defaultValues: {
      venues: venues,
    },
  });

  // Add venue handler
  const addVenue = () => {
    const newVenues = [...venues];
    newVenues.push({
      name: "",
      location: "",
      description: "",
      date: currentEvent?.startDate || new Date().toISOString().split('T')[0],
      startTime: "10:00",
      endTime: "12:00",
      attireCode: "",
    });
    setVenues(newVenues);
    form.setValue("venues", newVenues);
  };

  // Remove venue handler
  const removeVenue = (index: number) => {
    if (venues.length > 1) {
      const newVenues = [...venues];
      newVenues.splice(index, 1);
      setVenues(newVenues);
      form.setValue("venues", newVenues);
    }
  };

  // Submit handler
  function onSubmit(data: VenuesData) {
    onComplete(data);
  }

  if (isLoadingVenues) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading venues...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {venues.map((venue, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-muted/50 py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Venue {index + 1}
                  </CardTitle>
                  {venues.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVenue(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`venues.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Grand Hyatt Ballroom" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`venues.${index}.location`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="e.g., 123 Wedding Blvd, Mumbai" 
                                className="pl-9" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`venues.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the venue and ceremony..." 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`venues.${index}.date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="date" 
                                className="pl-9" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`venues.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="time" 
                                  className="pl-9" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`venues.${index}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="time" 
                                  className="pl-9" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`venues.${index}.attireCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attire Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Formal, Traditional Indian, Casual" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Suggested attire for this ceremony
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full mt-2"
            onClick={addVenue}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Another Venue
          </Button>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting || isCompleted}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isCompleted ? (
              "Completed"
            ) : (
              "Complete & Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}