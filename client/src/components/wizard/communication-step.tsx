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

  // Comprehensive template categories based on Event Setup Wizard Steps 1-5
  const templateCategories: TemplateCategory[] = [
    {
      id: 'initial_invitations',
      name: 'Initial Wedding Invitations',
      description: 'Save the date and initial wedding announcements (Step 1: Basic Info)',
      templates: [
        {
          id: 'save_the_date_email',
          channel: 'email',
          subject: '✨ Save the Date: {{couple_names}} Wedding Celebration',
          content: `Dear {{guest_name}},

We are thrilled to announce that {{bride_name}} and {{groom_name}} are getting married!

📅 Wedding Dates: {{start_date}} - {{end_date}}
📍 Location: {{location}}

{{description}}

Please save these dates in your calendar. A formal invitation with RSVP details will follow soon.

With love and excitement,
{{couple_names}}`,
          enabled: true
        },
        {
          id: 'save_the_date_whatsapp',
          channel: 'whatsapp',
          content: `💕 SAVE THE DATE 💕

{{bride_name}} & {{groom_name}} are getting married!

📅 {{start_date}} - {{end_date}}
📍 {{location}}

{{description}}

Formal invitation coming soon! 
Can't wait to celebrate with you! 🎉`,
          enabled: true
        },
        {
          id: 'save_the_date_sms',
          channel: 'sms',
          content: 'Save the Date! {{couple_names}} wedding {{start_date}}-{{end_date}} at {{location}}. Formal invitation coming soon!',
          enabled: false
        }
      ]
    },
    {
      id: 'formal_invitations',
      name: 'Formal RSVP Invitations',
      description: 'Official wedding invitations with RSVP links (Step 3: RSVP Configuration)',
      templates: [
        {
          id: 'formal_invitation_email',
          channel: 'email',
          subject: '💌 You\'re Formally Invited: {{couple_names}} Wedding',
          content: `Dear {{guest_name}},

With great joy and excitement, we request the honor of your presence at the wedding celebration of:

{{bride_name}} & {{groom_name}}

📅 Wedding Celebration: {{start_date}} - {{end_date}}
📍 Venue: {{location}}

{{description}}

🎭 CEREMONIES & EVENTS:
{{ceremonies_list}}

Please confirm your attendance by clicking the link below:
👉 RSVP Now: {{rsvp_link}}

⏰ RSVP Deadline: {{rsvp_deadline}}

We can't wait to celebrate this special moment with you!

With love,
{{couple_names}}`,
          enabled: true
        },
        {
          id: 'formal_invitation_whatsapp',
          channel: 'whatsapp',
          content: `🌟 WEDDING INVITATION 🌟

{{bride_name}} & {{groom_name}}
are getting married!

📅 {{start_date}} - {{end_date}}
📍 {{location}}

{{description}}

🎭 Join us for multiple celebrations:
{{ceremonies_list}}

Please RSVP: {{rsvp_link}}
Deadline: {{rsvp_deadline}}

Looking forward to celebrating with you! 💕`,
          enabled: true
        }
      ]
    },
    {
      id: 'ceremony_details',
      name: 'Ceremony Information',
      description: 'Detailed ceremony schedules and venue information (Step 2: Venues)',
      templates: [
        {
          id: 'ceremony_schedule_email',
          channel: 'email',
          subject: '📅 Wedding Schedule: {{couple_names}} Celebrations',
          content: `Dear {{guest_name}},

Here's the complete schedule for {{couple_names}} wedding celebrations:

🎭 CEREMONY SCHEDULE:
{{ceremony_schedule}}

📍 VENUE DETAILS:
{{venue_details}}

🚗 PARKING & DIRECTIONS:
{{parking_instructions}}

Looking forward to seeing you there!

{{couple_names}}`,
          enabled: true
        },
        {
          id: 'ceremony_reminder_whatsapp',
          channel: 'whatsapp',
          content: `📅 CEREMONY REMINDER

{{ceremony_name}} is tomorrow!

⏰ {{ceremony_time}}
📍 {{ceremony_venue}}
👗 Dress Code: {{attire_code}}

Don't forget:
• Arrive 30 mins early
• Parking available at {{parking_info}}
• Contact: {{contact_number}}

See you tomorrow! 🎉`,
          enabled: true
        }
      ]
    },
    {
      id: 'accommodation_info',
      name: 'Accommodation Information',
      description: 'Hotel details and booking instructions (Step 4: Hotels & Accommodations)',
      templates: [
        {
          id: 'accommodation_details_email',
          channel: 'email',
          subject: '🏨 Accommodation Details: {{couple_names}} Wedding',
          content: `Dear {{guest_name}},

We've arranged comfortable accommodations for your stay:

🏨 HOTEL INFORMATION:
{{hotel_details}}

💰 BOOKING INFORMATION:
{{booking_instructions}}

📞 ASSISTANCE:
Contact us for any accommodation assistance.

{{accommodation_instructions}}

Warm regards,
{{couple_names}}`,
          enabled: true
        },
        {
          id: 'room_assignment_whatsapp',
          channel: 'whatsapp',
          content: `🏨 YOUR ROOM IS READY!

Hi {{guest_name}}!

Your accommodation details:
🏨 {{hotel_name}}
🛏️ {{room_type}} - Room {{room_number}}
📅 {{check_in_date}} to {{check_out_date}}

Check-in Instructions:
• Front desk: {{hotel_phone}}
• Mention: {{couple_names}} wedding
• ID required at check-in

Questions? Contact us anytime! 😊`,
          enabled: true
        }
      ]
    },
    {
      id: 'travel_coordination',
      name: 'Travel & Transportation',
      description: 'Flight coordination and transport arrangements (Step 5: Transport)',
      templates: [
        {
          id: 'travel_information_email',
          channel: 'email',
          subject: '✈️ Travel Information: {{couple_names}} Wedding',
          content: `Dear {{guest_name}},

Here's everything you need to know about travel arrangements:

✈️ FLIGHT COORDINATION:
{{flight_coordination_info}}

⏰ RECOMMENDED ARRIVAL/DEPARTURE:
• Arrive: {{recommended_arrival}} ({{arrival_buffer_time}} buffer)
• Depart: {{recommended_departure}} ({{departure_buffer_time}} buffer)

🚐 AIRPORT TRANSPORTATION:
{{transport_details}}

✈️ AIRLINE RECOMMENDATIONS:
{{recommended_airlines}}

💰 SPECIAL DEALS:
{{flight_special_deals}}

📞 TRAVEL ASSISTANCE:
{{transport_provider_email}}

Safe travels!
{{couple_names}}`,
          enabled: true
        },
        {
          id: 'transport_details_whatsapp',
          channel: 'whatsapp',
          content: `🚐 TRANSPORT UPDATE

Hi {{guest_name}}!

Your transport arrangements:

✈️ Flight: {{flight_number}} arriving {{arrival_time}}
🚐 Pickup: {{pickup_time}} at {{pickup_location}}
📍 Drop-off: {{dropoff_location}}

Driver Details:
👤 {{driver_name}}
📱 {{driver_phone}}
🚗 {{vehicle_details}}

Track your ride: {{tracking_link}}

Questions? Call {{transport_provider_contact}}

See you soon! 🎉`,
          enabled: true
        }
      ]
    },
    {
      id: 'rsvp_reminders',
      name: 'RSVP Follow-ups & Reminders',
      description: 'Gentle reminders for pending responses',
      templates: [
        {
          id: 'rsvp_reminder_email',
          channel: 'email',
          subject: '⏰ RSVP Reminder: {{couple_names}} Wedding',
          content: `Dear {{guest_name}},

We hope you're as excited as we are about our upcoming wedding!

We haven't received your RSVP yet, and we want to make sure you're included in all our planning.

📅 Wedding: {{start_date}} - {{end_date}}
⏰ RSVP Deadline: {{rsvp_deadline}}

Please confirm your attendance:
👉 RSVP Here: {{rsvp_link}}

If you have any questions or need assistance, please don't hesitate to reach out.

Looking forward to celebrating with you!

{{couple_names}}`,
          enabled: true
        },
        {
          id: 'final_rsvp_reminder_whatsapp',
          channel: 'whatsapp',
          content: `⏰ FINAL REMINDER

Hi {{guest_name}}!

Just a gentle reminder that our RSVP deadline is {{rsvp_deadline}} ({{days_remaining}} days away).

We'd love to have you celebrate with us!

Quick RSVP: {{rsvp_link}}

Any questions? Just reply here! 😊

{{couple_names}}`,
          enabled: true
        }
      ]
    },
    {
      id: 'stage2_collection',
      name: 'Stage 2 Details Collection',
      description: 'Collect accommodation, travel, and meal preferences from confirmed guests',
      templates: [
        {
          id: 'stage2_details_email',
          channel: 'email',
          subject: '📋 Please Share Your Preferences: {{couple_names}} Wedding',
          content: `Dear {{guest_name}},

Thank you for confirming your attendance at our wedding! 🎉

To ensure everything is perfect for your stay, please provide these additional details:

🏨 ACCOMMODATION PREFERENCES:
• Room type preferences
• Check-in/check-out dates
• Special accommodation needs

✈️ TRAVEL INFORMATION:
• Flight details (if traveling by air)
• Arrival and departure times
• Transportation preferences

🍽️ MEAL PREFERENCES:
• Dietary restrictions
• Food allergies
• Special meal requests

Complete your preferences here: {{stage2_link}}

This helps us coordinate:
✅ Room assignments
✅ Airport transfers  
✅ Catering arrangements
✅ Special accommodations

Deadline: {{stage2_deadline}}

Thank you for helping us plan the perfect celebration!

{{couple_names}}`,
          enabled: true
        },
        {
          id: 'stage2_reminder_whatsapp',
          channel: 'whatsapp',
          content: `📋 Quick Favor!

Hi {{guest_name}}!

Could you please share your preferences for our wedding?

We need:
🏨 Room preferences
✈️ Flight details  
🍽️ Meal choices

Takes 2 minutes: {{stage2_link}}

This helps us arrange everything perfectly for you!

Thanks! 😊`,
          enabled: true
        }
      ]
    },
    {
      id: 'confirmations',
      name: 'Confirmations & Thank You',
      description: 'Thank you messages and booking confirmations',
      templates: [
        {
          id: 'rsvp_confirmation_email',
          channel: 'email',
          subject: '✅ RSVP Confirmed: {{couple_names}} Wedding',
          content: `Dear {{guest_name}},

Thank you so much for confirming your attendance! We're thrilled you'll be celebrating with us.

✅ YOUR RSVP SUMMARY:
• Guest: {{guest_name}}
{{plus_one_info}}
• Ceremonies attending: {{selected_ceremonies}}
• Total guests: {{total_guests}}

📋 NEXT STEPS:
{{next_steps_info}}

💌 WHAT'S NEXT:
• Detailed schedule (sent 2 weeks before)
• Accommodation confirmations
• Transportation arrangements
• Final reminders and updates

Thank you for being part of our special day!

With love and excitement,
{{couple_names}}`,
          enabled: true
        },
        {
          id: 'accommodation_confirmed_whatsapp',
          channel: 'whatsapp',
          content: `✅ ALL CONFIRMED!

Hi {{guest_name}}!

Everything is set for your stay:

🏨 {{hotel_name}} - {{room_type}}
📅 {{check_in_date}} to {{check_out_date}}
✈️ Airport pickup arranged
🍽️ Meal preferences noted

You're all set! 

See you at the wedding! 🎉💕`,
          enabled: true
        }
      ]
    },
    {
      id: 'pre_wedding_updates',
      name: 'Pre-Wedding Updates & Logistics',
      description: 'Final details, weather updates, and last-minute information',
      templates: [
        {
          id: 'final_details_email',
          channel: 'email',
          subject: '📋 Final Details: {{couple_names}} Wedding ({{days_to_wedding}} days to go!)',
          content: `Dear {{guest_name}},

The big day is almost here! Just {{days_to_wedding}} days to go! 🎉

📋 FINAL DETAILS & REMINDERS:

🎭 SCHEDULE RECAP:
{{ceremony_schedule}}

🌤️ WEATHER UPDATE:
{{weather_forecast}}
Recommended attire: {{weather_recommendations}}

🚐 TRANSPORTATION:
{{transport_final_details}}

🏨 ACCOMMODATION:
Check-in: {{check_in_date}} after 3:00 PM
Hotel contact: {{hotel_phone}}

📱 EMERGENCY CONTACTS:
• Wedding coordinator: {{coordinator_contact}}
• Transport provider: {{transport_provider_contact}}
• Hotel: {{hotel_phone}}

💝 SPECIAL NOTES:
{{special_instructions}}

We can't wait to see you and celebrate together!

{{couple_names}}`,
          enabled: true
        },
        {
          id: 'day_before_reminder_whatsapp',
          channel: 'whatsapp',
          content: `🌟 TOMORROW IS THE DAY!

Hi {{guest_name}}!

Final reminders for tomorrow:

⏰ {{ceremony_name}} at {{ceremony_time}}
📍 {{ceremony_venue}}
👗 Dress code: {{attire_code}}

Don't forget:
• Arrive 30 mins early
• Bring comfortable shoes
• Weather: {{weather_update}}

Emergency contact: {{coordinator_contact}}

SO EXCITED to celebrate with you! 💕🎉`,
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