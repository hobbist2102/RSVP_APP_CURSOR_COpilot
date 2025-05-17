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

// Template types with friendly names
const templateTypes = [
  { id: "invitation", name: "Invitation", description: "Sent when inviting guests to your event" },
  { id: "rsvp_confirmation", name: "RSVP Confirmation", description: "Sent when guests confirm their attendance" },
  { id: "rsvp_declined", name: "RSVP Declined", description: "Sent when guests decline their attendance" },
  { id: "rsvp_pending", name: "RSVP Reminder", description: "Sent to remind guests who haven't completed their RSVP" },
  { id: "rsvp_maybe", name: "RSVP Maybe", description: "Sent to guests who aren't sure if they can attend" },
  { id: "pre_event_reminder", name: "Pre-Event Reminder", description: "Sent a few days before the event" },
  { id: "post_event_thanks", name: "Post-Event Thanks", description: "Sent after the event to thank guests" },
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
  emailTemplate: string | null;
  emailSubject: string | null;
  whatsappTemplate: string | null;
  sendImmediately: boolean | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  enabled: boolean | null;
  lastUpdated?: Date | null;
}

interface CommunicationStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: any) => void;
  isCompleted: boolean;
}

export default function CommunicationStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted
}: CommunicationStepProps) {
  const [isEditing, setIsEditing] = useState(!isCompleted);

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
    emailTemplates: {
      invitation: {
        subject: "You're Invited to Our Wedding!",
        enabled: true
      },
      rsvpConfirmation: {
        subject: "Thank You for Your RSVP",
        enabled: true
      },
      reminder: {
        subject: "Wedding Reminder",
        enabled: true
      },
      followUp: {
        subject: "Thank You for Attending Our Wedding",
        enabled: true
      }
    }
  };
  
  // Handle form submission
  const handleComplete = () => {
    onComplete(defaultCommunicationSettings);
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
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage email templates for different event communications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(defaultCommunicationSettings.emailTemplates).map(([key, template]) => (
                  <Card key={key}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{template.subject}</p>
                        <Switch defaultChecked={template.enabled} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sms" className="space-y-4 mt-4">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>SMS Provider (Coming Soon)</CardTitle>
              <CardDescription>
                Configure SMS provider to send text notifications to your guests
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>SMS integration will be available soon</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-sms" className="font-medium">Enable SMS Notifications</Label>
            <Switch id="enable-sms" disabled />
          </div>
        </TabsContent>
        
        <TabsContent value="whatsapp" className="space-y-4 mt-4">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>WhatsApp Integration (Coming Soon)</CardTitle>
              <CardDescription>
                Connect your WhatsApp Business account to send messages to guests
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>WhatsApp integration will be available soon</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-whatsapp" className="font-medium">Enable WhatsApp Notifications</Label>
            <Switch id="enable-whatsapp" disabled />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button onClick={handleComplete} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Save Communication Settings
        </Button>
      </div>
    </div>
  );
}