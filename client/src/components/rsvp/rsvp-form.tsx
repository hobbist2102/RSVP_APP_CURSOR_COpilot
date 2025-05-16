import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RsvpFormProps {
  eventId: number;
  ceremonies: any[];
  mealOptions: any[];
  onSuccess?: (data: any) => void;
}

// Basic attendance form (Stage 1)
const stage1Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  rsvpStatus: z.enum(["confirmed", "declined"]),
  plusOneName: z.string().optional(),
  message: z.string().optional(),
  ceremonies: z.record(z.string(), z.boolean()).optional(),
});

// Detailed travel and accommodation form (Stage 2)
const stage2Schema = z.object({
  numberOfChildren: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0).max(10)
  ),
  childrenNames: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  mealSelections: z.record(z.string(), z.string()).optional(),
  
  // Travel details
  needsAccommodation: z.boolean().optional(),
  accommodationPreference: z.enum(['provided', 'self_managed', 'special_arrangement']).optional(),
  accommodationNotes: z.string().optional(),
  
  // Transportation details
  needsTransportation: z.boolean().optional(),
  transportationPreference: z.enum(['provided', 'self_managed', 'special_arrangement']).optional(),
  transportationNotes: z.string().optional(),
  
  // Travel mode
  travelMode: z.enum(['air', 'train', 'bus', 'car', 'other']).optional(),
  
  // Arrival/departure
  arrivalDate: z.string().optional(),
  arrivalTime: z.string().optional(),
  departureDate: z.string().optional(),
  departureTime: z.string().optional(),
  
  // Additional details
  specialRequests: z.string().optional(),
});

// Combined schema for type definitions
const formSchema = z.object({
  // Stage 1 fields
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  rsvpStatus: z.enum(["confirmed", "declined"]),
  plusOneName: z.string().optional(),
  message: z.string().optional(),
  ceremonies: z.record(z.string(), z.boolean()).optional(),
  
  // Stage 2 fields
  numberOfChildren: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0).max(10)
  ),
  childrenNames: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  mealSelections: z.record(z.string(), z.string()).optional(),
  needsAccommodation: z.boolean().optional(),
  accommodationPreference: z.enum(['provided', 'self_managed', 'special_arrangement']).optional(),
  accommodationNotes: z.string().optional(),
  needsTransportation: z.boolean().optional(),
  transportationPreference: z.enum(['provided', 'self_managed', 'special_arrangement']).optional(),
  transportationNotes: z.string().optional(),
  travelMode: z.enum(['air', 'train', 'bus', 'car', 'other']).optional(),
  arrivalDate: z.string().optional(),
  arrivalTime: z.string().optional(),
  departureDate: z.string().optional(),
  departureTime: z.string().optional(),
  specialRequests: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RsvpForm({ eventId, ceremonies, mealOptions, onSuccess }: RsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStage, setCurrentStage] = useState<"stage1" | "stage2">("stage1");
  const [guestData, setGuestData] = useState<any>(null);
  const { toast } = useToast();
  
  // Create separate form for each stage
  const stage1Form = useForm<z.infer<typeof stage1Schema>>({
    resolver: zodResolver(stage1Schema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      rsvpStatus: "confirmed",
      plusOneName: "",
      message: "",
      ceremonies: {},
    },
  });
  
  const stage2Form = useForm<z.infer<typeof stage2Schema>>({
    resolver: zodResolver(stage2Schema),
    defaultValues: {
      numberOfChildren: 0,
      childrenNames: "",
      dietaryRestrictions: "",
      mealSelections: {},
      needsAccommodation: false,
      needsTransportation: false,
      travelMode: "car",
      specialRequests: "",
    },
  });
  
  // Create a reference to the current active form
  const form = currentStage === "stage1" ? stage1Form : stage2Form;
  
  // Get form values with proper type checking
  const rsvpStatus = currentStage === "stage1" ? stage1Form.watch("rsvpStatus") : "confirmed";
  const numberOfChildren = currentStage === "stage2" ? stage2Form.watch("numberOfChildren") : 0;
  
  // Handle Stage 1 submission (basic attendance)
  const handleStage1Submit = async (values: z.infer<typeof stage1Schema>) => {
    setIsSubmitting(true);
    
    try {
      // Submit basic RSVP information
      const rsvpResponse = await apiRequest("POST", "/api/rsvp/stage1", {
        eventId,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        rsvpStatus: values.rsvpStatus,
        plusOneName: values.plusOneName,
        message: values.message,
      });
      
      const rsvpData = await rsvpResponse.json();
      setGuestData(rsvpData.guest);
      
      // If declined, we're done
      if (values.rsvpStatus === "declined") {
        toast({
          title: "RSVP Submitted",
          description: "We're sorry you can't make it. Thank you for letting us know.",
        });
        
        if (onSuccess) onSuccess(rsvpData);
        return;
      }
      
      // Otherwise, handle ceremony attendance
      const guestId = rsvpData.guest.id;
      
      // Submit ceremony attendance
      if (values.ceremonies) {
        const attendancePromises = Object.entries(values.ceremonies)
          .filter(([_, isAttending]) => isAttending)
          .map(([ceremonyId]) => 
            apiRequest("POST", `/api/guests/${guestId}/attendance`, {
              ceremonyId: parseInt(ceremonyId),
              attending: true,
            })
          );
        
        await Promise.all(attendancePromises);
      }
      
      // Show success message for Stage 1
      toast({
        title: "Basic RSVP Submitted",
        description: "Thank you for confirming your attendance. Please complete the additional details.",
      });
      
      // Move to Stage 2 for detailed travel and accommodation information
      setCurrentStage("stage2");
      
    } catch (error) {
      console.error("RSVP Stage 1 submission error:", error);
      toast({
        variant: "destructive",
        title: "RSVP Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting your basic RSVP information.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle Stage 2 submission (travel and accommodation details)
  const handleStage2Submit = async (values: z.infer<typeof stage2Schema>) => {
    if (!guestData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing guest information. Please try again.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit detailed information
      const detailsResponse = await apiRequest("POST", "/api/rsvp/stage2", {
        guestId: guestData.id,
        eventId: eventId,
        
        // Children information
        numberOfChildren: values.numberOfChildren,
        childrenNames: values.childrenNames,
        dietaryRestrictions: values.dietaryRestrictions,
        
        // Accommodation and transportation details
        needsAccommodation: values.needsAccommodation,
        accommodationPreference: values.accommodationPreference,
        accommodationNotes: values.accommodationNotes,
        needsTransportation: values.needsTransportation,
        transportationPreference: values.transportationPreference,
        transportationNotes: values.transportationNotes,
        
        // Travel details
        travelMode: values.travelMode,
        arrivalDate: values.arrivalDate,
        arrivalTime: values.arrivalTime,
        departureDate: values.departureDate,
        departureTime: values.departureTime,
        specialRequests: values.specialRequests,
      });
      
      const detailsData = await detailsResponse.json();
      
      // Submit meal selections if any
      if (values.mealSelections && Object.keys(values.mealSelections).length > 0) {
        const mealPromises = Object.entries(values.mealSelections)
          .filter(([_, mealId]) => mealId)
          .map(([ceremonyId, mealOptionId]) => 
            apiRequest("POST", `/api/guests/${guestData.id}/meal-selections`, {
              ceremonyId: parseInt(ceremonyId),
              mealOptionId: parseInt(mealOptionId as string),
            })
          );
        
        await Promise.all(mealPromises);
      }
      
      // Show success message
      toast({
        title: "RSVP Complete",
        description: "Thank you for providing all your details. We look forward to celebrating with you!",
      });
      
      // Call the success callback with the combined data
      if (onSuccess) {
        const combinedData = {
          guest: guestData,
          details: detailsData,
        };
        onSuccess(combinedData);
      }
    } catch (error) {
      console.error("RSVP Stage 2 submission error:", error);
      toast({
        variant: "destructive",
        title: "Details Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting your travel and accommodation details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Combined handler that routes to the appropriate stage handler
  const handleSubmit = currentStage === "stage1" 
    ? handleStage1Submit 
    : handleStage2Submit;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4 font-playfair">Your Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please enter the email address your invitation was sent to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4 font-playfair">RSVP Response</h3>
            
            <FormField
              control={form.control}
              name="rsvpStatus"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Will you be attending?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="confirmed" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes, I will attend</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="declined" />
                        </FormControl>
                        <FormLabel className="font-normal">No, I cannot attend</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {rsvpStatus === "confirmed" && (
              <>
                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="plusOneName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plus One Name (if applicable)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Jane Doe" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank if you're coming alone
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numberOfChildren"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Children</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {numberOfChildren > 0 && (
                    <FormField
                      control={form.control}
                      name="childrenNames"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Children Names</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Emma, Jack" {...field} />
                          </FormControl>
                          <FormDescription>
                            Separate multiple names with commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="dietaryRestrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dietary Restrictions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please list any dietary restrictions or allergies..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-6">
                  <h4 className="text-md font-medium mb-2">Events You Will Attend</h4>
                  
                  {ceremonies.map((ceremony) => (
                    <FormField
                      key={ceremony.id}
                      control={form.control}
                      name={`ceremonies.${ceremony.id}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-base">
                              {ceremony.name} - {new Date(ceremony.date).toLocaleDateString()}
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              {ceremony.startTime} - {ceremony.endTime} | {ceremony.location}
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                
                {mealOptions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-2">Meal Preferences</h4>
                    
                    {/* Group meal options by ceremony */}
                    {ceremonies
                      .filter((ceremony) => mealOptions.some((meal) => meal.ceremonyId === ceremony.id))
                      .map((ceremony) => {
                        const ceremonyMealOptions = mealOptions.filter(
                          (meal) => meal.ceremonyId === ceremony.id
                        );
                        
                        return (
                          <div key={ceremony.id} className="mb-4">
                            <p className="text-sm font-medium mb-2">{ceremony.name}</p>
                            
                            <FormField
                              control={form.control}
                              name={`mealSelections.${ceremony.id}`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a meal option" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {ceremonyMealOptions.map((meal) => (
                                        <SelectItem key={meal.id} value={meal.id.toString()}>
                                          {meal.name} 
                                          {meal.isVegetarian && " (Vegetarian)"}
                                          {meal.isVegan && " (Vegan)"}
                                          {meal.isGlutenFree && " (Gluten Free)"}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4 font-playfair">Message for the Couple</h3>
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Send your wishes and congratulations to the couple..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Button 
          type="submit" 
          className="w-full gold-gradient text-white py-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit RSVP"}
        </Button>
      </form>
    </Form>
  );
}
