import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, CheckCircle2, Mail, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OAuthCredentials {
  // Gmail
  gmailClientId?: string;
  gmailClientSecret?: string;
  gmailRedirectUri?: string;
  gmailAccount?: string;
  // Gmail Direct SMTP (alternative to OAuth)
  useGmailDirectSMTP?: boolean;
  gmailPassword?: string;
  gmailSmtpHost?: string;
  gmailSmtpPort?: number;
  gmailSmtpSecure?: boolean;
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

interface OAuthConfigurationProps {
  settings: any;
  eventId: number | undefined;
}

export default function OAuthConfiguration({ settings, eventId }: OAuthConfigurationProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Define Replit domain for redirects
  const REPLIT_DOMAIN = "https://f6f88cec-f189-42d1-9bbe-d818fd70b49c-00-4k1motpw4fis.worf.replit.dev";
  const DEFAULT_GMAIL_REDIRECT_URI = `${REPLIT_DOMAIN}/api/oauth/gmail/callback`;
  const DEFAULT_OUTLOOK_REDIRECT_URI = `${REPLIT_DOMAIN}/api/oauth/outlook/callback`;
  
  const [credentials, setCredentials] = useState<OAuthCredentials>({
    // Set initial values from the settings if available
    gmailClientId: settings?.gmailClientId || "",
    gmailClientSecret: settings?.gmailClientSecret || "",
    gmailRedirectUri: settings?.gmailRedirectUri || DEFAULT_GMAIL_REDIRECT_URI,
    gmailAccount: settings?.gmailAccount || "",
    
    // Direct SMTP configuration for Gmail
    useGmailDirectSMTP: settings?.useGmailDirectSMTP || false,
    gmailPassword: settings?.gmailPassword || "",
    gmailSmtpHost: settings?.gmailSmtpHost || "smtp.gmail.com",
    gmailSmtpPort: settings?.gmailSmtpPort || 587,
    gmailSmtpSecure: settings?.gmailSmtpSecure || false,

    outlookClientId: settings?.outlookClientId || "",
    outlookClientSecret: settings?.outlookClientSecret || "",
    outlookRedirectUri: settings?.outlookRedirectUri || DEFAULT_OUTLOOK_REDIRECT_URI,

    sendGridApiKey: settings?.sendGridApiKey || "",

    emailFrom: settings?.emailFrom || "",
    emailReplyTo: settings?.emailReplyTo || "",

    useGmail: settings?.useGmail || false,
    useOutlook: settings?.useOutlook || false,
    useSendGrid: settings?.useSendGrid || false,
  });

  const [isConfiguring, setIsConfiguring] = useState({
    gmail: false,
    outlook: false
  });

  // Mutation to update the OAuth credentials
  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: OAuthCredentials) => {
      if (!eventId) throw new Error("Event ID is required");

      const res = await apiRequest(
        "PATCH",
        `/api/event-settings/${eventId}/settings`,
        { oauth: data }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update OAuth credentials");
      }

      return await res.json();
    },
    onSuccess: () => {
      // Determine which providers were enabled
      const enabledProviders = [];
      if (credentials.useGmail) enabledProviders.push("Gmail");
      if (credentials.useOutlook) enabledProviders.push("Outlook");
      if (credentials.useSendGrid) enabledProviders.push("SendGrid");

      const providersText = enabledProviders.length > 0
        ? `Enabled providers: ${enabledProviders.join(", ")}.`
        : "No email providers currently enabled.";

      toast({
        title: "Configuration updated",
        description: `Email provider settings have been saved successfully. ${providersText}`,
      });

      // Provide guidance on next steps if OAuth providers are enabled
      if (credentials.useGmail && hasCredentials("gmail") && !settings?.gmailAccount) {
        toast({
          title: "Gmail Setup Required",
          description: "Gmail credentials saved. Click the 'Configure Gmail OAuth' button to connect your Gmail account.",
        });
      }

      if (credentials.useOutlook && hasCredentials("outlook") && !settings?.outlookAccount) {
        toast({
          title: "Outlook Setup Required",
          description: "Outlook credentials saved. Click the 'Configure Outlook OAuth' button to connect your Outlook account.",
        });
      }

      // Invalidate the settings query to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/event-settings/${eventId}/settings`] });
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

    // Validate the form before submission
    const gmailErrors = credentials.useGmail ? getValidationErrors("gmail") : [];
    const outlookErrors = credentials.useOutlook ? getValidationErrors("outlook") : [];
    const sendGridErrors = credentials.useSendGrid && !credentials.sendGridApiKey ? ["SendGrid API Key is required"] : [];

    const allErrors = [...gmailErrors, ...outlookErrors, ...sendGridErrors];

    if (allErrors.length > 0) {
      toast({
        title: "Validation Errors",
        description: "Please fix the highlighted errors before saving",
        variant: "destructive",
      });
      return;
    }

    // If using both Gmail and Outlook, check if they have complete credentials
    if (credentials.useGmail && credentials.useOutlook) {
      if (!hasCredentials("gmail") || !hasCredentials("outlook")) {
        toast({
          title: "Incomplete Configuration",
          description: "Please complete the credentials for all enabled email providers",
          variant: "destructive",
        });
        return;
      }
    }

    // All validations passed, save the configuration
    updateCredentialsMutation.mutate(credentials);
  };

  // Handle OAuth configuration
  const handleOAuthSetup = async (provider: 'gmail' | 'outlook') => {
    if (!eventId) {
      toast({
        title: "Error",
        description: "Event ID is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsConfiguring(prev => ({ ...prev, [provider]: true }));

      // Get the authorization URL
      const response = await fetch(`/api/oauth/${provider}/authorize?eventId=${eventId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to initiate ${provider} authorization`);
      }

      // Open the authorization URL in a popup
      const authWindow = window.open(
        data.authUrl,
        `${provider}Auth`,
        'width=600,height=700'
      );

      // Poll for completion
      const checkInterval = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkInterval);
          setIsConfiguring(prev => ({ ...prev, [provider]: false }));

          // Refresh settings to show the updated state
          queryClient.invalidateQueries({ queryKey: [`/api/event-settings/${eventId}/settings`] });
        }
      }, 1000);

    } catch (error) {
      console.error(`${provider} OAuth setup error:`, error);
      toast({
        title: `${provider === 'gmail' ? 'Gmail' : 'Outlook'} Configuration Failed`,
        description: error instanceof Error ? error.message : `Failed to configure ${provider}`,
        variant: "destructive"
      });
      setIsConfiguring(prev => ({ ...prev, [provider]: false }));
    }
  };


  // Helper to check if credentials are filled for a service
  const hasCredentials = (service: "gmail" | "outlook") => {
    if (service === "gmail") {
      // Check if we're using direct SMTP
      if (credentials.useGmailDirectSMTP) {
        return !!credentials.gmailPassword;
      } else {
        // Standard OAuth validation
        return !!credentials.gmailClientId && !!credentials.gmailClientSecret;
      }
    } else if (service === "outlook") {
      return !!credentials.outlookClientId && !!credentials.outlookClientSecret;
    }
    return false;
  };

  // Helper to validate redirect URIs
  const validateRedirectUri = (uri: string | undefined): boolean => {
    if (!uri) return true; // Empty is valid (will use default)
    try {
      const url = new URL(uri);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      return false;
    }
  };

  // Get validation errors for display
  const getValidationErrors = (service: "gmail" | "outlook") => {
    const errors: string[] = [];

    if (service === "gmail" && credentials.useGmail) {
      // If using direct SMTP access, we only need the password
      if (credentials.useGmailDirectSMTP) {
        if (!credentials.gmailPassword) {
          errors.push("Gmail password is required when using direct SMTP access");
        }
      } else {
        // Standard OAuth validation
        if (!credentials.gmailClientId) errors.push("Client ID is required");
        if (!credentials.gmailClientSecret) errors.push("Client Secret is required");
        if (credentials.gmailRedirectUri && !validateRedirectUri(credentials.gmailRedirectUri)) {
          errors.push("Redirect URI must be a valid URL with http:// or https:// protocol");
        }
      }
    } else if (service === "outlook" && credentials.useOutlook) {
      if (!credentials.outlookClientId) errors.push("Client ID is required");
      if (!credentials.outlookClientSecret) errors.push("Client Secret is required");
      if (credentials.outlookRedirectUri && !validateRedirectUri(credentials.outlookRedirectUri)) {
        errors.push("Redirect URI must be a valid URL with http:// or https:// protocol");
      }
    }

    return errors;
  };

  // Display connected account info
  const renderConnectedAccount = (provider: "gmail" | "outlook") => {
    const account =
      provider === "gmail"
        ? settings?.gmailAccount
        : provider === "outlook"
          ? settings?.outlookAccount
          : null;

    if (!account) return null;

    // Check for valid connection for Gmail using direct SMTP
    let isConnectionActive = true;
    if (provider === "gmail" && settings?.useGmailDirectSMTP) {
      // For direct SMTP, check if password exists
      isConnectionActive = !!settings?.gmailPassword;
    } else if (provider === "gmail") {
      // For OAuth, check if we have the necessary tokens
      isConnectionActive = !!settings?.gmailRefreshToken && 
        (!!settings?.gmailAccessToken || !!process.env.GMAIL_ACCESS_TOKEN);
    } else if (provider === "outlook") {
      // For Outlook, check if we have the necessary tokens
      isConnectionActive = !!settings?.outlookRefreshToken && 
        (!!settings?.outlookAccessToken || !!process.env.OUTLOOK_ACCESS_TOKEN);
    }

    const statusVariant = isConnectionActive ? "default" : "destructive";
    const statusTitle = isConnectionActive ? "Connected Account" : "Connection Issue";
    const statusIcon = isConnectionActive ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;

    return (
      <Alert className="mt-4" variant={statusVariant}>
        {statusIcon}
        <AlertTitle>{statusTitle}</AlertTitle>
        <AlertDescription>
          {provider.charAt(0).toUpperCase() + provider.slice(1)} {isConnectionActive ? "is connected" : "account exists but may have connection issues"} using{" "}
          <strong>{account}</strong>
          {!isConnectionActive && provider === "gmail" && settings?.useGmailDirectSMTP && (
            <div className="mt-2 text-xs">
              Please check that your Gmail password is correct and that "Less secure app access" is enabled 
              or an app-specific password is being used.
            </div>
          )}
          {!isConnectionActive && !settings?.useGmailDirectSMTP && (
            <div className="mt-2 text-xs">
              The OAuth token may have expired. Try clicking the "Configure {provider === "gmail" ? "Gmail" : "Outlook"} OAuth" button again.
            </div>
          )}
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
        <Alert className="mb-6">
          <AlertTitle>Important OAuth Setup Instructions</AlertTitle>
          <AlertDescription>
            <ol className="list-decimal ml-5 space-y-2">
              <li><strong>First:</strong> Enter your OAuth credentials for either Gmail or Outlook</li>
              <li><strong>Second:</strong> Click the <strong>"Save Configuration"</strong> button at the bottom of this card</li>
              <li><strong>Finally:</strong> Click the <strong>"Configure OAuth"</strong> button to connect your account</li>
            </ol>
          </AlertDescription>
        </Alert>

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

                {credentials.useGmail && !credentials.useGmailDirectSMTP && (
                  <Button
                    type="button"
                    onClick={() => handleOAuthSetup('gmail')}
                    disabled={isConfiguring.gmail || !hasCredentials("gmail") || updateCredentialsMutation.isPending}
                    variant="outline"
                  >
                    {isConfiguring.gmail ? "Configuring..." : "Configure Gmail OAuth"}
                  </Button>
                )}
                
                {credentials.useGmail && credentials.useGmailDirectSMTP && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Using Direct SMTP</span>
                  </div>
                )}
              </div>

              {credentials.useGmail && (
                <div className="space-y-4">
                  {/* Only show OAuth fields if Direct SMTP is NOT enabled */}
                  {!credentials.useGmailDirectSMTP && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gmailClientId">
                            Client ID
                            {getValidationErrors("gmail").includes("Client ID is required") && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          <Input
                            id="gmailClientId"
                            name="gmailClientId"
                            value={credentials.gmailClientId}
                            onChange={handleInputChange}
                            placeholder="Your Gmail OAuth Client ID"
                            className={getValidationErrors("gmail").includes("Client ID is required") ? "border-red-500" : ""}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gmailClientSecret">
                            Client Secret
                            {getValidationErrors("gmail").includes("Client Secret is required") && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          <Input
                            id="gmailClientSecret"
                            name="gmailClientSecret"
                            value={credentials.gmailClientSecret}
                            onChange={handleInputChange}
                            placeholder="Your Gmail OAuth Client Secret"
                            type="password"
                            className={getValidationErrors("gmail").includes("Client Secret is required") ? "border-red-500" : ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gmailRedirectUri">
                          Redirect URI (Required)
                          {getValidationErrors("gmail").includes("Redirect URI must be a valid URL with http:// or https:// protocol") && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          id="gmailRedirectUri"
                          name="gmailRedirectUri"
                          value={credentials.gmailRedirectUri}
                          onChange={handleInputChange}
                          placeholder={DEFAULT_GMAIL_REDIRECT_URI}
                          className={getValidationErrors("gmail").includes("Redirect URI must be a valid URL with http:// or https:// protocol") ? "border-red-500" : ""}
                        />
                        <p className="text-sm text-text-muted">
                          Copy and paste exactly this URL to your Google Cloud Console Authorized Redirect URIs: <strong>{DEFAULT_GMAIL_REDIRECT_URI}</strong>
                        </p>
                      </div>
                    </>
                  )}

                  {/* Direct SMTP Access Option */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Switch
                        id="useGmailDirectSMTP"
                        name="useGmailDirectSMTP"
                        checked={credentials.useGmailDirectSMTP}
                        onCheckedChange={(checked) =>
                          setCredentials((prev) => ({ ...prev, useGmailDirectSMTP: checked }))
                        }
                      />
                      <Label htmlFor="useGmailDirectSMTP">Use Direct SMTP Access (Alternative to OAuth)</Label>
                    </div>
                    
                    {credentials.useGmailDirectSMTP && (
                      <div className="space-y-4">
                        <Alert>
                          <AlertTitle className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Direct SMTP Access
                          </AlertTitle>
                          <AlertDescription>
                            <p className="mb-2">This option lets you use your Gmail password directly for sending emails instead of OAuth.</p>
                            <p className="mb-2"><strong>Important:</strong> For this to work, you must enable "Less secure app access" in your Google account settings or create an app password.</p>
                            <p>This method is less secure but more reliable in certain environments.</p>
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                          <Label htmlFor="gmailAccount">
                            Gmail Account (Email Address)
                          </Label>
                          <Input
                            id="gmailAccount"
                            name="gmailAccount"
                            value={credentials.gmailAccount}
                            onChange={handleInputChange}
                            placeholder="your.email@gmail.com"
                            type="email"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="gmailPassword">
                            Gmail Password or App Password
                          </Label>
                          <Input
                            id="gmailPassword"
                            name="gmailPassword"
                            value={credentials.gmailPassword}
                            onChange={handleInputChange}
                            placeholder="Your Gmail password or app password"
                            type="password"
                          />
                          <p className="text-sm text-muted-foreground">
                            For better security, we recommend using an app-specific password generated in your Google Account.
                          </p>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Advanced SMTP Settings (Optional)</h4>
                          <p className="text-xs text-muted-foreground mb-4">
                            These settings are pre-configured for Gmail. Only change them if you know what you're doing.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="gmailSmtpHost">SMTP Server Host</Label>
                              <Input
                                id="gmailSmtpHost"
                                name="gmailSmtpHost"
                                value={credentials.gmailSmtpHost || "smtp.gmail.com"}
                                onChange={handleInputChange}
                                placeholder="smtp.gmail.com"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="gmailSmtpPort">SMTP Server Port</Label>
                              <Input
                                id="gmailSmtpPort"
                                name="gmailSmtpPort"
                                value={credentials.gmailSmtpPort || 587}
                                onChange={handleInputChange}
                                type="number"
                                placeholder="587"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center space-x-2">
                            <Switch
                              id="gmailSmtpSecure"
                              name="gmailSmtpSecure"
                              checked={credentials.gmailSmtpSecure || false}
                              onCheckedChange={(checked) =>
                                setCredentials((prev) => ({ ...prev, gmailSmtpSecure: checked }))
                              }
                            />
                            <Label htmlFor="gmailSmtpSecure">Use SSL/TLS (Port 465)</Label>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help ml-1" 
                              title="Enable for SSL (port 465), disable for STARTTLS (port 587)" />
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            If you enable SSL/TLS, change the port to 465. For STARTTLS, use port 587 (recommended).
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {renderConnectedAccount("gmail")}

                  {getValidationErrors("gmail").length > 0 && (
                    <div className="text-red-500 text-sm">
                      {getValidationErrors("gmail").map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  )}
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

                {credentials.useOutlook && (
                  <Button
                    type="button"
                    onClick={() => handleOAuthSetup('outlook')}
                    disabled={isConfiguring.outlook || !hasCredentials("outlook") || updateCredentialsMutation.isPending}
                    variant="outline"
                  >
                    {isConfiguring.outlook ? "Configuring..." : "Configure Outlook OAuth"}
                  </Button>
                )}
              </div>

              {credentials.useOutlook && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="outlookClientId">
                        Client ID
                        {getValidationErrors("outlook").includes("Client ID is required") && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <Input
                        id="outlookClientId"
                        name="outlookClientId"
                        value={credentials.outlookClientId}
                        onChange={handleInputChange}
                        placeholder="Your Outlook OAuth Client ID"
                        className={getValidationErrors("outlook").includes("Client ID is required") ? "border-red-500" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outlookClientSecret">
                        Client Secret
                        {getValidationErrors("outlook").includes("Client Secret is required") && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <Input
                        id="outlookClientSecret"
                        name="outlookClientSecret"
                        value={credentials.outlookClientSecret}
                        onChange={handleInputChange}
                        placeholder="Your Outlook OAuth Client Secret"
                        type="password"
                        className={getValidationErrors("outlook").includes("Client Secret is required") ? "border-red-500" : ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outlookRedirectUri">
                      Redirect URI (Required)
                      {getValidationErrors("outlook").includes("Redirect URI must be a valid URL with http:// or https:// protocol") && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <Input
                      id="outlookRedirectUri"
                      name="outlookRedirectUri"
                      value={credentials.outlookRedirectUri}
                      onChange={handleInputChange}
                      placeholder={DEFAULT_OUTLOOK_REDIRECT_URI}
                      className={getValidationErrors("outlook").includes("Redirect URI must be a valid URL with http:// or https:// protocol") ? "border-red-500" : ""}
                    />
                    <p className="text-sm text-text-muted">
                      Copy and paste exactly this URL to your Microsoft Azure Portal Redirect URIs: <strong>{DEFAULT_OUTLOOK_REDIRECT_URI}</strong>
                    </p>
                  </div>

                  {renderConnectedAccount("outlook")}

                  {getValidationErrors("outlook").length > 0 && (
                    <div className="text-red-500 text-sm">
                      {getValidationErrors("outlook").map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  )}
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
                <div className="space-y-2">
                  <Label htmlFor="sendGridApiKey">
                    API Key
                    {credentials.useSendGrid && !credentials.sendGridApiKey && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    id="sendGridApiKey"
                    name="sendGridApiKey"
                    value={credentials.sendGridApiKey}
                    onChange={handleInputChange}
                    placeholder="Your SendGrid API Key"
                    type="password"
                    className={credentials.useSendGrid && !credentials.sendGridApiKey ? "border-red-500" : ""}
                  />
                  <p className="text-sm text-gray-500">
                    Generate an API key with at least "Mail Send" permissions from your SendGrid account.
                  </p>

                  {credentials.useSendGrid && !credentials.sendGridApiKey && (
                    <div className="text-red-500 text-sm mt-2">
                      SendGrid API Key is required when SendGrid is enabled
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={updateCredentialsMutation.isPending}
              className="w-full md:w-auto"
            >
              {updateCredentialsMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}