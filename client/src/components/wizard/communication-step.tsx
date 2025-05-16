import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Loader2, Mail, MessageSquare, Smartphone, Check, KeyRound } from "lucide-react";
import { WeddingEvent } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

// Define schema for email settings
const emailSettingsSchema = z.object({
  emailProvider: z.enum(["smtp", "gmail", "outlook", "sendgrid"]),
  smtpServer: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  senderEmail: z.string().email({
    message: "Please enter a valid email address",
  }).optional(),
  senderName: z.string().optional(),
  emailSignature: z.string().optional(),
  enableSSL: z.boolean().default(true),
  oauthConnected: z.boolean().default(false),
});

// Define schema for WhatsApp settings
const whatsappSettingsSchema = z.object({
  enableWhatsapp: z.boolean().default(false),
  whatsappBusinessPhone: z.string().optional(),
  whatsappApiKey: z.string().optional(),
  whatsappTemplatesEnabled: z.boolean().default(false),
});

// Define schema for RSVP follow-up settings
const rsvpFollowupSchema = z.object({
  enableRsvpFollowups: z.boolean().default(true),
  followupTemplateAttending: z.string().optional(),
  followupTemplateDeclined: z.string().optional(),
  followupTemplatePending: z.string().optional(),
  followupDelayDays: z.number().min(1).default(3),
  maxFollowups: z.number().min(1).default(2),
});

// Define combined schema for communication settings
const communicationSchema = z.object({
  emailSettings: emailSettingsSchema,
  whatsappSettings: whatsappSettingsSchema,
  rsvpFollowupSettings: rsvpFollowupSchema,
});

type EmailSettingsData = z.infer<typeof emailSettingsSchema>;
type WhatsappSettingsData = z.infer<typeof whatsappSettingsSchema>;
type RsvpFollowupData = z.infer<typeof rsvpFollowupSchema>;
type CommunicationData = z.infer<typeof communicationSchema>;

interface CommunicationStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: CommunicationData) => void;
  isCompleted: boolean;
}

export default function CommunicationStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted,
}: CommunicationStepProps) {
  // Fetch existing communication settings
  const { 
    data: communicationSettings, 
    isLoading: isLoadingSettings 
  } = useQuery({
    queryKey: [`/api/events/${eventId}/communication-settings`],
    enabled: !!eventId,
  });

  // Test connection state
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState("");

  // Create form
  const form = useForm<CommunicationData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      emailSettings: {
        emailProvider: communicationSettings?.emailProvider || "smtp",
        smtpServer: communicationSettings?.smtpServer || "",
        smtpPort: communicationSettings?.smtpPort || "587",
        smtpUsername: communicationSettings?.smtpUsername || "",
        smtpPassword: communicationSettings?.smtpPassword || "",
        senderEmail: communicationSettings?.senderEmail || "",
        senderName: communicationSettings?.senderName || "",
        emailSignature: communicationSettings?.emailSignature || "",
        enableSSL: communicationSettings?.enableSSL ?? true,
        oauthConnected: communicationSettings?.oauthConnected ?? false,
      },
      whatsappSettings: {
        enableWhatsapp: communicationSettings?.enableWhatsapp || false,
        whatsappBusinessPhone: communicationSettings?.whatsappBusinessPhone || "",
        whatsappApiKey: communicationSettings?.whatsappApiKey || "",
        whatsappTemplatesEnabled: communicationSettings?.whatsappTemplatesEnabled || false,
      },
      rsvpFollowupSettings: {
        enableRsvpFollowups: communicationSettings?.enableRsvpFollowups ?? true,
        followupTemplateAttending: communicationSettings?.followupTemplateAttending || "Thank you for confirming your attendance. We look forward to seeing you!",
        followupTemplateDeclined: communicationSettings?.followupTemplateDeclined || "We're sorry you can't make it. Thank you for letting us know.",
        followupTemplatePending: communicationSettings?.followupTemplatePending || "We haven't heard back from you yet. Please RSVP as soon as possible.",
        followupDelayDays: communicationSettings?.followupDelayDays || 3,
        maxFollowups: communicationSettings?.maxFollowups || 2,
      },
    },
  });

  // Test email connection
  const testEmailConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setStatusMessage("");

    try {
      const emailSettings = form.getValues("emailSettings");
      
      const response = await fetch(`/api/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          ...emailSettings,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setConnectionStatus('success');
        setStatusMessage("Connection successful! Test email sent.");
      } else {
        setConnectionStatus('error');
        setStatusMessage(`Connection failed: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(`Connection failed: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Configure OAuth
  const configureOAuth = (provider: string) => {
    // In a real implementation, this would redirect to OAuth flow
    window.open(`/api/oauth/${provider}/authorize?eventId=${eventId}`, '_blank');
  };

  // Submit handler
  function onSubmit(data: CommunicationData) {
    onComplete(data);
  }

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading communication settings...</p>
      </div>
    );
  }

  const emailProvider = form.watch("emailSettings.emailProvider");
  const enableWhatsapp = form.watch("whatsappSettings.enableWhatsapp");
  const enableRsvpFollowups = form.watch("rsvpFollowupSettings.enableRsvpFollowups");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp Integration</TabsTrigger>
            <TabsTrigger value="followups">RSVP Follow-ups</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Provider Configuration</CardTitle>
                <CardDescription>
                  Configure how emails will be sent to your guests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailSettings.emailProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Provider</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select email provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="smtp">Custom SMTP Server</SelectItem>
                          <SelectItem value="gmail">Gmail</SelectItem>
                          <SelectItem value="outlook">Outlook</SelectItem>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how you want to send emails
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {emailProvider === "smtp" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emailSettings.smtpServer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Server</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., smtp.gmail.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emailSettings.smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., 587" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emailSettings.smtpUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your SMTP username" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emailSettings.smtpPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="Your SMTP password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="emailSettings.enableSSL"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable SSL/TLS</FormLabel>
                            <FormDescription>
                              Use secure connection for email sending
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
                  </>
                )}

                {(emailProvider === "gmail" || emailProvider === "outlook") && (
                  <div className="bg-muted p-4 rounded-lg space-y-4">
                    <div className="flex items-center">
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-medium">
                          {emailProvider === "gmail" ? "Gmail" : "Outlook"} Account Connection
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {form.getValues("emailSettings.oauthConnected") 
                            ? "Your account is connected" 
                            : `Connect your ${emailProvider} account to send emails`}
                        </p>
                      </div>
                      <Button 
                        type="button" 
                        variant={form.getValues("emailSettings.oauthConnected") ? "outline" : "default"}
                        onClick={() => configureOAuth(emailProvider)}
                      >
                        {form.getValues("emailSettings.oauthConnected") ? (
                          <>Reconnect</>
                        ) : (
                          <>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Configure
                          </>
                        )}
                      </Button>
                    </div>
                    {form.getValues("emailSettings.oauthConnected") && (
                      <div className="flex items-center text-sm text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        Connected successfully
                      </div>
                    )}
                  </div>
                )}

                {emailProvider === "sendgrid" && (
                  <FormField
                    control={form.control}
                    name="emailSettings.smtpPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SendGrid API Key</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="Your SendGrid API key" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emailSettings.senderEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., wedding@example.com" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          The email address emails will be sent from
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emailSettings.senderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Sarah & Raj's Wedding" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The name that will appear in guests' inboxes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="emailSettings.emailSignature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Signature</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your email signature..." 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Added to the bottom of all emails
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Test Connection</h4>
                    <p className="text-sm text-muted-foreground">
                      Verify your email configuration works correctly
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {connectionStatus === 'success' && (
                      <p className="text-sm text-green-600">
                        <Check className="inline-block h-4 w-4 mr-1" />
                        {statusMessage}
                      </p>
                    )}
                    {connectionStatus === 'error' && (
                      <p className="text-sm text-red-600">
                        {statusMessage}
                      </p>
                    )}
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={testEmailConnection}
                      disabled={isTestingConnection}
                    >
                      {isTestingConnection ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Test Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Business Integration</CardTitle>
                <CardDescription>
                  Set up WhatsApp messaging for RSVP and guest communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="whatsappSettings.enableWhatsapp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable WhatsApp Integration</FormLabel>
                        <FormDescription>
                          Allow sending messages via WhatsApp Business API
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

                {enableWhatsapp && (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="whatsappSettings.whatsappBusinessPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp Business Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="e.g., +919876543210" 
                                  className="pl-9"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              The WhatsApp Business phone number with country code
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="whatsappSettings.whatsappApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp API Key</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="Your WhatsApp Business API key" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="whatsappSettings.whatsappTemplatesEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Message Templates</FormLabel>
                              <FormDescription>
                                Create and use pre-approved WhatsApp message templates
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
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">WhatsApp Templates</h4>
                        <p className="text-sm text-muted-foreground">
                          Create and manage your WhatsApp message templates
                        </p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline"
                        disabled={!form.getValues("whatsappSettings.whatsappTemplatesEnabled")}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Manage Templates
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followups" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>RSVP Follow-up Settings</CardTitle>
                <CardDescription>
                  Configure automatic follow-up messages for RSVPs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="rsvpFollowupSettings.enableRsvpFollowups"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable RSVP Follow-ups</FormLabel>
                        <FormDescription>
                          Automatically send follow-up messages based on RSVP status
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

                {enableRsvpFollowups && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rsvpFollowupSettings.followupDelayDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow-up Delay (Days)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min={1}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Days to wait before sending follow-up
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rsvpFollowupSettings.maxFollowups"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Follow-ups</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min={1}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum number of follow-up messages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="rsvpFollowupSettings.followupTemplateAttending"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attending Template</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Message for guests who have confirmed attendance..." 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Message for guests who have confirmed attendance
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rsvpFollowupSettings.followupTemplateDeclined"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Declined Template</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Message for guests who have declined..." 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Message for guests who have declined
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rsvpFollowupSettings.followupTemplatePending"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pending Response Template</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Message for guests who haven't responded..." 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Message for guests who haven't responded
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting || isCompleted}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isCompleted ? (
              "Completed"
            ) : (
              "Complete & Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}