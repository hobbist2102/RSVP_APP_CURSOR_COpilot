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
  WifiOff,
  Upload,
  Image,
  Palette,
  Type,
  Layout,
  Smartphone,
  Monitor,
  Copy
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

// Three-screen navigation state
type CommunicationScreen = 'providers' | 'templates' | 'assets';

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

  // Assets Screen
  if (currentScreen === 'assets') {
    return (
      <div className="space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => setCurrentScreen('templates')}
            variant="ghost"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>
          <div className="text-center">
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Brand Assets & Design
            </h3>
            <p className="text-sm text-muted-foreground">Upload logos, banners, and customize your wedding brand</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Brand Assets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <Card className="border-2 border-dashed border-amber-200 hover:border-amber-300 transition-colors">
            <CardHeader className="text-center">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-4">
                <Image className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-lg">Wedding Logo</CardTitle>
              <CardDescription>Upload your couple's logo or monogram (PNG, JPG, SVG)</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="flex items-center gap-2 mx-auto">
                <Upload className="h-4 w-4" />
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Recommended: 300x300px, transparent background</p>
            </CardContent>
          </Card>

          {/* Email Banner */}
          <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                <Layout className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Email Header Banner</CardTitle>
              <CardDescription>Beautiful header image for email invitations</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="flex items-center gap-2 mx-auto">
                <Upload className="h-4 w-4" />
                Upload Banner
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Recommended: 600x200px, wedding theme</p>
            </CardContent>
          </Card>

          {/* WhatsApp Display Picture */}
          <Card className="border-2 border-dashed border-green-200 hover:border-green-300 transition-colors">
            <CardHeader className="text-center">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-lg">WhatsApp Profile</CardTitle>
              <CardDescription>Profile picture for WhatsApp Business account</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="flex items-center gap-2 mx-auto">
                <Upload className="h-4 w-4" />
                Upload Profile Picture
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Required: 640x640px, square format</p>
            </CardContent>
          </Card>

          {/* Social Media Assets */}
          <Card className="border-2 border-dashed border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader className="text-center">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4">
                <Monitor className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Social Media Kit</CardTitle>
              <CardDescription>Instagram stories, posts, and sharing graphics</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="flex items-center gap-2 mx-auto">
                <Upload className="h-4 w-4" />
                Upload Social Assets
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Multiple formats supported</p>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette & Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-amber-600" />
                Wedding Color Palette
              </CardTitle>
              <CardDescription>Define your wedding brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-amber-500 mx-auto mb-2 cursor-pointer hover:scale-105 transition-transform"></div>
                  <p className="text-xs font-medium">Primary</p>
                  <p className="text-xs text-muted-foreground">#F59E0B</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-orange-600 mx-auto mb-2 cursor-pointer hover:scale-105 transition-transform"></div>
                  <p className="text-xs font-medium">Secondary</p>
                  <p className="text-xs text-muted-foreground">#EA580C</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-amber-100 mx-auto mb-2 cursor-pointer hover:scale-105 transition-transform"></div>
                  <p className="text-xs font-medium">Accent</p>
                  <p className="text-xs text-muted-foreground">#FEF3C7</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Palette className="h-4 w-4 mr-2" />
                Customize Colors
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5 text-slate-600" />
                Typography & Fonts
              </CardTitle>
              <CardDescription>Choose fonts for your wedding communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border">
                  <p className="font-serif text-lg font-semibold">Elegant Serif</p>
                  <p className="text-sm text-muted-foreground">For headings and formal text</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="font-sans text-base">Clean Sans-Serif</p>
                  <p className="text-sm text-muted-foreground">For body text and details</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Type className="h-4 w-4 mr-2" />
                Browse Font Library
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Preview Brand Guidelines
          </Button>
          <Button onClick={handleComplete} className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Save Brand Assets
          </Button>
        </div>
      </div>
    );
  }

  // Enhanced Templates Screen
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
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Message Templates & Design
          </h3>
          <p className="text-sm text-muted-foreground">Create beautiful, consistent messaging across all channels</p>
        </div>
        <Button 
          onClick={() => setCurrentScreen('assets')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Image className="h-4 w-4" />
          Brand Assets
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Channel Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-blue-900">Email Templates</h4>
            <p className="text-sm text-blue-700 mb-3">Rich HTML with images & styling</p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">4 Active</Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-green-900">WhatsApp Templates</h4>
            <p className="text-sm text-green-700 mb-3">Quick messages with media</p>
            <Badge variant="secondary" className="bg-green-100 text-green-800">2 Active</Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-purple-900">SMS Templates</h4>
            <p className="text-sm text-purple-700 mb-3">Concise text messages</p>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">1 Active</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Template Categories */}
      <div className="space-y-6">
        {templateCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.id === 'invitations' && <Mail className="h-5 w-5 text-blue-500" />}
                    {category.id === 'reminders' && <Clock className="h-5 w-5 text-amber-500" />}
                    {category.id === 'confirmations' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-base">{category.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-gray-100">
                {/* Email Template */}
                <div className="p-6 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <Badge variant="outline" className="border-blue-200 text-blue-700">Email</Badge>
                    </div>
                    <Switch checked={category.templates.find(t => t.channel === 'email')?.enabled || false} />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white border rounded-lg p-3">
                      <div className="text-sm font-medium mb-1">Subject Line</div>
                      <div className="text-xs text-muted-foreground">
                        {category.templates.find(t => t.channel === 'email')?.subject || 'Add email subject...'}
                      </div>
                    </div>
                    <div className="bg-white border rounded-lg p-3 min-h-[80px]">
                      <div className="text-sm font-medium mb-1">Email Content</div>
                      <div className="text-xs text-muted-foreground line-clamp-3">
                        {category.templates.find(t => t.channel === 'email')?.content || 'Design your email template...'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>

                {/* WhatsApp Template */}
                <div className="p-6 hover:bg-green-50/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <Badge variant="outline" className="border-green-200 text-green-700">WhatsApp</Badge>
                    </div>
                    <Switch checked={category.templates.find(t => t.channel === 'whatsapp')?.enabled || false} />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 min-h-[120px]">
                      <div className="text-sm font-medium mb-2 text-green-800">WhatsApp Message</div>
                      <div className="text-xs text-green-700">
                        {category.templates.find(t => t.channel === 'whatsapp')?.content || 'Create WhatsApp message...'}
                      </div>
                      <div className="mt-3 text-xs text-green-600">
                        ✓ Media support • ✓ Emojis • ✓ Quick replies
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>

                {/* SMS Template */}
                <div className="p-6 hover:bg-purple-50/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-purple-500" />
                      <Badge variant="outline" className="border-purple-200 text-purple-700">SMS</Badge>
                    </div>
                    <Switch checked={false} />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 min-h-[120px]">
                      <div className="text-sm font-medium mb-2 text-purple-800">SMS Text</div>
                      <div className="text-xs text-purple-700">
                        Create concise SMS version...
                      </div>
                      <div className="mt-3 text-xs text-purple-600">
                        Character limit: 160 • No images
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Create
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" disabled>
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex gap-3">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Templates
          </Button>
          <Button variant="outline" onClick={async () => {
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
                title: response.success ? "Test Sent Successfully" : "Test Failed",
                description: response.message,
                variant: response.success ? "default" : "destructive",
              });
            } catch (error) {
              toast({
                title: "Test Failed",
                description: "Failed to send test message",
                variant: "destructive",
              });
            }
          }}>
            <Mail className="h-4 w-4 mr-2" />
            Send Test Messages
          </Button>
        </div>
        
        <Button onClick={handleComplete} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Save All Templates
        </Button>
      </div>
    </div>
  );
}