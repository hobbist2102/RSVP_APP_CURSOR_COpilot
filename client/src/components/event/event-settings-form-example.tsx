/**
 * Example Form Component using standardized validation schemas
 * This demonstrates how to use centralized validation schemas
 */
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-utils";

// Import validation schemas
import {
  eventBasicInfoSchema,
  guestManagementSchema,
  emailConfigSchema,
  whatsappConfigSchema,
  type EventBasicInfo,
  type GuestManagementSettings,
  type EmailConfig,
  type WhatsappConfig
} from "@shared/validation-schemas";

// Create combined schema for this form
const eventSettingsSchema = z.object({
  basicInfo: eventBasicInfoSchema,
  guestManagement: guestManagementSchema,
  communications: z.object({
    ...emailConfigSchema.shape,
    ...whatsappConfigSchema.shape,
  }),
});

// Define type for form data
type EventSettingsFormData = z.infer<typeof eventSettingsSchema>;

interface EventSettingsFormProps {
  eventId: number;
  initialData?: Partial<EventSettingsFormData>;
  onSuccess?: (data: EventSettingsFormData) => void;
}

export default function EventSettingsFormExample({ 
  eventId, 
  initialData,
  onSuccess
}: EventSettingsFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("basicInfo");
  
  // Initialize form with default values
  const defaultValues: Partial<EventSettingsFormData> = {
    basicInfo: {
      title: "",
      coupleNames: "",
      brideName: "",
      groomName: "",
      startDate: "",
      endDate: "",
      location: "",
      description: "",
      ...initialData?.basicInfo
    },
    guestManagement: {
      allowPlusOnes: true,
      allowChildrenDetails: true,
      rsvpDeadline: "",
      ...initialData?.guestManagement
    },
    communications: {
      emailFrom: "",
      emailReplyTo: "",
      sendRsvpReminders: true,
      sendRsvpConfirmations: true,
      sendTravelUpdates: true,
      enableWhatsapp: false,
      whatsappBusinessNumber: "",
      ...initialData?.communications
    }
  };
  
  // Initialize form with zod resolver
  const form = useForm<EventSettingsFormData>({
    resolver: zodResolver(eventSettingsSchema),
    defaultValues,
    mode: "onChange",
  });
  
  // Handle form submission
  const onSubmit = async (data: EventSettingsFormData) => {
    try {
      // Submit form data to API
      await apiRequest({
        method: "PATCH",
        url: `/api/events/${eventId}/settings`,
        data,
      });
      
      toast({
        title: "Settings updated",
        description: "Event settings have been saved successfully.",
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: error instanceof Error 
          ? error.message 
          : "An error occurred while saving settings.",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl">
            <TabsTrigger value="basicInfo">
              Basic Information
            </TabsTrigger>
            <TabsTrigger value="guestManagement">
              Guest Management
            </TabsTrigger>
            <TabsTrigger value="communications">
              Communications
            </TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basicInfo">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="basicInfo.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Wedding Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="basicInfo.brideName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bride's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bride's Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="basicInfo.groomName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groom's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Groom's Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="basicInfo.coupleNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couple Names (for display)</FormLabel>
                      <FormControl>
                        <Input placeholder="Couple Names" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="basicInfo.startDate"
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
                    control={form.control}
                    name="basicInfo.endDate"
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
                  control={form.control}
                  name="basicInfo.location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Wedding Location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="basicInfo.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your wedding event..." 
                          className="min-h-24" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Guest Management Tab */}
          <TabsContent value="guestManagement">
            <Card>
              <CardHeader>
                <CardTitle>Guest Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="guestManagement.allowPlusOnes"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow Plus Ones
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Guests can bring a partner to the wedding
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="guestManagement.allowChildrenDetails"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow Children Details
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Collect information about guests' children
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="guestManagement.rsvpDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RSVP Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Communications Tab */}
          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <CardTitle>Communications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="communications.emailFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email From</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@example.com" 
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="communications.emailReplyTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reply-To Email (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="replyto@example.com" 
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="communications.sendRsvpReminders"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Send RSVP Reminders
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Send reminder emails for RSVP completion
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="communications.sendRsvpConfirmations"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Send RSVP Confirmations
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Send confirmation emails after RSVP submission
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="communications.enableWhatsapp"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enable WhatsApp
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Use WhatsApp for guest communications
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("communications.enableWhatsapp") && (
                  <FormField
                    control={form.control}
                    name="communications.whatsappBusinessNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Business Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1234567890" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </Form>
  );
}