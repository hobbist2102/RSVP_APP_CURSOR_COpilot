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
  Trash,
  ChevronRight,
  ArrowLeft,
  Settings,
  FileText,
  Wifi,
  WifiOff
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface CommunicationStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: any) => void;
  isCompleted: boolean;
}

// Two-screen navigation state
type CommunicationScreen = 'providers' | 'templates';

// Provider connection status interface
interface ProviderStatus {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  icon: React.ReactNode;
  connected: boolean;
  description: string;
  color: string;
}

// Template category interface
interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: TemplateVariant[];
}

interface TemplateVariant {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp';
  subject?: string;
  content: string;
  enabled: boolean;
}

export default function CommunicationStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted
}: CommunicationStepProps) {
  const [currentScreen, setCurrentScreen] = useState<CommunicationScreen>('providers');
  const [isEditing, setIsEditing] = useState(!isCompleted);
  const { toast } = useToast();

  // Provider configuration data
  const providers: ProviderStatus[] = [
    {
      id: 'gmail',
      name: 'Gmail',
      type: 'email',
      icon: <Mail className="h-5 w-5" />,
      connected: currentEvent?.useGmail || false,
      description: 'Google OAuth integration',
      color: 'text-red-500'
    },
    {
      id: 'outlook',
      name: 'Outlook',
      type: 'email',
      icon: <Mail className="h-5 w-5" />,
      connected: currentEvent?.useOutlook || false,
      description: 'Microsoft Graph API',
      color: 'text-blue-500'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      type: 'email',
      icon: <Mail className="h-5 w-5" />,
      connected: currentEvent?.useSendGrid || false,
      description: 'Email delivery service',
      color: 'text-green-500'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      type: 'sms',
      icon: <MessageSquare className="h-5 w-5" />,
      connected: false,
      description: 'SMS messaging service',
      color: 'text-purple-500'
    },
    {
      id: 'whatsapp_business',
      name: 'WhatsApp Business API',
      type: 'whatsapp',
      icon: <MessageSquare className="h-5 w-5" />,
      connected: currentEvent?.whatsappConfigured || false,
      description: 'Official WhatsApp API',
      color: 'text-green-600'
    },
    {
      id: 'whatsapp_web',
      name: 'WhatsApp Web.js',
      type: 'whatsapp',
      icon: <MessageSquare className="h-5 w-5" />,
      connected: false,
      description: 'Unofficial WhatsApp integration',
      color: 'text-green-500'
    }
  ];

  // Template categories data
  const templateCategories: TemplateCategory[] = [
    {
      id: 'invitations',
      name: 'RSVP Invitations',
      description: 'Initial wedding invitations and RSVP requests',
      templates: [
        {
          id: 'email_invitation',
          channel: 'email',
          subject: 'You\'re Invited: {{couple_names}} Wedding Celebration',
          content: 'Dear {{guest_name}},\n\nWe are delighted to invite you to celebrate our wedding!\n\nPlease RSVP by clicking: {{rsvp_link}}\n\nWith love,\n{{couple_names}}',
          enabled: true
        },
        {
          id: 'whatsapp_invitation',
          channel: 'whatsapp',
          content: 'Hi {{first_name}}! 🎉 We\'re excited to invite you to our wedding celebration. Please confirm your attendance: {{rsvp_link}}',
          enabled: true
        }
      ]
    },
    {
      id: 'reminders',
      name: 'RSVP Reminders',
      description: 'Follow-up messages for pending responses',
      templates: [
        {
          id: 'email_reminder',
          channel: 'email',
          subject: 'RSVP Reminder: {{couple_names}} Wedding',
          content: 'Dear {{guest_name}},\n\nWe haven\'t received your RSVP yet. Please respond by {{rsvp_deadline}}.\n\nRSVP here: {{rsvp_link}}',
          enabled: true
        }
      ]
    },
    {
      id: 'confirmations',
      name: 'Confirmations',
      description: 'Thank you messages for confirmed guests',
      templates: [
        {
          id: 'email_confirmation',
          channel: 'email',
          subject: 'Thank You for Your RSVP - {{couple_names}}',
          content: 'Dear {{guest_name}},\n\nThank you for confirming your attendance! We can\'t wait to celebrate with you.\n\nEvent details and updates will follow soon.',
          enabled: true
        }
      ]
    }
  ];

  const handleComplete = async () => {
    try {
      const communicationData = {
        providersConfigured: providers.filter(p => p.connected).length,
        templatesEnabled: templateCategories.reduce((count, cat) => 
          count + cat.templates.filter(t => t.enabled).length, 0
        )
      };

      onComplete(communicationData);
      setIsEditing(false);
      
      toast({
        title: "Communication Settings Saved",
        description: "Your communication preferences have been configured successfully.",
      });
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  // Show completed state
  if (!isEditing && isCompleted) {
    const connectedProviders = providers.filter(p => p.connected);
    const totalTemplates = templateCategories.reduce((count, cat) => 
      count + cat.templates.filter(t => t.enabled).length, 0
    );

    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Communication Configured</h3>
              <p className="text-sm text-green-700">Ready to send messages to your guests</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-900">{connectedProviders.length}</div>
              <div className="text-sm text-green-700">Connected Providers</div>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-900">{totalTemplates}</div>
              <div className="text-sm text-green-700">Active Templates</div>
            </div>
          </div>
        </div>
        
        <Button type="button" onClick={() => setIsEditing(true)} variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Communication Settings
        </Button>
      </div>
    );
  }

  // Providers Screen
  if (currentScreen === 'providers') {
    const emailProviders = providers.filter(p => p.type === 'email');
    const smsProviders = providers.filter(p => p.type === 'sms');
    const whatsappProviders = providers.filter(p => p.type === 'whatsapp');

    return (
      <div className="space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Communication Providers</h3>
            <p className="text-sm text-muted-foreground">Connect your messaging services</p>
          </div>
          <Button 
            onClick={() => setCurrentScreen('templates')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Manage Templates
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Email Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Email Providers
            </CardTitle>
            <CardDescription>
              Configure email services for sending invitations and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {emailProviders.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={provider.color}>
                    {provider.icon}
                  </div>
                  <div>
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-sm text-muted-foreground">{provider.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {provider.connected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      <Wifi className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    {provider.connected ? 'Reconfigure' : 'Connect'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* SMS Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              SMS Providers
            </CardTitle>
            <CardDescription>
              Set up SMS services for text notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {smsProviders.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={provider.color}>
                    {provider.icon}
                  </div>
                  <div>
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-sm text-muted-foreground">{provider.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-gray-500">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* WhatsApp Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              WhatsApp Providers
            </CardTitle>
            <CardDescription>
              Connect WhatsApp for instant messaging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {whatsappProviders.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={provider.color}>
                    {provider.icon}
                  </div>
                  <div>
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-sm text-muted-foreground">{provider.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {provider.connected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      <Wifi className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    {provider.connected ? 'Reconfigure' : 'Connect'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bottom Action */}
        <div className="flex items-center justify-end pt-6 border-t">
          <Button onClick={handleComplete} className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Save Communication Settings
          </Button>
        </div>
      </div>
    );
  }

  // Templates Screen
  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => setCurrentScreen('providers')}
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Providers
        </Button>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Message Templates</h3>
          <p className="text-sm text-muted-foreground">Customize your communication templates</p>
        </div>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {/* Template Categories */}
      <div className="space-y-4">
        {templateCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {template.channel === 'email' && <Mail className="h-4 w-4 text-blue-500" />}
                      {template.channel === 'sms' && <MessageSquare className="h-4 w-4 text-purple-500" />}
                      {template.channel === 'whatsapp' && <MessageSquare className="h-4 w-4 text-green-500" />}
                      <Badge variant="outline" className="capitalize">
                        {template.channel}
                      </Badge>
                    </div>
                    <div>
                      {template.subject && (
                        <div className="font-medium text-sm">{template.subject}</div>
                      )}
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {template.content}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={template.enabled} />
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
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
          Test Message Delivery
        </Button>
        
        <Button onClick={handleComplete} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Save Communication Settings
        </Button>
      </div>
    </div>
  );
}