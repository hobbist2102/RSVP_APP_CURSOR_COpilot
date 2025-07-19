import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle, Copy, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { post, get } from '@/lib/api';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  backupCodesCount: number;
  lastSecurityCheck?: string;
}

interface BackupCodesResponse {
  success: boolean;
  backupCodes: string[];
  message: string;
}

export default function TwoFactorAuth() {
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const queryClient = useQueryClient();

  // Fetch current security settings
  const { data: securitySettings, isLoading } = useQuery<SecuritySettings>({
    queryKey: ['security-settings'],
    queryFn: async () => {
      const response = await get('/api/otp/security-settings');
      return response.data;
    }
  });

  // Enable 2FA mutation
  const enable2FA = useMutation({
    mutationFn: async () => {
      const response = await post('/api/otp/enable-2fa', { method: 'email' });
      return response as BackupCodesResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        queryClient.invalidateQueries({ queryKey: ['security-settings'] });
        toast.success('2FA enabled successfully!');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to enable 2FA');
    }
  });

  // Disable 2FA mutation
  const disable2FA = useMutation({
    mutationFn: async () => {
      await post('/api/otp/disable-2fa', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast.success('2FA disabled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to disable 2FA');
    }
  });

  // Send OTP for verification
  const sendOTP = useMutation({
    mutationFn: async () => {
      await post('/api/otp/send-otp', { type: '2fa_login' });
    },
    onSuccess: () => {
      toast.success('Verification code sent to your email');
      setIsEnabling2FA(true);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send verification code');
    }
  });

  // Verify OTP
  const verifyOTP = useMutation({
    mutationFn: async (code: string) => {
      await post('/api/otp/verify-otp', { code, type: '2fa_login' });
    },
    onSuccess: () => {
      toast.success('Verification successful!');
      setIsEnabling2FA(false);
      setVerificationCode('');
      enable2FA.mutate();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Invalid verification code');
    }
  });

  const handleToggle2FA = (enabled: boolean) => {
    if (enabled) {
      sendOTP.mutate();
    } else {
      disable2FA.mutate();
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      verifyOTP.mutate(verificationCode);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    toast.success('Backup codes copied to clipboard');
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-rsvp-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with email-based 2FA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 2FA Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="2fa-toggle" className="text-base font-medium">
                  Enable Two-Factor Authentication
                </Label>
                {securitySettings?.twoFactorEnabled && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {securitySettings?.twoFactorEnabled
                  ? 'Your account is protected with 2FA'
                  : 'Protect your account with email verification codes'
                }
              </p>
            </div>
            <Switch
              id="2fa-toggle"
              checked={securitySettings?.twoFactorEnabled || false}
              onCheckedChange={handleToggle2FA}
              disabled={enable2FA.isPending || disable2FA.isPending || sendOTP.isPending}
            />
          </div>

          {securitySettings?.twoFactorEnabled && (
            <>
              <Separator />
              
              {/* 2FA Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Method: <span className="font-medium capitalize">{securitySettings.twoFactorMethod}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Backup codes: <span className="font-medium">{securitySettings.backupCodesCount} remaining</span>
                  </span>
                </div>

                {securitySettings.backupCodesCount < 3 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You're running low on backup codes. Consider regenerating them.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}

          {!securitySettings?.twoFactorEnabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication adds an extra layer of security to your account. 
                When enabled, you'll need to enter a code sent to your email in addition to your password.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* OTP Verification Dialog */}
      <Dialog open={isEnabling2FA} onOpenChange={setIsEnabling2FA}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit verification code to your email address. 
              Enter it below to enable two-factor authentication.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <InputOTP
                value={verificationCode}
                onChange={setVerificationCode}
                maxLength={6}
                className="w-full"
              >
                <InputOTPGroup className="w-full">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6 || verifyOTP.isPending}
                className="flex-1"
              >
                {verifyOTP.isPending ? 'Verifying...' : 'Verify & Enable 2FA'}
              </Button>
              <Button
                variant="outline"
                onClick={() => sendOTP.mutate()}
                disabled={sendOTP.isPending}
              >
                {sendOTP.isPending ? 'Sending...' : 'Resend'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Backup Codes</DialogTitle>
            <DialogDescription>
              Save these backup codes in a safe place. You can use them to access your account 
              if you lose access to your email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Each backup code can only be used once. 
                Store them securely and don't share them with anyone.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="text-center py-1">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyBackupCodes}
                variant="outline"
                className="flex-1"
                disabled={copiedCodes}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copiedCodes ? 'Copied!' : 'Copy All'}
              </Button>
              <Button
                onClick={downloadBackupCodes}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <Button 
              onClick={() => setShowBackupCodes(false)}
              className="w-full"
            >
              I've Saved My Backup Codes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}