import React from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface OAuthSetupGuideProps {
  provider: 'gmail' | 'outlook';
  onCredentialsSaved: () => void;
}

export function OAuthSetupGuide({ provider, onCredentialsSaved }: OAuthSetupGuideProps) {
  const { toast } = useToast();
  
  const handleCopyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description,
      });
    });
  };
  
  const gmailGuide = (
    <>
      <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-500">Gmail OAuth Setup Required</AlertTitle>
        <AlertDescription>
          Gmail authentication requires OAuth credentials from Google Cloud Console. 
          Follow these steps to set up your credentials.
        </AlertDescription>
      </Alert>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="step1">
          <AccordionTrigger className="text-base font-medium">
            1. Create a Google Cloud Project
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">
              Google Cloud Console <ExternalLink className="ml-1 h-3 w-3" />
            </a> and create a new project.</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Click on the project dropdown at the top of the page</li>
              <li>Click "New Project"</li>
              <li>Enter a name for your project (e.g., "Wedding RSVP App")</li>
              <li>Click "Create"</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step2">
          <AccordionTrigger className="text-base font-medium">
            2. Enable the Gmail API
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>In your new project:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to "APIs & Services" &gt; "Library"</li>
              <li>Search for "Gmail API"</li>
              <li>Select the Gmail API and click "Enable"</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step3">
          <AccordionTrigger className="text-base font-medium">
            3. Configure OAuth Consent Screen
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Set up the OAuth consent screen:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to "APIs & Services" &gt; "OAuth consent screen"</li>
              <li>Select "External" user type (unless you have Google Workspace)</li>
              <li>Click "Create"</li>
              <li>Fill in the required fields:
                <ul className="list-disc pl-5 mt-1">
                  <li>App name: "Wedding RSVP App"</li>
                  <li>User support email: Your email address</li>
                  <li>Developer contact information: Your email address</li>
                </ul>
              </li>
              <li>Click "Save and Continue"</li>
              <li>Add the following scopes:
                <ul className="list-disc pl-5 mt-1">
                  <li>https://www.googleapis.com/auth/gmail.send</li>
                  <li>https://www.googleapis.com/auth/userinfo.email</li>
                </ul>
              </li>
              <li>Click "Save and Continue"</li>
              <li>Add test users (your email address)</li>
              <li>Click "Save and Continue"</li>
              <li>Review the summary and click "Back to Dashboard"</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step4">
          <AccordionTrigger className="text-base font-medium">
            4. Create OAuth Credentials
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Create OAuth client ID:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to "APIs & Services" &gt; "Credentials"</li>
              <li>Click "Create Credentials" &gt; "OAuth client ID"</li>
              <li>Application type: "Web application"</li>
              <li>Name: "Wedding RSVP App Web Client"</li>
              <li>Authorized JavaScript origins: 
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2" 
                  onClick={() => handleCopyToClipboard(window.location.origin, "Origin URL copied")}
                >
                  Copy URL
                </Button>
              </li>
              <li>Authorized redirect URIs: 
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2" 
                  onClick={() => handleCopyToClipboard(`${window.location.origin}/api/oauth/gmail/callback`, "Redirect URI copied")}
                >
                  Copy URL
                </Button>
              </li>
              <li>Click "Create"</li>
            </ol>
            <div className="bg-gray-100 p-3 rounded-md mt-2">
              <p className="font-medium mb-1">You will receive:</p>
              <ul className="list-disc pl-5">
                <li>Client ID</li>
                <li>Client Secret</li>
              </ul>
              <p className="mt-2 text-amber-600">Keep these values secure! You'll need them in the next step.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step5">
          <AccordionTrigger className="text-base font-medium">
            5. Configure OAuth in Wedding RSVP App
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Enter the credentials in the OAuth Configuration section:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Go to the <a href="/event-settings" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline inline-flex items-center">
                  Event Settings page <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>Navigate to the "OAuth Configuration" tab</li>
              <li>Enter your Client ID and Client Secret for Gmail</li>
              <li>The Redirect URI should be: <code className="bg-gray-100 px-2 py-1 rounded">{window.location.origin}/api/oauth/gmail/callback</code></li>
              <li>Click "Save Gmail OAuth" button</li>
            </ol>
            <p className="mt-2">Once your credentials are saved, return to this page and click "I've Saved My Credentials" to complete the setup.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-6 flex justify-end">
        <Button
          variant="default"
          onClick={onCredentialsSaved}
        >
          I've Saved My Credentials
        </Button>
      </div>
    </>
  );
  
  const outlookGuide = (
    <>
      <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-500">Outlook OAuth Setup Required</AlertTitle>
        <AlertDescription>
          Outlook authentication requires OAuth credentials from Microsoft Azure. 
          Follow these steps to set up your credentials.
        </AlertDescription>
      </Alert>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="step1">
          <AccordionTrigger className="text-base font-medium">
            1. Register an Application in Azure
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Go to the <a href="https://portal.azure.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">
              Microsoft Azure Portal <ExternalLink className="ml-1 h-3 w-3" />
            </a> and register a new application.</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Navigate to "Azure Active Directory"</li>
              <li>Go to "App registrations"</li>
              <li>Click "New registration"</li>
              <li>Enter a name for your application (e.g., "Wedding RSVP App")</li>
              <li>Select "Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"</li>
              <li>For Redirect URI, select "Web" and enter: <code className="bg-gray-100 px-2 py-1 rounded">{window.location.origin}/api/oauth/outlook/callback</code>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2" 
                  onClick={() => handleCopyToClipboard(`${window.location.origin}/api/oauth/outlook/callback`, "Redirect URI copied")}
                >
                  Copy
                </Button>
              </li>
              <li>Click "Register"</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step2">
          <AccordionTrigger className="text-base font-medium">
            2. Add API Permissions
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Add the required permissions:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>In your application's overview, click on "API permissions"</li>
              <li>Click "Add a permission"</li>
              <li>Select "Microsoft Graph"</li>
              <li>Choose "Delegated permissions"</li>
              <li>Add the following permissions:
                <ul className="list-disc pl-5 mt-1">
                  <li>Mail.Send</li>
                  <li>User.Read</li>
                  <li>offline_access</li>
                </ul>
              </li>
              <li>Click "Add permissions"</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step3">
          <AccordionTrigger className="text-base font-medium">
            3. Create a Client Secret
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Create a client secret for authentication:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>In your application's overview, click on "Certificates & secrets"</li>
              <li>Click "New client secret"</li>
              <li>Add a description (e.g., "Wedding RSVP App Secret")</li>
              <li>Select an expiration period (recommended: 1 year)</li>
              <li>Click "Add"</li>
            </ol>
            <div className="bg-gray-100 p-3 rounded-md mt-2">
              <p className="font-medium mb-1">You will receive:</p>
              <ul className="list-disc pl-5">
                <li>Client ID (from the application's "Overview" page)</li>
                <li>Client Secret (value shown only once after creation)</li>
              </ul>
              <p className="mt-2 text-amber-600">Copy the client secret immediately! It will only be shown once and cannot be retrieved later.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step4">
          <AccordionTrigger className="text-base font-medium">
            4. Configure OAuth in Wedding RSVP App
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Enter the credentials in the OAuth Configuration section:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Go to the <a href="/event-settings" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline inline-flex items-center">
                  Event Settings page <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>Navigate to the "OAuth Configuration" tab</li>
              <li>Enter your Client ID and Client Secret for Outlook</li>
              <li>The Redirect URI should be: <code className="bg-gray-100 px-2 py-1 rounded">{window.location.origin}/api/oauth/outlook/callback</code></li>
              <li>Click "Save Outlook OAuth" button</li>
            </ol>
            <p className="mt-2">Once your credentials are saved, return to this page and click "I've Saved My Credentials" to complete the setup.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-6 flex justify-end">
        <Button
          variant="default"
          onClick={onCredentialsSaved}
        >
          I've Saved My Credentials
        </Button>
      </div>
    </>
  );
  
  return (
    <div className="space-y-4">
      {provider === 'gmail' ? gmailGuide : outlookGuide}
    </div>
  );
}

export default OAuthSetupGuide;