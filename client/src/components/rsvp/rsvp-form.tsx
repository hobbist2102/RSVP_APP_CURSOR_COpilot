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

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  rsvpStatus: z.enum(["confirmed", "declined"]),
  plusOneName: z.string().optional(),
  numberOfChildren: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0).max(10)
  ),
  childrenNames: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  message: z.string().optional(),
  ceremonies: z.record(z.string(), z.boolean()).optional(),
  mealSelections: z.record(z.string(), z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RsvpForm({ eventId, ceremonies, mealOptions, onSuccess }: RsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      rsvpStatus: "confirmed",
      plusOneName: "",
      numberOfChildren: 0,
      childrenNames: "",
      dietaryRestrictions: "",
      message: "",
      ceremonies: {},
      mealSelections: {},
    },
  });
  
  const rsvpStatus = form.watch("rsvpStatus");
  const numberOfChildren = form.watch("numberOfChildren");
  
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Submit RSVP
      const rsvpResponse = await apiRequest("POST", "/api/rsvp", {
        eventId,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        rsvpStatus: values.rsvpStatus,
        plusOneName: values.plusOneName,
        numberOfChildren: values.numberOfChildren,
        childrenNames: values.childrenNames,
        dietaryRestrictions: values.dietaryRestrictions,
        message: values.message,
      });
      
      const rsvpData = await rsvpResponse.json();
      
      // If declined, we're done
      if (values.rsvpStatus === "declined") {
        toast({
          title: "RSVP Submitted",
          description: "We're sorry you can't make it. Thank you for letting us know.",
        });
        
        if (onSuccess) onSuccess(rsvpData);
        return;
      }
      
      // Otherwise, handle ceremony attendance and meal selections
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
      
      // Submit meal selections
      if (values.mealSelections) {
        const mealPromises = Object.entries(values.mealSelections)
          .filter(([_, mealId]) => mealId)
          .map(([ceremonyId, mealOptionId]) => 
            apiRequest("POST", `/api/guests/${guestId}/meal-selections`, {
              ceremonyId: parseInt(ceremonyId),
              mealOptionId: parseInt(mealOptionId as string),
            })
          );
        
        await Promise.all(mealPromises);
      }
      
      toast({
        title: "RSVP Submitted",
        description: "Thank you for your response. We look forward to celebrating with you!",
      });
      
      if (onSuccess) onSuccess(rsvpData);
    } catch (error) {
      console.error("RSVP submission error:", error);
      toast({
        variant: "destructive",
        title: "RSVP Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting your RSVP.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
