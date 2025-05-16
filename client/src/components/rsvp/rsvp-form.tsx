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
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { post } from "@/lib/api-utils"; // Using the new consolidated API utilities

// Note: This component is being deprecated in favor of TwoStageRsvpForm
// which properly handles the two-stage RSVP process with strongly typed forms

interface RsvpFormProps {
  eventId: number;
  ceremonies: any[];
  mealOptions: any[];
  onSuccess?: (data: any) => void;
}

// Combined schema for the form
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  rsvpStatus: z.enum(["confirmed", "declined"]),
  plusOneName: z.string().optional(),
  message: z.string().optional(),
  ceremonies: z.record(z.string(), z.boolean()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RsvpForm({ eventId, ceremonies, mealOptions, onSuccess }: RsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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

  // Get form values for conditional rendering
  const rsvpStatus = form.watch("rsvpStatus");

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Submit basic RSVP information
      const response = await post("/api/rsvp/submit", {
        eventId,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        rsvpStatus: values.rsvpStatus,
        plusOneName: values.plusOneName,
        message: values.message,
        ceremonies: values.ceremonies
      });
      
      // Show success message
      toast({
        title: "RSVP Submitted",
        description: values.rsvpStatus === "confirmed" 
          ? "Thank you for confirming your attendance. We look forward to celebrating with you!"
          : "We're sorry you can't make it. Thank you for letting us know.",
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response.data);
      }
      
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
    <div className="space-y-8">
      <div className="bg-muted p-6 rounded-md mb-4">
        <h2 className="text-lg font-medium">⚠️ Component is Deprecated</h2>
        <p className="mt-2 text-muted-foreground">
          Please use the new <code>TwoStageRsvpForm</code> component for all RSVP flows.
          The new implementation properly handles the two-stage RSVP process with proper typing and form validation.
        </p>
      </div>
      
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
              )}
            </CardContent>
          </Card>
          
          {/* Ceremonies Selection */}
          {rsvpStatus === "confirmed" && ceremonies && ceremonies.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 font-playfair">Ceremony Attendance</h3>
                <p className="text-muted-foreground mb-4">Please select which ceremonies you plan to attend:</p>
                
                <div className="space-y-4">
                  {ceremonies.map((ceremony: any) => (
                    <FormField
                      key={ceremony.id}
                      control={form.control}
                      name={`ceremonies.${ceremony.id}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {ceremony.name} - {new Date(ceremony.date).toLocaleDateString()}
                            </FormLabel>
                            <FormDescription>
                              {ceremony.location} - {ceremony.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Message */}
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
                        placeholder="Write a message for the couple..."
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
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit RSVP"}
          </Button>
        </form>
      </Form>
    </div>
  );
}