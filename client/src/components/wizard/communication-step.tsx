import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { WeddingEvent } from "@shared/schema";
import { 
  Check, 
  Mail, 
  MessageSquare, 
  Edit, 
  Plus, 
  Eye, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Trash
} from "lucide-react";
import { EMAIL_PROVIDERS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Template types with friendly names covering all communication needs
const templateTypes = [
  // RSVP Templates
  { id: "invitation", name: "Invitation", description: "Sent when inviting guests to your event", category: "RSVP" },
  { id: "rsvp_confirmation", name: "RSVP Confirmation", description: "Sent when guests confirm their attendance", category: "RSVP" },
  { id: "rsvp_declined", name: "RSVP Declined", description: "Sent when guests decline their attendance", category: "RSVP" },
  { id: "rsvp_pending", name: "RSVP Reminder", description: "Sent to remind guests who haven't completed their RSVP", category: "RSVP" },
  { id: "rsvp_maybe", name: "RSVP Maybe", description: "Sent to guests who aren't sure if they can attend", category: "RSVP" },
  
  // Accommodation Templates
  { id: "accommodation_confirmation", name: "Accommodation Confirmation", description: "Sent when accommodation is confirmed for guests", category: "Accommodation" },
  { id: "accommodation_details", name: "Accommodation Details", description: "Sent with hotel check-in details and information", category: "Accommodation" },
  { id: "accommodation_reminder", name: "Accommodation Reminder", description: "Reminder about accommodation arrangements", category: "Accommodation" },
  { id: "accommodation_waitlist", name: "Accommodation Waitlist", description: "Sent when guest is placed on accommodation waitlist", category: "Accommodation" },
  
  // Transport Templates
  { id: "transport_confirmation", name: "Transport Confirmation", description: "Sent when transport is confirmed for guests", category: "Transport" },
  { id: "transport_details", name: "Transport Details", description: "Sent with pickup times and transport information", category: "Transport" },
  { id: "transport_reminder", name: "Transport Reminder", description: "Reminder about transport arrangements", category: "Transport" },
  { id: "transport_schedule_change", name: "Transport Schedule Change", description: "Sent when transport schedule changes", category: "Transport" },
  
  // General Event Templates
  { id: "pre_event_reminder", name: "Pre-Event Reminder", description: "Sent a few days before the event", category: "General" },
  { id: "event_updates", name: "Event Updates", description: "Sent when there are important event updates", category: "General" },
  { id: "post_event_thanks", name: "Post-Event Thanks", description: "Sent after the event to thank guests", category: "General" },
];

// Form schema for template editing
const templateFormSchema = z.object({
  type: z.string(),
  emailSubject: z.string().min(1, "Email subject is required"),
  emailTemplate: z.string().min(1, "Email template is required"),
  whatsappTemplate: z.string().optional(),
  sendImmediately: z.boolean().default(true),
  scheduledDate: z.string().optional().nullable(),
  scheduledTime: z.string().optional().nullable(),
  enabled: z.boolean().default(true),
});

// Communication settings schema
const communicationSettingsSchema = z.object({
  emailFrom: z.string().email("Invalid email address").min(1, "Email address is required"),
  emailReplyTo: z.string().email("Invalid email address").optional(),
  whatsappNumber: z.string().min(10, "Phone number is required").optional(),
  useGmail: z.boolean().default(false),
  useOutlook: z.boolean().default(false),
  useSendGrid: z.boolean().default(false),
  gmailAccount: z.string().email("Invalid email address").optional(),
  outlookAccount: z.string().email("Invalid email address").optional(),
  sendGridApiKey: z.string().optional(),
});

interface EmailTemplate {
  id?: number;
  eventId?: number;
  type: string;
  emailTemplate: string;
  emailSubject: string;
  whatsappTemplate: string;
  sendImmediately: boolean;
  scheduledDate: string | null;
  scheduledTime: string | null;
  enabled: boolean;
  lastUpdated?: Date | null;
}

interface CommunicationStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: any) => void;
  isCompleted: boolean;
}

// Component for displaying template preview with personalized variables
function TemplatePreview({ 
  template,
  subject,
  templateType,
  event
}: { 
  template: string;
  subject?: string;
  templateType?: string;
  event?: any;
}) {
  // Define sample guest data based on template type
  const guestName = "John Smith";
  const firstName = "John";
  const lastName = "Smith";
  const coupleNames = event?.coupleNames || "Sarah & Michael";
  const eventName = event?.title || "Wedding Celebration";
  const rsvpStatus = templateType?.includes("confirmation") ? "confirmed" : 
                    templateType?.includes("declined") ? "declined" : 
                    templateType?.includes("maybe") ? "maybe" : "pending";
  const rsvpLink = `${window.location.origin}/guest-rsvp/example-token`;
  const rsvpDeadline = "June 15, 2025";

  // Apply template variables with support for fallback syntax
  let personalizedTemplate = template;
  
  // Process variables with || fallback syntax first
  personalizedTemplate = personalizedTemplate.replace(/{{(\w+)\s*\|\|\s*["']([^"']*)["']}}/g, (match, varName, fallback) => {
    switch (varName) {
      case 'first_name': return firstName;
      case 'last_name': return lastName;
      case 'guest_name': return guestName;
      case 'couple_names': return coupleNames;
      case 'event_name': return eventName;
      case 'rsvp_status': return rsvpStatus;
      case 'rsvp_link': return rsvpLink;
      case 'rsvp_deadline': return rsvpDeadline;
      default: return fallback;
    }
  });
  
  // Then process regular variables
  personalizedTemplate = personalizedTemplate
    .replace(/{{guest_name}}/g, guestName)
    .replace(/{{first_name}}/g, firstName)
    .replace(/{{last_name}}/g, lastName)
    .replace(/{{couple_names}}/g, coupleNames)
    .replace(/{{event_name}}/g, eventName)
    .replace(/{{rsvp_status}}/g, rsvpStatus)
    .replace(/{{rsvp_link}}/g, rsvpLink)
    .replace(/{{rsvp_deadline}}/g, rsvpDeadline);
    
  // Also personalize the subject if provided with support for fallback syntax
  let personalizedSubject = subject;
  
  if (personalizedSubject) {
    // Process variables with || fallback syntax first
    personalizedSubject = personalizedSubject.replace(/{{(\w+)\s*\|\|\s*["']([^"']*)["']}}/g, (match, varName, fallback) => {
      switch (varName) {
        case 'first_name': return firstName;
        case 'last_name': return lastName;
        case 'guest_name': return guestName;
        case 'couple_names': return coupleNames;
        case 'event_name': return eventName;
        case 'rsvp_status': return rsvpStatus;
        default: return fallback;
      }
    });
    
    // Then process regular variables
    personalizedSubject = personalizedSubject
      .replace(/{{guest_name}}/g, guestName)
      .replace(/{{first_name}}/g, firstName)
      .replace(/{{last_name}}/g, lastName)
      .replace(/{{couple_names}}/g, coupleNames)
      .replace(/{{event_name}}/g, eventName)
      .replace(/{{rsvp_status}}/g, rsvpStatus);
  }

  return (
    <div className="border rounded-md p-4 text-sm space-y-2">
      {personalizedSubject && (
        <div className="mb-2">
          <Badge variant="secondary" className="mb-1">Subject</Badge>
          <div className="font-medium">{personalizedSubject}</div>
        </div>
      )}
      <Badge variant="secondary" className="mb-1">Body</Badge>
      <div className="whitespace-pre-wrap">{personalizedTemplate}</div>
    </div>
  );
}

export default function CommunicationStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted
}: CommunicationStepProps) {
  const [isEditing, setIsEditing] = useState(!isCompleted);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const { toast } = useToast();

  // Fetch templates for current event
  const {
    data: emailTemplatesData,
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery({
    queryKey: [`/api/events/${eventId}/email-templates`],
    enabled: !!eventId,
    retry: 1,
    retryDelay: 1000,
  });
  
  // Extract templates array from response - handle both formats that the API might return
  const emailTemplates = 
    Array.isArray(emailTemplatesData) ? emailTemplatesData : 
    emailTemplatesData?.templates || [];

  // Default communication settings
  const defaultCommunicationSettings = {
    emailProvider: "Gmail",
    emailProviderConfigured: false,
    smsProviderConfigured: false,
    whatsappProviderConfigured: false,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    enableWhatsappNotifications: false,
    emailSender: `${currentEvent?.brideName || 'Bride'} and ${currentEvent?.groomName || 'Groom'}`,
    emailFrom: currentEvent?.emailFrom || '',
    emailReplyTo: currentEvent?.emailReplyTo || '',
    whatsappNumber: currentEvent?.whatsappBusinessNumber || '',
  };
  
  // Form for template editing
  const templateForm = useForm({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      type: "",
      emailSubject: "",
      emailTemplate: "",
      whatsappTemplate: "",
      sendImmediately: true,
      scheduledDate: null,
      scheduledTime: null,
      enabled: true,
    },
  });

  // Form for communication settings
  const communicationForm = useForm({
    resolver: zodResolver(communicationSettingsSchema),
    defaultValues: {
      emailFrom: currentEvent?.emailFrom || "",
      emailReplyTo: currentEvent?.emailReplyTo || "",
      whatsappNumber: currentEvent?.whatsappBusinessNumber || "",
      useGmail: false,
      useOutlook: false,
      useSendGrid: false,
      gmailAccount: "",
      outlookAccount: "",
      sendGridApiKey: "",
    },
  });
  
  // Initialize editing template
  const handleEditTemplate = (template: EmailTemplate) => {
    templateForm.reset({
      type: template.type,
      emailSubject: template.emailSubject,
      emailTemplate: template.emailTemplate,
      whatsappTemplate: template.whatsappTemplate,
      sendImmediately: template.sendImmediately,
      scheduledDate: template.scheduledDate,
      scheduledTime: template.scheduledTime,
      enabled: template.enabled,
    });
    setEditingTemplate(template);
  };
  
  // Get default template content based on type
  const getDefaultTemplateContent = (templateType: string): { subject: string; body: string; whatsapp: string } => {
    const eventName = currentEvent?.title || 'Event';
    const coupleNames = currentEvent?.coupleNames || `${currentEvent?.brideName || 'Bride'} & ${currentEvent?.groomName || 'Groom'}`;
    
    switch (templateType) {
      case 'invitation':
        return {
          subject: `You're Invited to ${eventName}!`,
          body: `Dear {{guest_name}},\n\nWe are delighted to invite you to celebrate ${eventName} with us!\n\nEvent Details:\n📅 Date: {{event_date}}\n📍 Location: {{event_location}}\n\nPlease RSVP by clicking here: {{rsvp_link}}\n\nWe can't wait to celebrate with you!\n\nWith love,\n${coupleNames}`,
          whatsapp: `🎉 You're invited to ${eventName}! Please RSVP at {{rsvp_link}} - ${coupleNames}`
        };
      case 'rsvp_confirmation':
        return {
          subject: `Thank you for your RSVP - ${eventName}`,
          body: `Dear {{guest_name}},\n\nThank you for confirming your attendance at ${eventName}! We're thrilled you'll be celebrating with us.\n\nYour RSVP Details:\n✅ Status: {{rsvp_status}}\n👥 Guests: {{guest_count}}\n🍽️ Meal Choice: {{meal_choice}}\n\nWe'll send you more details closer to the event.\n\nWith excitement,\n${coupleNames}`,
          whatsapp: `Thank you for your RSVP to ${eventName}! We're excited to celebrate with you. - ${coupleNames}`
        };
      case 'accommodation_confirmation':
        return {
          subject: `Your Accommodation is Confirmed - ${eventName}`,
          body: `Dear {{guest_name}},\n\nGreat news! Your accommodation for ${eventName} has been confirmed.\n\nAccommodation Details:\n🏨 Hotel: {{hotel_name}}\n📍 Address: {{hotel_address}}\n📅 Check-in: {{checkin_date}}\n📅 Check-out: {{checkout_date}}\n🛏️ Room Type: {{room_type}}\n\nHotel Contact: {{hotel_phone}}\n\nSee you soon!\n\n${coupleNames}`,
          whatsapp: `Your accommodation for ${eventName} is confirmed at {{hotel_name}}. Check-in: {{checkin_date}}. - ${coupleNames}`
        };
      case 'transport_confirmation':
        return {
          subject: `Your Transport is Arranged - ${eventName}`,
          body: `Dear {{guest_name}},\n\nYour transportation for ${eventName} has been arranged!\n\nTransport Details:\n🚗 Vehicle: {{vehicle_type}}\n⏰ Pickup Time: {{pickup_time}}\n📍 Pickup Location: {{pickup_location}}\n📍 Drop-off: {{dropoff_location}}\n📱 Driver Contact: {{driver_contact}}\n\nPlease be ready 10 minutes before pickup time.\n\n${coupleNames}`,
          whatsapp: `Transport arranged for ${eventName}! Pickup at {{pickup_time}} from {{pickup_location}}. Driver: {{driver_contact}} - ${coupleNames}`
        };
      default:
        return {
          subject: `${eventName} - ${templateTypes.find(t => t.id === templateType)?.name || 'Update'}`,
          body: `Dear {{guest_name}},\n\nWe hope this message finds you well.\n\nThis is an update regarding ${eventName}.\n\nBest regards,\n${coupleNames}`,
          whatsapp: `Update for ${eventName}: {{message}} - ${coupleNames}`
        };
    }
  };

  // Create new template
  const handleCreateTemplate = () => {
    const newTemplateType = templateTypes.find(t => 
      !emailTemplates || (Array.isArray(emailTemplates) && !emailTemplates.some((template: EmailTemplate) => template.type === t.id))
    );
    
    if (newTemplateType) {
      const defaultContent = getDefaultTemplateContent(newTemplateType.id);
      const newTemplate: EmailTemplate = {
        type: newTemplateType.id,
        emailSubject: defaultContent.subject,
        emailTemplate: defaultContent.body,
        whatsappTemplate: defaultContent.whatsapp,
        sendImmediately: true,
        scheduledDate: null,
        scheduledTime: null,
        enabled: true,
      };
      
      templateForm.reset(newTemplate);
      setEditingTemplate(newTemplate);
    } else {
      toast({
        title: "All template types already exist",
        description: "You've already created all available template types.",
        variant: "default",
      });
    }
  };
  
  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: EmailTemplate) => {
      // If template has an ID, update it, otherwise create new one
      const method = templateData.id ? 'PATCH' : 'POST';
      const url = templateData.id 
        ? `/api/events/${eventId}/email-templates/${templateData.id}`
        : `/api/events/${eventId}/email-templates`;
        
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...templateData,
          eventId: Number(eventId)
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save template');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-templates`] });
      setEditingTemplate(null);
      toast({
        title: "Template saved",
        description: "Your template has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save template",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Save template handler
  const handleSaveTemplate = () => {
    const templateData = templateForm.getValues();
    
    // If we're editing an existing template, preserve its ID
    if (editingTemplate?.id) {
      templateData.id = editingTemplate.id;
    }
    
    saveTemplateMutation.mutate(templateData as EmailTemplate);
  };
  
  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const res = await fetch(`/api/events/${eventId}/email-templates/${templateId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete template');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-templates`] });
      toast({
        title: "Template deleted",
        description: "Your template has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete template",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle template deletion
  const handleDeleteTemplate = (template: EmailTemplate) => {
    if (!template.id) {
      toast({
        title: "Cannot delete template",
        description: "This template hasn't been saved yet.",
        variant: "destructive",
      });
      return;
    }
    
    // Show confirmation dialog here
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(template.id);
    }
  };
  
  // Handle form submission
  const handleComplete = () => {
    onComplete({
      ...defaultCommunicationSettings,
      emailTemplates: Array.isArray(emailTemplates) ? emailTemplates : []
    });
    setIsEditing(false);
  };

  // If step is completed and not editing, show summary view
  if (isCompleted && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Email Provider:</h3>
              <p className="col-span-3">{defaultCommunicationSettings.emailProvider}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Email Status:</h3>
              <p className="col-span-3">
                {defaultCommunicationSettings.emailProviderConfigured ? 
                  "Configured" : 
                  <span className="text-amber-500">Not Configured</span>
                }
              </p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">SMS Status:</h3>
              <p className="col-span-3">
                {defaultCommunicationSettings.smsProviderConfigured ? 
                  "Configured" : 
                  <span className="text-amber-500">Not Configured</span>
                }
              </p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">WhatsApp Status:</h3>
              <p className="col-span-3">
                {defaultCommunicationSettings.whatsappProviderConfigured ? 
                  "Configured" : 
                  <span className="text-amber-500">Not Configured</span>
                }
              </p>
            </div>
          </div>
          
          <h3 className="font-medium mt-4">Email Templates:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {Object.entries(defaultCommunicationSettings.emailTemplates).map(([key, template]) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardTitle>
                  <CardDescription>
                    {template.enabled ? "Enabled" : "Disabled"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{template.subject}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <Button type="button" onClick={() => setIsEditing(true)}>
          Edit Communication Settings
        </Button>
      </div>
    );
  }

  // Editing interface
  return (
    <div className="space-y-6">
      <Tabs defaultValue="email">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Provider Configuration</CardTitle>
              <CardDescription>
                Configure your email provider to send invitations and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {EMAIL_PROVIDERS.map((provider) => (
                  <Card 
                    key={provider}
                    className={`cursor-pointer hover:border-primary/50 ${
                      defaultCommunicationSettings.emailProvider === provider ? 
                      'border-2 border-primary' : ''
                    }`}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        {provider === "Gmail" && <Mail className="h-5 w-5 text-red-500" />}
                        {provider === "Outlook" && <Mail className="h-5 w-5 text-blue-500" />}
                        {provider === "Custom SMTP" && <Mail className="h-5 w-5 text-gray-500" />}
                        <span>{provider}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>
                    Manage email templates for all event communications
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleCreateTemplate}
                >
                  <Plus className="h-4 w-4" />
                  Add Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingTemplates ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : templatesError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2 text-orange-500" />
                  <p className="mb-1">Unable to load email templates</p>
                  <p className="text-sm mb-4">There was an issue loading your templates. Please try refreshing the page.</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              ) : !emailTemplates || emailTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="mb-1">No email templates yet</p>
                  <p className="text-sm">Click "Add Template" to create your first email template</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emailTemplates.map((template: EmailTemplate) => {
                    const templateType = templateTypes.find(t => t.id === template.type);
                    
                    return (
                      <Card key={template.id || template.type}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-base">{templateType?.name || template.type}</CardTitle>
                              <CardDescription className="text-xs">
                                {templateType?.description || "Custom email template"}
                              </CardDescription>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7" 
                                onClick={() => {
                                  setShowTemplatePreview(true);
                                  setEditingTemplate(template);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleEditTemplate(template)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-destructive hover:text-destructive/80"
                                onClick={() => handleDeleteTemplate(template)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-start">
                            <div className="space-y-1 text-sm">
                              <p className="font-medium truncate max-w-[200px]">{template.emailSubject}</p>
                              {template.sendImmediately ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center">
                                  <CheckCircle className="h-3 w-3" />
                                  <span className="text-xs">Send immediately</span>
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex gap-1 items-center">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-xs">Scheduled</span>
                                </Badge>
                              )}
                            </div>
                            <Switch checked={template.enabled || false} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              {/* Template edit dialog */}
              <Dialog open={!!editingTemplate && !showTemplatePreview} onOpenChange={(open) => !open && setEditingTemplate(null)}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTemplate?.id ? "Edit Email Template" : "Create Email Template"}
                    </DialogTitle>
                    <DialogDescription>
                      Customize this template for communications with your guests
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...templateForm}>
                    <form className="space-y-6">
                      <FormField
                        control={templateForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Type</FormLabel>
                            <Select
                              disabled={!!editingTemplate?.id}
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select template type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {templateTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              What type of communication is this template for?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={templateForm.control}
                        name="emailSubject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Subject</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Subject line for this email"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              You can use variables like <code className="text-primary font-medium">{"{{guest_name}}"}</code> in the subject
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={templateForm.control}
                        name="emailTemplate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Body</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter the email content"
                                className="min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Available variables: guest_name, first_name, last_name, couple_names, 
                              event_name, rsvp_status, rsvp_link, rsvp_deadline
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={templateForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enabled</FormLabel>
                              <FormDescription>
                                Enable or disable this email template
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={templateForm.control}
                        name="sendImmediately"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Send Immediately</FormLabel>
                              <FormDescription>
                                Send email immediately when triggered or schedule for later
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveTemplate}>Save Template</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Template preview dialog */}
              <Dialog open={!!editingTemplate && showTemplatePreview} onOpenChange={(open) => !open && setShowTemplatePreview(false)}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Template Preview</DialogTitle>
                    <DialogDescription>
                      This is how your template will appear to guests
                    </DialogDescription>
                  </DialogHeader>
                  
                  {editingTemplate && (
                    <TemplatePreview
                      template={editingTemplate.emailTemplate || ""}
                      subject={editingTemplate.emailSubject || ""}
                      templateType={editingTemplate.type}
                      event={currentEvent}
                    />
                  )}
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTemplatePreview(false)}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setShowTemplatePreview(false);
                      handleEditTemplate(editingTemplate as EmailTemplate);
                    }}>
                      Edit Template
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sms" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Provider Configuration</CardTitle>
              <CardDescription>
                Configure SMS provider to send text notifications to your guests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:border-primary/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      <span>Twilio</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <span>AWS SNS</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-sms" className="font-medium">Enable SMS Notifications</Label>
                  <Switch id="enable-sms" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sms-from">SMS From Number</Label>
                  <Input
                    id="sms-from"
                    placeholder="+1234567890"
                    type="tel"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your SMS-enabled phone number or short code
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>SMS Templates</CardTitle>
              <CardDescription>
                Create SMS versions of your email templates for mobile notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="mb-1">SMS templates</p>
                <p className="text-sm">Configure your SMS provider first to create SMS templates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="whatsapp" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Integration</CardTitle>
              <CardDescription>
                Connect your WhatsApp Business account to send messages to guests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:border-primary/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <span>WhatsApp Business API</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <span>WhatsApp Web.js</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-whatsapp" className="font-medium">Enable WhatsApp Notifications</Label>
                  <Switch id="enable-whatsapp" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-number">WhatsApp Business Number</Label>
                  <Input
                    id="whatsapp-number"
                    placeholder="+1234567890"
                    type="tel"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your verified WhatsApp Business phone number
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-token">Access Token</Label>
                  <Input
                    id="whatsapp-token"
                    placeholder="Enter your WhatsApp Business API token"
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get this token from your WhatsApp Business API provider
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Templates</CardTitle>
              <CardDescription>
                Create WhatsApp message templates for different communication types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="mb-1">WhatsApp templates</p>
                <p className="text-sm">Configure your WhatsApp provider first to create templates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between mt-8">
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const result = await fetch('/api/test-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    eventId: eventId,
                    email: 'test@example.com'
                  })
                });
                
                const response = await result.json();
                toast({
                  title: response.success ? "Test Email Sent" : "Test Email Failed",
                  description: response.message,
                  variant: response.success ? "default" : "destructive",
                });
              } catch (error) {
                toast({
                  title: "Test Email Failed",
                  description: "Failed to send test email",
                  variant: "destructive",
                });
              }
            }}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Test Email Delivery
          </Button>
        </div>
        
        <Button onClick={handleComplete} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Save Communication Settings
        </Button>
      </div>
    </div>
  );
}