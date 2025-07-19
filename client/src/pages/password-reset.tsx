import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { post } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/notification-utils';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const requestResetMutation = useMutation({
    mutationFn: (email: string) => post('/api/auth/password-reset/request', { email }),
    onSuccess: () => {
      setIsSubmitted(true);
      showSuccessToast('Password reset instructions sent', 'Check your email for the reset link');
    },
    onError: (error: any) => {
      showErrorToast('Request failed', error.message || 'Failed to send password reset email');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showErrorToast('Email required', 'Please enter your email address');
      return;
    }
    requestResetMutation.mutate(email);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Check Your Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-muted-foreground">
              <p className="text-sm leading-relaxed">
                We've sent password reset instructions to{' '}
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="text-sm leading-relaxed mt-2">
                The link will expire in 15 minutes for security reasons.
              </p>
            </div>

            <Alert className="border-primary/20 bg-primary/5">
              <Mail className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                Didn't receive the email? Check your spam folder or try again.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
              >
                Try Different Email
              </Button>
              
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground">
            Reset Password
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 text-base"
                disabled={requestResetMutation.isPending}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium"
              disabled={requestResetMutation.isPending}
            >
              {requestResetMutation.isPending ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-normal">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}