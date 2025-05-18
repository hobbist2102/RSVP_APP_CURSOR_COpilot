import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// WhatsApp provider options
enum WhatsAppProvider {
  WebJS = 'webjs',
  BusinessAPI = 'business-api'
}

interface WhatsAppSetupStepProps {
  eventId: number;
  onComplete: () => void;
  onBack: () => void;
}

const WhatsAppSetupStep: React.FC<WhatsAppSetupStepProps> = ({ eventId, onComplete, onBack }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for form
  const [useWhatsApp, setUseWhatsApp] = useState(false);
  const [provider, setProvider] = useState<WhatsAppProvider>(WhatsAppProvider.WebJS);
  const [activeTab, setActiveTab] = useState('setup');
  const [businessApiKey, setBusinessApiKey] = useState('');
  const [businessPhoneNumberId, setBusinessPhoneNumberId] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from Eternally Yours.');
  
  // Get event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/events/${eventId}`);
      return response.json();
    },
    enabled: !!eventId
  });
  
  // Get WhatsApp status
  const { data: whatsappStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: [`/api/whatsapp/events/${eventId}/status`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/whatsapp/events/${eventId}/status`);
      return response.json();
    },
    refetchInterval: activeTab === 'setup' ? 5000 : false, // Poll for status updates when in setup tab
    enabled: !!eventId
  });
  
  // Get QR code for Web.js
  const { data: qrData, isLoading: qrLoading, refetch: refetchQr } = useQuery({
    queryKey: [`/api/whatsapp/events/${eventId}/qrcode`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/whatsapp/events/${eventId}/qrcode`);
      return response.json();
    },
    refetchInterval: provider === WhatsAppProvider.WebJS && activeTab === 'setup' ? 10000 : false, // Poll for QR code updates
    enabled: !!eventId && provider === WhatsAppProvider.WebJS && activeTab === 'setup'
  });
  
  // Initialize WhatsApp
  const initializeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/whatsapp/events/${eventId}/initialize`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'WhatsApp initialized',
        description: 'WhatsApp service initialization started successfully.',
      });
      refetchStatus();
      if (provider === WhatsAppProvider.WebJS) {
        refetchQr();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error initializing WhatsApp',
        description: error.message || 'Failed to initialize WhatsApp service',
        variant: 'destructive',
      });
    },
  });
  
  // Update provider
  const updateProviderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/whatsapp/provider`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'WhatsApp provider updated',
        description: 'WhatsApp provider has been updated successfully.',
      });
      refetchStatus();
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating provider',
        description: error.message || 'Failed to update WhatsApp provider',
        variant: 'destructive',
      });
    },
  });
  
  // Update event WhatsApp configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/whatsapp/events/${eventId}/config`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Configuration saved',
        description: 'WhatsApp configuration has been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error saving configuration',
        description: error.message || 'Failed to save WhatsApp configuration',
        variant: 'destructive',
      });
    },
  });
  
  // Send test message
  const sendTestMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/whatsapp/events/${eventId}/send`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Test message sent',
        description: 'WhatsApp test message has been sent successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending message',
        description: error.message || 'Failed to send test message',
        variant: 'destructive',
      });
    },
  });
  
  // Load settings from event when data is available
  useEffect(() => {
    if (event) {
      setUseWhatsApp(!!event.whatsappConfigured);
      setBusinessApiKey(event.whatsappAccessToken || '');
      setBusinessPhoneNumberId(event.whatsappBusinessPhoneId || '');
      setBusinessNumber(event.whatsappBusinessNumber || '');
      setBusinessAccountId(event.whatsappBusinessAccountId || '');
    }
  }, [event]);
  
  // Update provider when whatsappStatus changes
  useEffect(() => {
    if (whatsappStatus && whatsappStatus.provider) {
      setProvider(whatsappStatus.provider);
    }
  }, [whatsappStatus]);
  
  // Handle provider change
  const handleProviderChange = (value: WhatsAppProvider) => {
    setProvider(value);
    updateProviderMutation.mutate({
      provider: value,
      apiKey: value === WhatsAppProvider.BusinessAPI ? businessApiKey : undefined,
      phoneNumberId: value === WhatsAppProvider.BusinessAPI ? businessPhoneNumberId : undefined
    });
  };
  
  // Handle save and continue
  const handleSaveAndContinue = () => {
    const configData = {
      whatsappConfigured: useWhatsApp,
      whatsappAccessToken: businessApiKey,
      whatsappBusinessPhoneId: businessPhoneNumberId,
      whatsappBusinessNumber: businessNumber,
      whatsappBusinessAccountId: businessAccountId,
      whatsappProvider: provider
    };
    
    updateConfigMutation.mutate(configData, {
      onSuccess: () => {
        // Call the step completion handler without passing parameters
        onComplete();
      }
    });
  };
  
  // Handle initializing WhatsApp
  const handleInitialize = () => {
    const data: any = {
      whatsappConfigured: useWhatsApp
    };
    
    if (provider === WhatsAppProvider.BusinessAPI) {
      data.whatsappAccessToken = businessApiKey;
      data.whatsappBusinessPhoneId = businessPhoneNumberId;
      data.whatsappBusinessNumber = businessNumber;
      data.whatsappBusinessAccountId = businessAccountId;
    }
    
    initializeMutation.mutate(data);
  };
  
  // Handle sending test message
  const handleSendTestMessage = () => {
    if (!testPhoneNumber) {
      toast({
        title: 'Phone number required',
        description: 'Please enter a phone number to send the test message to.',
        variant: 'destructive',
      });
      return;
    }
    
    sendTestMessageMutation.mutate({
      to: testPhoneNumber,
      message: testMessage || 'Hello from Eternally Yours!'
    });
  };
  
  // Determine if WhatsApp is connected
  const isWhatsAppConnected = whatsappStatus && whatsappStatus.status === 'connected';
  
  // Determine if we need to show QR code
  const showQrCode = provider === WhatsAppProvider.WebJS && 
                    whatsappStatus && 
                    whatsappStatus.status === 'qr_needed' && 
                    qrData && 
                    qrData.qrCode;
  
  // Loading state
  if (eventLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>WhatsApp Integration</CardTitle>
        <CardDescription>
          Configure WhatsApp integration to send messages and updates to your guests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="test">Test Message</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup">
            <div className="space-y-6">
              {/* WhatsApp Toggle */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="use-whatsapp" 
                  checked={useWhatsApp} 
                  onCheckedChange={setUseWhatsApp} 
                />
                <Label htmlFor="use-whatsapp">Enable WhatsApp Integration</Label>
              </div>
              
              {useWhatsApp && (
                <>
                  {/* WhatsApp Provider Selection */}
                  <div className="space-y-3">
                    <Label>Select WhatsApp Integration Method</Label>
                    <RadioGroup 
                      value={provider} 
                      onValueChange={(value) => handleProviderChange(value as WhatsAppProvider)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={WhatsAppProvider.WebJS} id="webjs" />
                        <Label htmlFor="webjs">WhatsApp Web (Scan QR Code)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={WhatsAppProvider.BusinessAPI} id="business-api" />
                        <Label htmlFor="business-api">WhatsApp Business API (Official API)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Provider-specific settings */}
                  {provider === WhatsAppProvider.WebJS ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4 bg-muted/50">
                        <h3 className="font-medium mb-2">WhatsApp Web Setup Instructions</h3>
                        <ol className="list-decimal pl-5 space-y-1 text-sm">
                          <li>Click "Initialize WhatsApp" button below</li>
                          <li>A QR code will appear</li>
                          <li>Open WhatsApp on your phone</li>
                          <li>Go to Settings &gt; Linked Devices &gt; Link a Device</li>
                          <li>Scan the QR code below</li>
                        </ol>
                      </div>
                      
                      {/* WhatsApp Status */}
                      <div className="flex items-center space-x-2 text-sm">
                        <span>Status:</span>
                        {statusLoading ? (
                          <span className="flex items-center text-yellow-500">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Checking...
                          </span>
                        ) : isWhatsAppConnected ? (
                          <span className="flex items-center text-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </span>
                        ) : (
                          <span className="flex items-center text-red-500">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not connected
                          </span>
                        )}
                      </div>
                      
                      {/* QR Code Display */}
                      {showQrCode && (
                        <div className="flex flex-col items-center space-y-3 my-4">
                          <div className="bg-white p-3 rounded-lg">
                            <QRCode value={qrData.qrCode} size={200} />
                          </div>
                          <p className="text-xs text-gray-500">Scan this QR code with your WhatsApp</p>
                        </div>
                      )}
                      
                      {/* Initialize Button */}
                      <Button 
                        onClick={handleInitialize}
                        disabled={initializeMutation.isPending}
                        className="w-full"
                      >
                        {initializeMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Initialize WhatsApp
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4 bg-muted/50">
                        <h3 className="font-medium mb-2">WhatsApp Business API Setup</h3>
                        <p className="text-sm mb-2">
                          You'll need to register with Meta and get approved for the WhatsApp Business API.
                          Enter your credentials below:
                        </p>
                        <a 
                          href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline"
                        >
                          Learn how to get WhatsApp Business API credentials
                        </a>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="api-key">API Key (Access Token)</Label>
                          <Input
                            id="api-key"
                            value={businessApiKey}
                            onChange={(e) => setBusinessApiKey(e.target.value)}
                            placeholder="Enter your API key"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone-number-id">Phone Number ID</Label>
                          <Input
                            id="phone-number-id"
                            value={businessPhoneNumberId}
                            onChange={(e) => setBusinessPhoneNumberId(e.target.value)}
                            placeholder="Enter your phone number ID"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="business-number">Business Phone Number</Label>
                          <Input
                            id="business-number"
                            value={businessNumber}
                            onChange={(e) => setBusinessNumber(e.target.value)}
                            placeholder="Example: +911234567890"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="account-id">Business Account ID (Optional)</Label>
                          <Input
                            id="account-id"
                            value={businessAccountId}
                            onChange={(e) => setBusinessAccountId(e.target.value)}
                            placeholder="Enter your business account ID"
                          />
                        </div>
                      </div>
                      
                      {/* WhatsApp Status */}
                      <div className="flex items-center space-x-2 text-sm">
                        <span>Status:</span>
                        {statusLoading ? (
                          <span className="flex items-center text-yellow-500">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Checking...
                          </span>
                        ) : isWhatsAppConnected ? (
                          <span className="flex items-center text-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </span>
                        ) : (
                          <span className="flex items-center text-red-500">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not connected
                          </span>
                        )}
                      </div>
                      
                      {/* Initialize Button */}
                      <Button 
                        onClick={handleInitialize}
                        disabled={initializeMutation.isPending || !businessApiKey || !businessPhoneNumberId}
                        className="w-full"
                      >
                        {initializeMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Initialize WhatsApp
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="test">
            <div className="space-y-6">
              <div className="rounded-lg border p-4 bg-muted/50">
                <h3 className="font-medium mb-2">Test WhatsApp Integration</h3>
                <p className="text-sm">
                  Send a test message to verify your WhatsApp integration is working correctly.
                </p>
              </div>
              
              {/* WhatsApp Status */}
              <div className="flex items-center space-x-2 text-sm">
                <span>WhatsApp Status:</span>
                {statusLoading ? (
                  <span className="flex items-center text-yellow-500">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Checking...
                  </span>
                ) : isWhatsAppConnected ? (
                  <span className="flex items-center text-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center text-red-500">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not connected
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-phone">Phone Number</Label>
                  <Input
                    id="test-phone"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="Example: +911234567890"
                  />
                  <p className="text-xs text-muted-foreground">Include country code (e.g., +91 for India)</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="test-message">Test Message</Label>
                  <Input
                    id="test-message"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter test message"
                  />
                </div>
                
                <Button 
                  onClick={handleSendTestMessage}
                  disabled={sendTestMessageMutation.isPending || !isWhatsAppConnected || !testPhoneNumber}
                  className="w-full"
                >
                  {sendTestMessageMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Send Test Message
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleSaveAndContinue} disabled={updateConfigMutation.isPending}>
            {updateConfigMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Save & Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppSetupStep;