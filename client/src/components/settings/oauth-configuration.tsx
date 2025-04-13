import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface OAuthCredentials {
  // Gmail
  gmailClientId?: string;
  gmailClientSecret?: string;
  gmailRedirectUri?: string;
  // Outlook
  outlookClientId?: string;
  outlookClientSecret?: string;
  outlookRedirectUri?: string;
  // SendGrid
  sendGridApiKey?: string;
  // General email settings
  emailFrom?: string;
  emailReplyTo?: string;
  // Provider flags
  useGmail?: boolean;
  useOutlook?: boolean;
  useSendGrid?: boolean;
}

export const OAuthConfiguration = () => {
  const { currentEvent, refetchCurrentEvent } = useCurrentEvent();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [credentials, setCredentials] = useState<OAuthCredentials>({
    // Set initial values from the event if available
    gmailClientId: currentEvent?.gmailClientId || "",
    gmailClientSecret: currentEvent?.gmailClientSecret || "",
    gmailRedirectUri: currentEvent?.gmailRedirectUri || "",
    
    outlookClientId: currentEvent?.outlookClientId || "",
    outlookClientSecret: currentEvent?.outlookClientSecret || "",
    outlookRedirectUri: currentEvent?.outlookRedirectUri || "",
    
    sendGridApiKey: currentEvent?.sendGridApiKey || "",
    
    emailFrom: currentEvent?.emailFrom || "",
    emailReplyTo: currentEvent?.emailReplyTo || "",
    
    useGmail: currentEvent?.useGmail || false,
    useOutlook: currentEvent?.useOutlook || false,
    useSendGrid: currentEvent?.useSendGrid || false,
  });
  
  const [isConnecting, setIsConnecting] = useState({
    gmail: false,
    outlook: false,
  });
  
  // Mutation to update the event's OAuth credentials
  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: OAuthCredentials) => {
      const res = await apiRequest(
        "PATCH",
        `/api/events/${currentEvent?.id}/oauth-config`,
        data
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update credentials");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration updated",
        description: "Email provider settings have been saved successfully.",
      });
      
      // Invalidate the current event query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/current-event"] });
      refetchCurrentEvent();
    },
    onError: (error) => {
      toast({
        title: "Failed to update configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setCredentials((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCredentialsMutation.mutate(credentials);
  };
  
  // Start OAuth process for Gmail
  const initiateGmailAuth = async () => {
    if (!currentEvent?.id) return;
    
    setIsConnecting({ ...isConnecting, gmail: true });
    
    try {
      const res = await apiRequest(
        "GET",
        `/api/oauth/gmail/authorize?eventId=${currentEvent.id}`,
        null
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to initiate Gmail authentication");
      }
      
      const data = await res.json();
      
      // Open the authorization URL in a new window
      window.open(data.authUrl, "GmailAuth", "width=600,height=700");
    } catch (error) {
      toast({
        title: "Gmail Authentication Error",
        description: error instanceof Error ? error.message : "An error occurred during Gmail authentication",
        variant: "destructive",
      });
    } finally {
      setIsConnecting({ ...isConnecting, gmail: false });
    }
  };
  
  // Start OAuth process for Outlook
  const initiateOutlookAuth = async () => {
    if (!event?.id) return;
    
    setIsConnecting({ ...isConnecting, outlook: true });
    
    try {
      const res = await apiRequest(
        "GET",
        `/api/oauth/outlook/authorize?eventId=${event.id}`,
        null
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to initiate Outlook authentication");
      }
      
      const data = await res.json();
      
      // Open the authorization URL in a new window
      window.open(data.authUrl, "OutlookAuth", "width=600,height=700");
    } catch (error) {
      toast({
        title: "Outlook Authentication Error",
        description: error instanceof Error ? error.message : "An error occurred during Outlook authentication",
        variant: "destructive",
      });
    } finally {
      setIsConnecting({ ...isConnecting, outlook: false });
    }
  };
  
  // Helper to check if credentials are filled for a service
  const hasCredentials = (service: "gmail" | "outlook") => {
    if (service === "gmail") {
      return !!credentials.gmailClientId && !!credentials.gmailClientSecret;
    } else if (service === "outlook") {
      return !!credentials.outlookClientId && !!credentials.outlookClientSecret;
    }
    return false;
  };
  
  // Display connected account info
  const renderConnectedAccount = (provider: "gmail" | "outlook") => {
    const account = 
      provider === "gmail" 
        ? event?.gmailAccount 
        : provider === "outlook"
        ? event?.outlookAccount
        : null;
      
    if (!account) return null;
    
    return (
      <Alert className="mt-4">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Connected Account</AlertTitle>
        <AlertDescription>
          {provider.charAt(0).toUpperCase() + provider.slice(1)} is connected using{" "}
          <strong>{account}</strong>
        </AlertDescription>
      </Alert>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Provider Configuration</CardTitle>
        <CardDescription>
          Configure your OAuth credentials and email providers for sending communications
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailFrom">From Email Address</Label>
                <Input
                  id="emailFrom"
                  name="emailFrom"
                  value={credentials.emailFrom}
                  onChange={handleInputChange}
                  placeholder="noreply@yourdomain.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailReplyTo">Reply-To Email Address</Label>
                <Input
                  id="emailReplyTo"
                  name="emailReplyTo"
                  value={credentials.emailReplyTo}
                  onChange={handleInputChange}
                  placeholder="contact@yourdomain.com"
                />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="gmail" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gmail">Gmail</TabsTrigger>
              <TabsTrigger value="outlook">Outlook</TabsTrigger>
              <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
            </TabsList>
            
            {/* Gmail Configuration */}
            <TabsContent value="gmail" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="useGmail"
                    name="useGmail"
                    checked={credentials.useGmail}
                    onCheckedChange={(checked) => 
                      setCredentials((prev) => ({ ...prev, useGmail: checked }))
                    }
                  />
                  <Label htmlFor="useGmail">Use Gmail for sending emails</Label>
                </div>
                
                {hasCredentials("gmail") && (
                  <Button 
                    type="button" 
                    onClick={initiateGmailAuth}
                    disabled={isConnecting.gmail || !credentials.useGmail}
                    variant="outline"
                  >
                    {isConnecting.gmail ? "Connecting..." : "Configure Gmail OAuth"}
                  </Button>
                )}
              </div>
              
              {credentials.useGmail && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gmailClientId">Client ID</Label>
                    <Input
                      id="gmailClientId"
                      name="gmailClientId"
                      value={credentials.gmailClientId}
                      onChange={handleInputChange}
                      placeholder="Enter your Gmail OAuth Client ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gmailClientSecret">Client Secret</Label>
                    <Input
                      id="gmailClientSecret"
                      name="gmailClientSecret"
                      type="password"
                      value={credentials.gmailClientSecret}
                      onChange={handleInputChange}
                      placeholder="Enter your Gmail OAuth Client Secret"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gmailRedirectUri">Redirect URI (Optional)</Label>
                    <Input
                      id="gmailRedirectUri"
                      name="gmailRedirectUri"
                      value={credentials.gmailRedirectUri}
                      onChange={handleInputChange}
                      placeholder="http://localhost:5000/api/oauth/gmail/callback"
                    />
                    <p className="text-sm text-muted-foreground">
                      Leave blank to use the default redirect URI
                    </p>
                  </div>
                  
                  {!hasCredentials("gmail") && credentials.useGmail && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Required Fields</AlertTitle>
                      <AlertDescription>
                        Please enter your Gmail Client ID and Client Secret before configuring OAuth.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {renderConnectedAccount("gmail")}
                </div>
              )}
            </TabsContent>
            
            {/* Outlook Configuration */}
            <TabsContent value="outlook" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="useOutlook"
                    name="useOutlook"
                    checked={credentials.useOutlook}
                    onCheckedChange={(checked) => 
                      setCredentials((prev) => ({ ...prev, useOutlook: checked }))
                    }
                  />
                  <Label htmlFor="useOutlook">Use Outlook for sending emails</Label>
                </div>
                
                {hasCredentials("outlook") && (
                  <Button 
                    type="button" 
                    onClick={initiateOutlookAuth}
                    disabled={isConnecting.outlook || !credentials.useOutlook}
                    variant="outline"
                  >
                    {isConnecting.outlook ? "Connecting..." : "Configure Outlook OAuth"}
                  </Button>
                )}
              </div>
              
              {credentials.useOutlook && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="outlookClientId">Client ID</Label>
                    <Input
                      id="outlookClientId"
                      name="outlookClientId"
                      value={credentials.outlookClientId}
                      onChange={handleInputChange}
                      placeholder="Enter your Outlook OAuth Client ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="outlookClientSecret">Client Secret</Label>
                    <Input
                      id="outlookClientSecret"
                      name="outlookClientSecret"
                      type="password"
                      value={credentials.outlookClientSecret}
                      onChange={handleInputChange}
                      placeholder="Enter your Outlook OAuth Client Secret"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="outlookRedirectUri">Redirect URI (Optional)</Label>
                    <Input
                      id="outlookRedirectUri"
                      name="outlookRedirectUri"
                      value={credentials.outlookRedirectUri}
                      onChange={handleInputChange}
                      placeholder="http://localhost:5000/api/oauth/outlook/callback"
                    />
                    <p className="text-sm text-muted-foreground">
                      Leave blank to use the default redirect URI
                    </p>
                  </div>
                  
                  {!hasCredentials("outlook") && credentials.useOutlook && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Required Fields</AlertTitle>
                      <AlertDescription>
                        Please enter your Outlook Client ID and Client Secret before configuring OAuth.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {renderConnectedAccount("outlook")}
                </div>
              )}
            </TabsContent>
            
            {/* SendGrid Configuration */}
            <TabsContent value="sendgrid" className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="useSendGrid"
                  name="useSendGrid"
                  checked={credentials.useSendGrid}
                  onCheckedChange={(checked) => 
                    setCredentials((prev) => ({ ...prev, useSendGrid: checked }))
                  }
                />
                <Label htmlFor="useSendGrid">Use SendGrid for sending emails</Label>
              </div>
              
              {credentials.useSendGrid && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sendGridApiKey">SendGrid API Key</Label>
                    <Input
                      id="sendGridApiKey"
                      name="sendGridApiKey"
                      type="password"
                      value={credentials.sendGridApiKey}
                      onChange={handleInputChange}
                      placeholder="Enter your SendGrid API Key"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" type="button" onClick={() => refetchEvent()}>
          Reset
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={updateCredentialsMutation.isPending}
        >
          {updateCredentialsMutation.isPending ? "Saving..." : "Save Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OAuthConfiguration;