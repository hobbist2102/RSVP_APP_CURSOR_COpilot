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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RsvpStage1FormProps {
  eventId: number;
  guestId: number;
  defaultValues?: Partial<FormValues>;
  ceremonies: any[];
  onSuccess?: (data: any) => void;
  onProceedToStage2?: (data: any) => void;
}

const formSchema = z.object({
  guestId: z.number(),
  eventId: z.number(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  rsvpStatus: z.enum(["confirmed", "declined"], {
    required_error: "Please select whether you'll attend",
  }),
  isLocalGuest: z.boolean().optional().default(false),
  plusOneAttending: z.boolean().optional(),
  plusOneName: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  allergies: z.string().optional(),
  ceremonies: z.array(z.object({
    ceremonyId: z.number(),
    attending: z.boolean(),
  })).optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RsvpStage1Form({ 
  eventId, 
  guestId, 
  defaultValues, 
  ceremonies, 
  onSuccess, 
  onProceedToStage2 
}: RsvpStage1FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestId,
      eventId,
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      rsvpStatus: defaultValues?.rsvpStatus || "confirmed",
      isLocalGuest: defaultValues?.isLocalGuest || false,
      plusOneAttending: defaultValues?.plusOneAttending || false,
      plusOneName: defaultValues?.plusOneName || "",
      dietaryRestrictions: defaultValues?.dietaryRestrictions || "",
      allergies: defaultValues?.allergies || "",
      ceremonies: defaultValues?.ceremonies || [],
      message: defaultValues?.message || "",
    },
  });
  
  const rsvpStatus = form.watch("rsvpStatus");
  const plusOneAttending = form.watch("plusOneAttending");
  const isLocalGuest = form.watch("isLocalGuest");
  
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Submit RSVP Stage 1
      const rsvpResponse = await apiRequest("POST", "/api/rsvp/stage1", values);
      
      const data = await rsvpResponse.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to submit RSVP");
      }
      
      toast({
        title: "RSVP Submitted",
        description: data.requiresStage2 
          ? "Thank you! We'll now need some travel details from you." 
          : "Thank you for your response!",
      });
      
      // If Stage 2 is required and callback is provided, trigger it
      if (data.requiresStage2 && onProceedToStage2) {
        onProceedToStage2(data);
        return;
      }
      
      // Otherwise call the success callback if provided
      if (onSuccess) {
        onSuccess(data);
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

  // Create a formatted array of ceremony objects for the form
  const ceremonyFields = ceremonies.map(ceremony => {
    const existingSelection = form.getValues().ceremonies?.find(
      c => c.ceremonyId === ceremony.id
    );
    
    return {
      ceremonyId: ceremony.id,
      attending: existingSelection?.attending || false,
      name: ceremony.name,
      date: ceremony.date,
      startTime: ceremony.startTime,
      endTime: ceremony.endTime,
      location: ceremony.location
    };
  });
  
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
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional, for WhatsApp updates
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
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="isLocalGuest"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I live locally (within 50km of the venue)
                          </FormLabel>
                          <FormDescription>
                            This helps us plan transportation and accommodation
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="plusOneAttending"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I'm bringing a plus one/partner
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                {plusOneAttending && (
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="plusOneName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plus One Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                <div className="mt-6">
                  <h4 className="text-md font-medium mb-2">Events You Will Attend</h4>
                  
                  {ceremonyFields.map((ceremony, index) => (
                    <div key={ceremony.ceremonyId} className="mb-4">
                      <FormField
                        control={form.control}
                        name={`ceremonies.${index}.attending`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
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
                      <input 
                        type="hidden" 
                        {...form.register(`ceremonies.${index}.ceremonyId` as const, {
                          valueAsNumber: true
                        })}
                        value={ceremony.ceremonyId} 
                      />
                    </div>
                  ))}
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
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Submitting...
            </>
          ) : rsvpStatus === "confirmed" && !isLocalGuest ? (
            "Next: Travel Details"
          ) : (
            "Submit RSVP"
          )}
        </Button>
      </form>
    </Form>
  );
}