import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Copy, Check, Mail, Send } from "lucide-react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

interface OAuthConfigurationProps {
  eventId: number;
}

// Define Zod schema for OAuth configuration
const gmailConfigSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
});

const outlookConfigSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
});

export default function OAuthConfiguration({ eventId }: OAuthConfigurationProps) {
  const { toast } = useToast();
  
  // States for OAuth provider status
  const [gmailConfigured, setGmailConfigured] = useState(false);
  const [outlookConfigured, setOutlookConfigured] = useState(false);
  const [gmailClientId, setGmailClientId] = useState<string | null>(null);
  const [outlookClientId, setOutlookClientId] = useState<string | null>(null);
  const [gmailCopied, setGmailCopied] = useState(false);
  const [outlookCopied, setOutlookCopied] = useState(false);
  
  // Setup forms
  const gmailForm = useForm<z.infer<typeof gmailConfigSchema>>({
    resolver: zodResolver(gmailConfigSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
    },
  });
  
  const outlookForm = useForm<z.infer<typeof outlookConfigSchema>>({
    resolver: zodResolver(outlookConfigSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
    },
  });
  
  // Check Gmail configuration status
  const { data: gmailStatus, isLoading: isLoadingGmail } = useQuery({
    queryKey: ['/api/oauth-config/gmail/status', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/oauth-config/gmail/status?eventId=${eventId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Gmail configuration status');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isConfigured) {
        setGmailConfigured(true);
      }
      if (data.clientId) {
        setGmailClientId(data.clientId);
        gmailForm.setValue('clientId', data.clientId);
      }
      if (data.hasClientSecret) {
        gmailForm.setValue('clientSecret', '••••••••••••••••••••••••');
      }
    },
    onError: (error) => {
      console.error('Error fetching Gmail configuration:', error);
    }
  });
  
  // Check Outlook configuration status
  const { data: outlookStatus, isLoading: isLoadingOutlook } = useQuery({
    queryKey: ['/api/oauth-config/outlook/status', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/oauth-config/outlook/status?eventId=${eventId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Outlook configuration status');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isConfigured) {
        setOutlookConfigured(true);
      }
      if (data.clientId) {
        setOutlookClientId(data.clientId);
        outlookForm.setValue('clientId', data.clientId);
      }
      if (data.hasClientSecret) {
        outlookForm.setValue('clientSecret', '••••••••••••••••••••••••');
      }
    },
    onError: (error) => {
      console.error('Error fetching Outlook configuration:', error);
    }
  });
  
  // Save Gmail OAuth credentials mutation
  const saveGmailMutation = useMutation({
    mutationFn: async (data: z.infer<typeof gmailConfigSchema>) => {
      const response = await apiRequest('POST', `/api/oauth-config/gmail/save?eventId=${eventId}`, {
        ...data,
        provider: 'gmail',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Gmail OAuth Configured',
        description: 'Gmail OAuth credentials saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-config/gmail/status', eventId] });
      setGmailConfigured(true);
    },
    onError: (error) => {
      toast({
        title: 'Configuration Failed',
        description: error instanceof Error ? error.message : 'Failed to save Gmail credentials',
        variant: 'destructive',
      });
    },
  });
  
  // Save Outlook OAuth credentials mutation
  const saveOutlookMutation = useMutation({
    mutationFn: async (data: z.infer<typeof outlookConfigSchema>) => {
      const response = await apiRequest('POST', `/api/oauth-config/outlook/save?eventId=${eventId}`, {
        ...data,
        provider: 'outlook',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Outlook OAuth Configured',
        description: 'Outlook OAuth credentials saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-config/outlook/status', eventId] });
      setOutlookConfigured(true);
    },
    onError: (error) => {
      toast({
        title: 'Configuration Failed',
        description: error instanceof Error ? error.message : 'Failed to save Outlook credentials',
        variant: 'destructive',
      });
    },
  });
  
  // Handle Gmail form submission
  const onGmailSubmit = (data: z.infer<typeof gmailConfigSchema>) => {
    // Skip if the client secret is masked
    if (data.clientSecret === '••••••••••••••••••••••••') {
      toast({
        title: 'No Changes Made',
        description: 'Client secret was not updated. Please enter a new value to update.',
      });
      return;
    }
    
    saveGmailMutation.mutate(data);
  };
  
  // Handle Outlook form submission
  const onOutlookSubmit = (data: z.infer<typeof outlookConfigSchema>) => {
    // Skip if the client secret is masked
    if (data.clientSecret === '••••••••••••••••••••••••') {
      toast({
        title: 'No Changes Made',
        description: 'Client secret was not updated. Please enter a new value to update.',
      });
      return;
    }
    
    saveOutlookMutation.mutate(data);
  };
  
  // Handle copying redirect URI to clipboard
  const handleCopyRedirectUri = (provider: 'gmail' | 'outlook') => {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/api/oauth/${provider}/callback`;
    
    navigator.clipboard.writeText(redirectUri).then(() => {
      if (provider === 'gmail') {
        setGmailCopied(true);
        setTimeout(() => setGmailCopied(false), 2000);
      } else {
        setOutlookCopied(true);
        setTimeout(() => setOutlookCopied(false), 2000);
      }
      
      toast({
        title: 'Copied to Clipboard',
        description: `Redirect URI for ${provider === 'gmail' ? 'Gmail' : 'Outlook'} copied`,
      });
    });
  };
  
  return (
    <div className="space-y-8">
      <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-500">Important Configuration Instructions</AlertTitle>
        <AlertDescription>
          <p>OAuth credentials must be configured here <strong>before</strong> attempting to authorize Gmail or Outlook accounts in the RSVP Follow-up section.</p>
        </AlertDescription>
      </Alert>
      
      {/* Gmail OAuth Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-red-500" /> Gmail OAuth Configuration
          </CardTitle>
          <CardDescription>
            Configure your Google Cloud OAuth credentials for Gmail integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...gmailForm}>
            <form onSubmit={gmailForm.handleSubmit(onGmailSubmit)} className="space-y-6">
              <FormField
                control={gmailForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Gmail Client ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Client ID from your Google Cloud OAuth credentials
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={gmailForm.control}
                name="clientSecret"
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
                      Client Secret from your Google Cloud OAuth credentials
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <Label>Redirect URI</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    readOnly
                    value={`${window.location.origin}/api/oauth/gmail/callback`}
                    className="font-mono text-xs bg-muted"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyRedirectUri('gmail')}
                  >
                    {gmailCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Use this URI in your Google Cloud OAuth Consent Screen
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saveGmailMutation.isPending}
                  className="gold-gradient"
                >
                  {saveGmailMutation.isPending 
                    ? "Saving..." 
                    : gmailConfigured 
                      ? "Update Gmail OAuth" 
                      : "Save Gmail OAuth"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="bg-muted/50 flex justify-between">
          <div className="text-sm text-muted-foreground">
            Status: {gmailConfigured 
              ? <span className="text-green-600 font-medium">Configured</span> 
              : <span className="text-amber-600 font-medium">Not Configured</span>
            }
          </div>
          
          {gmailConfigured && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-green-600 border-green-600"
            >
              <Check className="h-4 w-4 mr-2" /> 
              Credentials Saved
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Outlook OAuth Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-500" /> Outlook OAuth Configuration
          </CardTitle>
          <CardDescription>
            Configure your Microsoft Azure OAuth credentials for Outlook integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...outlookForm}>
            <form onSubmit={outlookForm.handleSubmit(onOutlookSubmit)} className="space-y-6">
              <FormField
                control={outlookForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Outlook Client ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Client ID from your Microsoft Azure Application Registration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={outlookForm.control}
                name="clientSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Secret</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your Outlook Client Secret" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Client Secret from your Microsoft Azure Application Registration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <Label>Redirect URI</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    readOnly
                    value={`${window.location.origin}/api/oauth/outlook/callback`}
                    className="font-mono text-xs bg-muted"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyRedirectUri('outlook')}
                  >
                    {outlookCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Use this URI in your Microsoft Azure Application Registration
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saveOutlookMutation.isPending}
                  className="gold-gradient"
                >
                  {saveOutlookMutation.isPending 
                    ? "Saving..." 
                    : outlookConfigured 
                      ? "Update Outlook OAuth" 
                      : "Save Outlook OAuth"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="bg-muted/50 flex justify-between">
          <div className="text-sm text-muted-foreground">
            Status: {outlookConfigured 
              ? <span className="text-green-600 font-medium">Configured</span> 
              : <span className="text-amber-600 font-medium">Not Configured</span>
            }
          </div>
          
          {outlookConfigured && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-green-600 border-green-600"
            >
              <Check className="h-4 w-4 mr-2" /> 
              Credentials Saved
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}