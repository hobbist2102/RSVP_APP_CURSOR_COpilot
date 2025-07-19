import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Mail, 
  Save, 
  TestTube,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { get, post, put } from "@/lib/api";
import { useNotification } from "@/lib/notification-utils";
import AdminLayout from "@/components/layout/admin-layout";

interface AdminEmailConfig {
  id?: number;
  provider: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  // Gmail OAuth
  gmailClientId?: string;
  gmailClientSecret?: string;
  // Outlook OAuth
  outlookClientId?: string;
  outlookClientSecret?: string;
  // SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  // SendGrid
  sendgridApiKey?: string;
}

export default function AdminEmailSettings() {
  const [showPasswords, setShowPasswords] = useState(false);
  const notification = useNotification();
  const queryClient = useQueryClient();

  // Fetch current admin email config
  const { data: emailConfig, isLoading } = useQuery<AdminEmailConfig>({
    queryKey: ['/api/admin/email-config'],
    queryFn: () => get('/api/admin/email-config'),
  });

  // Form state
  const [formData, setFormData] = useState<AdminEmailConfig>({
    provider: 'smtp',
    fromEmail: '',
    fromName: 'Wedding RSVP System',
    isActive: false,
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: true,
    ...emailConfig
  });

  // Update form when data loads
  React.useEffect(() => {
    if (emailConfig) {
      setFormData({ ...emailConfig });
    }
  }, [emailConfig]);

  // Save configuration
  const saveConfigMutation = useMutation({
    mutationFn: (config: AdminEmailConfig) => 
      config.id 
        ? put(`/api/admin/email-config/${config.id}`, config)
        : post('/api/admin/email-config', config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-config'] });
      notification.success({
        title: "Configuration Saved",
        description: "Admin email configuration has been saved successfully."
      });
    },
    onError: (error: any) => {
      notification.error({
        title: "Save Failed",
        description: error.message || "Failed to save email configuration."
      });
    }
  });

  // Test email connection
  const testEmailMutation = useMutation({
    mutationFn: () => post('/api/admin/email-config/test', formData),
    onSuccess: (data: any) => {
      notification.success({
        title: "Connection Successful",
        description: "Email configuration test passed successfully."
      });
    },
    onError: (error: any) => {
      notification.error({
        title: "Connection Failed",
        description: error.message || "Email configuration test failed."
      });
    }
  });

  const handleSave = () => {
    saveConfigMutation.mutate(formData);
  };

  const handleTest = () => {
    testEmailMutation.mutate();
  };

  const updateFormData = (updates: Partial<AdminEmailConfig>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Loading email configuration...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Configuration</h1>
          <p className="text-gray-600 mt-2">
            Configure system-wide email settings for password resets and admin notifications
          </p>
        </div>

        {/* Status Alert */}
        {formData.isActive ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Email configuration is active and ready to send system emails.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Email configuration is inactive. Password reset emails will not be sent.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Email Provider Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider">Email Provider</Label>
                    <Select 
                      value={formData.provider} 
                      onValueChange={(value) => updateFormData({ provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP</SelectItem>
                        <SelectItem value="gmail">Gmail OAuth</SelectItem>
                        <SelectItem value="outlook">Outlook OAuth</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={formData.isActive}
                      onCheckedChange={(checked) => updateFormData({ isActive: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={formData.fromEmail}
                      onChange={(e) => updateFormData({ fromEmail: e.target.value })}
                      placeholder="admin@yoursite.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={formData.fromName}
                      onChange={(e) => updateFormData({ fromName: e.target.value })}
                      placeholder="Wedding RSVP System"
                    />
                  </div>
                </div>

                {/* Provider-specific settings */}
                <Tabs value={formData.provider} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="smtp">SMTP</TabsTrigger>
                    <TabsTrigger value="gmail">Gmail</TabsTrigger>
                    <TabsTrigger value="outlook">Outlook</TabsTrigger>
                    <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="smtp" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          value={formData.smtpHost || ''}
                          onChange={(e) => updateFormData({ smtpHost: e.target.value })}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={formData.smtpPort || 587}
                          onChange={(e) => updateFormData({ smtpPort: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtpUsername">Username</Label>
                        <Input
                          id="smtpUsername"
                          value={formData.smtpUsername || ''}
                          onChange={(e) => updateFormData({ smtpUsername: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPassword">Password</Label>
                        <div className="relative">
                          <Input
                            id="smtpPassword"
                            type={showPasswords ? "text" : "password"}
                            value={formData.smtpPassword || ''}
                            onChange={(e) => updateFormData({ smtpPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPasswords(!showPasswords)}
                          >
                            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={formData.smtpSecure}
                        onCheckedChange={(checked) => updateFormData({ smtpSecure: checked })}
                      />
                      <Label>Use SSL/TLS</Label>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="gmail" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="gmailClientId">Gmail Client ID</Label>
                        <Input
                          id="gmailClientId"
                          value={formData.gmailClientId || ''}
                          onChange={(e) => updateFormData({ gmailClientId: e.target.value })}
                          placeholder="Your Gmail OAuth Client ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gmailClientSecret">Gmail Client Secret</Label>
                        <div className="relative">
                          <Input
                            id="gmailClientSecret"
                            type={showPasswords ? "text" : "password"}
                            value={formData.gmailClientSecret || ''}
                            onChange={(e) => updateFormData({ gmailClientSecret: e.target.value })}
                            placeholder="Your Gmail OAuth Client Secret"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="outlook" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="outlookClientId">Outlook Client ID</Label>
                        <Input
                          id="outlookClientId"
                          value={formData.outlookClientId || ''}
                          onChange={(e) => updateFormData({ outlookClientId: e.target.value })}
                          placeholder="Your Outlook OAuth Client ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="outlookClientSecret">Outlook Client Secret</Label>
                        <div className="relative">
                          <Input
                            id="outlookClientSecret"
                            type={showPasswords ? "text" : "password"}
                            value={formData.outlookClientSecret || ''}
                            onChange={(e) => updateFormData({ outlookClientSecret: e.target.value })}
                            placeholder="Your Outlook OAuth Client Secret"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sendgrid" className="space-y-4">
                    <div>
                      <Label htmlFor="sendgridApiKey">SendGrid API Key</Label>
                      <div className="relative">
                        <Input
                          id="sendgridApiKey"
                          type={showPasswords ? "text" : "password"}
                          value={formData.sendgridApiKey || ''}
                          onChange={(e) => updateFormData({ sendgridApiKey: e.target.value })}
                          placeholder="Your SendGrid API Key"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={saveConfigMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saveConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleTest}
                    disabled={testEmailMutation.isPending || !formData.fromEmail}
                    className="flex items-center space-x-2"
                  >
                    <TestTube className="h-4 w-4" />
                    <span>{testEmailMutation.isPending ? 'Testing...' : 'Test Connection'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Help & Documentation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Environment Variables</h4>
                  <p className="text-gray-600 mb-2">
                    You can also configure email settings using environment variables:
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                    <div>ADMIN_FROM_EMAIL=admin@site.com</div>
                    <div>ADMIN_SMTP_HOST=smtp.gmail.com</div>
                    <div>ADMIN_SMTP_PORT=587</div>
                    <div>ADMIN_SMTP_USERNAME=user</div>
                    <div>ADMIN_SMTP_PASSWORD=pass</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Common SMTP Settings</h4>
                  <div className="space-y-2 text-xs">
                    <div><strong>Gmail:</strong> smtp.gmail.com:587</div>
                    <div><strong>Outlook:</strong> smtp-mail.outlook.com:587</div>
                    <div><strong>Yahoo:</strong> smtp.mail.yahoo.com:587</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Security Note</h4>
                  <p className="text-gray-600 text-xs">
                    For Gmail/Outlook, consider using OAuth instead of app passwords for better security.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}