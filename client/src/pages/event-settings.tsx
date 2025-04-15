import { useState } from "react";
import { useLocation } from "wouter";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormDescription
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  ExternalLink, 
  Mail
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Form schema for OAuth configurations
const oauthFormSchema = z.object({
  // Gmail settings
  gmailClientId: z.string().optional(),
  gmailClientSecret: z.string().optional(),
  gmailRedirectUri: z.string().url("Please enter a valid URL").optional(),
  
  // Outlook settings
  outlookClientId: z.string().optional(),
  outlookClientSecret: z.string().optional(),
  outlookRedirectUri: z.string().url("Please enter a valid URL").optional(),
});

type OAuthFormValues = z.infer<typeof oauthFormSchema>;

export default function EventSettingsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { currentEvent, currentEventId } = useCurrentEvent();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("oauth");

  // If there's no event selected, redirect to events page
  if (!currentEventId) {
    navigate("/events");
    return null;
  }

  // Fetch current event settings
  const { data: eventSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: [`/api/events/${currentEventId}`],
    enabled: !!currentEventId,
  });

  // Form to handle OAuth settings
  const oauthForm = useForm<OAuthFormValues>({
    resolver: zodResolver(oauthFormSchema),
    defaultValues: {
      gmailClientId: eventSettings?.gmailClientId || "",
      gmailClientSecret: eventSettings?.gmailClientSecret || "",
      gmailRedirectUri: eventSettings?.gmailRedirectUri || window.location.origin + "/api/oauth/gmail/callback",
      outlookClientId: eventSettings?.outlookClientId || "",
      outlookClientSecret: eventSettings?.outlookClientSecret || "",
      outlookRedirectUri: eventSettings?.outlookRedirectUri || window.location.origin + "/api/oauth/outlook/callback",
    }
  });

  // Update form when event settings are loaded
  if (eventSettings && !isLoadingSettings && !oauthForm.formState.isDirty) {
    oauthForm.reset({
      gmailClientId: eventSettings.gmailClientId || "",
      gmailClientSecret: eventSettings.gmailClientSecret || "",
      gmailRedirectUri: eventSettings.gmailRedirectUri || window.location.origin + "/api/oauth/gmail/callback",
      outlookClientId: eventSettings.outlookClientId || "",
      outlookClientSecret: eventSettings.outlookClientSecret || "",
      outlookRedirectUri: eventSettings.outlookRedirectUri || window.location.origin + "/api/oauth/outlook/callback",
    });
  }

  // Mutation to update OAuth settings
  const { mutate: updateOAuthSettings, isPending: isUpdatingOAuth } = useMutation({
    mutationFn: async (values: OAuthFormValues) => {
      const response = await apiRequest(
        "PATCH",
        `/api/events/${currentEventId}/oauth-config`,
        values
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "OAuth configuration has been saved successfully.",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: [`/api/events/${currentEventId}`] 
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: "There was an error saving your OAuth configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmitOAuthForm = (values: OAuthFormValues) => {
    updateOAuthSettings(values);
  };

  // Check OAuth connection status
  const { data: gmailStatus, isLoading: isLoadingGmailStatus } = useQuery({
    queryKey: [`/api/oauth/status/gmail`, currentEventId],
    enabled: !!currentEventId,
  });

  const { data: outlookStatus, isLoading: isLoadingOutlookStatus } = useQuery({
    queryKey: [`/api/oauth/status/outlook`, currentEventId],
    enabled: !!currentEventId,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2"
          onClick={() => navigate("/events")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-playfair">Event Settings</h1>
          <p className="text-muted-foreground">
            Configure settings for {currentEvent?.title || "your event"}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="oauth">
            <Mail className="h-4 w-4 mr-2" />
            OAuth Configuration
          </TabsTrigger>
          {/* Additional settings tabs can be added here */}
        </TabsList>

        <TabsContent value="oauth">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Configuration</CardTitle>
              <CardDescription>
                Configure OAuth credentials for email services. These settings allow you
                to send personalized emails from your Gmail or Outlook account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Setup Information</AlertTitle>
                <AlertDescription>
                  To use OAuth with Gmail or Outlook, you need to set up a project in Google Cloud Console
                  or Microsoft Azure Portal to obtain your client ID and client secret. Make sure to set the 
                  redirect URIs exactly as shown below.
                </AlertDescription>
              </Alert>

              <Form {...oauthForm}>
                <form onSubmit={oauthForm.handleSubmit(onSubmitOAuthForm)} className="space-y-8">
                  {/* Gmail Configuration */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Gmail Configuration</h3>
                      {isLoadingGmailStatus ? (
                        <Skeleton className="h-6 w-24" />
                      ) : gmailStatus?.connected ? (
                        <div className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">Not connected</div>
                      )}
                    </div>
                    
                    <FormField
                      control={oauthForm.control}
                      name="gmailClientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your Gmail Client ID" {...field} />
                          </FormControl>
                          <FormDescription>
                            From the Google Cloud Console
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={oauthForm.control}
                      name="gmailClientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your Gmail Client Secret"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            From the Google Cloud Console
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={oauthForm.control}
                      name="gmailRedirectUri"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Redirect URI</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Add this exact URL to your authorized redirect URIs in Google Cloud Console
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex items-center"
                        onClick={() => window.open("https://console.cloud.google.com/", "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Google Cloud Console
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Outlook Configuration */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Outlook/Microsoft Configuration</h3>
                      {isLoadingOutlookStatus ? (
                        <Skeleton className="h-6 w-24" />
                      ) : outlookStatus?.connected ? (
                        <div className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">Not connected</div>
                      )}
                    </div>
                    
                    <FormField
                      control={oauthForm.control}
                      name="outlookClientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your Microsoft Client ID" {...field} />
                          </FormControl>
                          <FormDescription>
                            From the Microsoft Azure Portal
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={oauthForm.control}
                      name="outlookClientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your Microsoft Client Secret"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            From the Microsoft Azure Portal
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={oauthForm.control}
                      name="outlookRedirectUri"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Redirect URI</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Add this exact URL to your authorized redirect URIs in Microsoft Azure Portal
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex items-center"
                        onClick={() => window.open("https://portal.azure.com/", "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Microsoft Azure Portal
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isUpdatingOAuth}>
                    {isUpdatingOAuth ? "Saving..." : "Save OAuth Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}