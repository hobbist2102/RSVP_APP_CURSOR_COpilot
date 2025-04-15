import { useState, useEffect } from "react";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ExternalLink, RefreshCw, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

type ConnectionStatus = {
  connected: boolean;
  email?: string;
};

interface OAuthConfigurationProps {
  provider: 'gmail' | 'outlook';
  eventId?: number;
  readOnly?: boolean;
  onConnected?: () => void;
  onStatusChange?: (status: ConnectionStatus) => void;
}

export default function OAuthConfiguration({ 
  provider, 
  eventId,
  readOnly = false,
  onConnected, 
  onStatusChange 
}: OAuthConfigurationProps) {
  const { toast } = useToast();
  const { currentEventId: contextEventId } = useCurrentEvent();
  const queryClient = useQueryClient();
  const [showOAuthDialog, setShowOAuthDialog] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  
  // Use provided eventId or fall back to context
  const effectiveEventId = eventId || contextEventId;

  // Query existing OAuth configuration
  const { 
    data: oauthConfig, 
    isLoading: isLoadingConfig,
    refetch: refetchConfig
  } = useQuery({
    queryKey: [`/api/oauth/config/${provider}`, effectiveEventId],
    enabled: !!effectiveEventId,
  });

  // Query connection status
  const { 
    data: connectionStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus
  } = useQuery({
    queryKey: [`/api/oauth/status/${provider}`, effectiveEventId],
    enabled: !!effectiveEventId && !!oauthConfig,
  });

  // Mutation to get OAuth authorization URL
  const { mutate: getAuthUrl, isPending: isGettingAuthUrl } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        `/api/oauth/${provider}/auth-url?eventId=${effectiveEventId}`
      );
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        setAuthUrl(data.authUrl);
        setShowOAuthDialog(true);
      } else {
        toast({
          title: "Error",
          description: "Could not retrieve authorization URL. Check your OAuth configuration.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to get authorization URL: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to disconnect OAuth
  const { mutate: disconnectOAuth, isPending: isDisconnecting } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        `/api/oauth/${provider}/disconnect?eventId=${effectiveEventId}`
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Disconnected",
        description: `${provider === 'gmail' ? 'Gmail' : 'Outlook'} account has been disconnected.`,
      });
      
      // Refresh status
      refetchStatus();
      refetchConfig();
      
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: [`/api/oauth/status/${provider}`, effectiveEventId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/oauth/config/${provider}`, effectiveEventId] 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to disconnect: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Call the onStatusChange callback when connection status changes
  useEffect(() => {
    if (onStatusChange && connectionStatus) {
      // Ensure we're passing a properly typed object to the callback
      const statusData: ConnectionStatus = {
        connected: !!connectionStatus && connectionStatus.connected === true,
        email: connectionStatus && connectionStatus.email ? connectionStatus.email : undefined
      };
      onStatusChange(statusData);
    }
  }, [connectionStatus, onStatusChange]);

  // Monitor OAuth popup window status
  useEffect(() => {
    let checkPopupInterval: NodeJS.Timeout | null = null;
    let popupWindow: Window | null = null;
    
    if (authUrl && showOAuthDialog) {
      // Open the popup window for OAuth authorization
      popupWindow = window.open(
        authUrl,
        "oauth_popup",
        "width=600,height=700,menubar=no,toolbar=no,location=no"
      );
      
      if (popupWindow) {
        // Check if popup is closed
        checkPopupInterval = setInterval(() => {
          if (popupWindow?.closed) {
            clearInterval(checkPopupInterval!);
            setShowOAuthDialog(false);
            setAuthUrl(null);
            
            // Refresh config and status
            refetchConfig();
            refetchStatus();
            
            // Notify parent component if needed
            if (onConnected) {
              // Delay slightly to allow backend to process the token
              setTimeout(onConnected, 1000);
            }
          }
        }, 500);
      }
    }
    
    return () => {
      if (checkPopupInterval) {
        clearInterval(checkPopupInterval);
      }
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
    };
  }, [authUrl, showOAuthDialog, refetchConfig, refetchStatus, onConnected]);

  const handleConnect = () => {
    getAuthUrl();
  };

  const handleDisconnect = () => {
    if (window.confirm(`Are you sure you want to disconnect your ${provider === 'gmail' ? 'Gmail' : 'Outlook'} account?`)) {
      disconnectOAuth();
    }
  };

  const displayName = provider === 'gmail' ? 'Gmail' : 'Outlook';
  // Safely access connectionStatus properties with type checking
  const isConnected = !!connectionStatus && connectionStatus.connected === true;
  const connectedEmail = connectionStatus && connectionStatus.email ? connectionStatus.email : '';
  
  // Determine if credentials exist but they're not connected
  const hasCredentialsButNotConnected = oauthConfig && !isConnected;

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">{displayName}</h3>
            {isConnected && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            )}
            {hasCredentialsButNotConnected && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Credentials Set
              </Badge>
            )}
            {!oauthConfig && (
              <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">
                Not Configured
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!oauthConfig && !readOnly && (
              <Link to="/event-settings" className="text-sm text-blue-600 hover:text-blue-800">
                Configure OAuth Credentials
              </Link>
            )}
            
            {oauthConfig && !readOnly && (
              <>
                {isConnected ? (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Disconnect
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleConnect}
                    disabled={isGettingAuthUrl}
                  >
                    {isGettingAuthUrl ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        {isConnected && connectedEmail && (
          <div className="text-sm text-muted-foreground">
            Connected as: <span className="font-medium">{connectedEmail}</span>
          </div>
        )}
        
        {hasCredentialsButNotConnected && (
          <div className="text-sm text-amber-600">
            OAuth credentials are set, but account connection is required.
          </div>
        )}
        
        {!oauthConfig && (
          <div className="text-sm text-muted-foreground">
            OAuth credentials must be configured in Event Settings before you can connect.
          </div>
        )}
      </div>
      
      <Dialog open={showOAuthDialog} onOpenChange={setShowOAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {displayName}</DialogTitle>
            <DialogDescription>
              A popup window has opened for you to authorize access to your {displayName} account.
              Please complete the authorization process in the popup window.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <p className="text-center text-muted-foreground">
              If the popup window didn't open, click the button below:
            </p>
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.open(authUrl!, "oauth_popup", "width=600,height=700")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Authorization Window
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowOAuthDialog(false);
                setAuthUrl(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}