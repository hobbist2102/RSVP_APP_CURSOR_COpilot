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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Calendar, Clock, Luggage, Home, Car, Plane } from "lucide-react";

interface TwoStageRsvpFormProps {
  eventId: number;
  ceremonies: any[];
  mealOptions: any[];
  onSuccess?: (data: any) => void;
}

// Stage 1 schema - Basic attendance
const stage1Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  rsvpStatus: z.enum(["confirmed", "declined"]),
  plusOneName: z.string().optional(),
  message: z.string().optional(),
  ceremonies: z.record(z.string(), z.boolean()).optional(),
});

// Stage 2 schema - Travel & accommodations
const stage2Schema = z.object({
  // Children information
  numberOfChildren: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0).max(10)
  ),
  childrenNames: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  
  // Meal selections
  mealSelections: z.record(z.string(), z.string()).optional(),
  
  // Accommodation details
  needsAccommodation: z.boolean().default(false),
  accommodationPreference: z.enum(['provided', 'self_managed', 'special_arrangement']).optional(),
  accommodationNotes: z.string().optional(),
  
  // Transportation details
  needsTransportation: z.boolean().default(false),
  transportationPreference: z.enum(['provided', 'self_managed', 'special_arrangement']).optional(),
  transportationNotes: z.string().optional(),
  
  // Travel details
  travelMode: z.enum(['air', 'train', 'bus', 'car', 'other']).optional(),
  arrivalDate: z.string().optional(),
  arrivalTime: z.string().optional(),
  departureDate: z.string().optional(),
  departureTime: z.string().optional(),
  
  // Additional details
  specialRequests: z.string().optional(),
});

type Stage1Values = z.infer<typeof stage1Schema>;
type Stage2Values = z.infer<typeof stage2Schema>;

export default function TwoStageRsvpForm({ eventId, ceremonies, mealOptions, onSuccess }: TwoStageRsvpFormProps) {
  const [currentStage, setCurrentStage] = useState<"stage1" | "stage2">("stage1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestData, setGuestData] = useState<any>(null);
  const { toast } = useToast();
  
  // Create forms for each stage
  const stage1Form = useForm<Stage1Values>({
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
  
  const stage2Form = useForm<Stage2Values>({
    resolver: zodResolver(stage2Schema),
    defaultValues: {
      numberOfChildren: 0,
      childrenNames: "",
      dietaryRestrictions: "",
      mealSelections: {},
      needsAccommodation: false,
      needsTransportation: false,
      travelMode: "car",
      arrivalDate: "",
      arrivalTime: "",
      departureDate: "",
      departureTime: "",
      specialRequests: "",
    },
  });
  
  // Watch necessary form values
  const rsvpStatus = stage1Form.watch("rsvpStatus");
  const needsAccommodation = stage2Form.watch("needsAccommodation");
  const needsTransportation = stage2Form.watch("needsTransportation");
  const travelMode = stage2Form.watch("travelMode");
  const numberOfChildren = stage2Form.watch("numberOfChildren");
  
  // Handle Stage 1 submission (basic attendance)
  const handleStage1Submit = async (values: Stage1Values) => {
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
  const handleStage2Submit = async (values: Stage2Values) => {
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

  return (
    <div className="space-y-8">
      {/* Progress indicator - only shown for confirmed attendance */}
      {rsvpStatus === "confirmed" && (
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStage === "stage1" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-muted-foreground text-muted-foreground"}`}>
            1
          </div>
          <div className="h-1 w-16 bg-muted">
            <div className={`h-full ${currentStage === "stage2" ? "bg-primary" : ""}`} style={{ width: currentStage === "stage1" ? "0%" : "100%" }}></div>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStage === "stage2" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-muted-foreground text-muted-foreground"}`}>
            2
          </div>
        </div>
      )}
      
      {/* Stage labels */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">
          {currentStage === "stage1" 
            ? "Confirm Your Attendance" 
            : "Travel & Accommodation Details"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {currentStage === "stage1" 
            ? "Please let us know if you'll be able to join us" 
            : "Help us plan your stay and travel arrangements"}
        </p>
      </div>
      
      {/* Stage 1: Basic RSVP form */}
      {currentStage === "stage1" ? (
        <Form {...stage1Form}>
          <form onSubmit={stage1Form.handleSubmit(handleStage1Submit)} className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Your Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={stage1Form.control}
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
                      control={stage1Form.control}
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
                      control={stage1Form.control}
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
                <h3 className="text-lg font-medium mb-4">RSVP Response</h3>
                
                <FormField
                  control={stage1Form.control}
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
                            <FormLabel className="font-normal">
                              Yes, I will attend
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="declined" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              No, I cannot attend
                            </FormLabel>
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
                        control={stage1Form.control}
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
                    
                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-2">Events You Will Attend</h4>
                      
                      {ceremonies.map((ceremony) => (
                        <FormField
                          key={ceremony.id}
                          control={stage1Form.control}
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
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Message</h3>
                
                <FormField
                  control={stage1Form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message to the Couple (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your message here..."
                          className="min-h-[100px]"
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
              className="w-full py-6 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : rsvpStatus === "confirmed" ? (
                <span className="flex items-center">
                  Continue to Travel Details <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              ) : (
                "Submit RSVP"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        // Stage 2: Travel & Accommodation form
        <Form {...stage2Form}>
          <form onSubmit={stage2Form.handleSubmit(handleStage2Submit)} className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Home className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">Accommodation</h3>
                </div>
                
                <FormField
                  control={stage2Form.control}
                  name="needsAccommodation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-base">
                          I need accommodation arrangements
                        </FormLabel>
                        <FormDescription>
                          Let us know if you need help with stay arrangements
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {needsAccommodation && (
                  <div className="ml-7 mt-2 space-y-4">
                    <FormField
                      control={stage2Form.control}
                      name="accommodationPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accommodation Preference</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="provided">Venue-provided accommodation</SelectItem>
                              <SelectItem value="self_managed">I'll arrange my own stay</SelectItem>
                              <SelectItem value="special_arrangement">Need special arrangements</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={stage2Form.control}
                      name="accommodationNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any specific requirements or preferences for your stay..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Luggage className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">Transportation</h3>
                </div>
                
                <FormField
                  control={stage2Form.control}
                  name="needsTransportation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-base">
                          I need local transportation
                        </FormLabel>
                        <FormDescription>
                          We can arrange local transportation during your stay
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {needsTransportation && (
                  <div className="ml-7 mt-2 space-y-4">
                    <FormField
                      control={stage2Form.control}
                      name="transportationPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transportation Preference</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="provided">Event-provided transportation</SelectItem>
                              <SelectItem value="self_managed">I'll arrange my own transportation</SelectItem>
                              <SelectItem value="special_arrangement">Need special arrangements</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={stage2Form.control}
                      name="transportationNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any specific requirements for transportation..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Plane className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">Travel Details</h3>
                </div>
                
                <FormField
                  control={stage2Form.control}
                  name="travelMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How will you be traveling?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select travel mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="air">Airplane</SelectItem>
                          <SelectItem value="train">Train</SelectItem>
                          <SelectItem value="bus">Bus</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This helps us coordinate arrivals and departures
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" /> Arrival
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={stage2Form.control}
                        name="arrivalDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={stage2Form.control}
                        name="arrivalTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" /> Departure
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={stage2Form.control}
                        name="departureDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={stage2Form.control}
                        name="departureTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={stage2Form.control}
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
                      control={stage2Form.control}
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
                    control={stage2Form.control}
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
                              control={stage2Form.control}
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
                
                <div className="mt-4">
                  <FormField
                    control={stage2Form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information or special requests..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setCurrentStage("stage1")}
                className="px-6"
              >
                Back to Basic RSVP
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6"
              >
                {isSubmitting ? "Submitting..." : "Complete RSVP"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}