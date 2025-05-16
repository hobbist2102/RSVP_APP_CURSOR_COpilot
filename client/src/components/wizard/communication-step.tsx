import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WeddingEvent } from "@shared/schema";
import { Check, Mail, MessageSquare, Edit } from "lucide-react";
import { EMAIL_PROVIDERS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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