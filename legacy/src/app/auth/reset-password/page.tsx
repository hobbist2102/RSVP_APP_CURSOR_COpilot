'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  ArrowLeft,
  Shield
} from 'lucide-react'
import { z } from 'zod'

const EmailSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

const ResetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type EmailForm = z.infer<typeof EmailSchema>
type ResetForm = z.infer<typeof ResetSchema>

type ResetStep = 'email' | 'sent' | 'reset' | 'complete'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [currentStep, setCurrentStep] = useState<ResetStep>(token ? 'reset' : 'email')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(EmailSchema)
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(ResetSchema)
  })

  const handleEmailSubmit = async (data: EmailForm) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setEmail(data.email)
      setCurrentStep('sent')
    } catch (error) {
      console.error('Password reset request error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (data: ResetForm) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCurrentStep('complete')
    } catch (error) {
      console.error('Password reset error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resendResetEmail = async () => {
    // Simulate resend API call
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const renderEmailStep = () => (
    <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
      <div className="text-center">
        <Mail className="w-16 h-16 text-wedding-gold mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Reset Your Password</h3>
        <p className="text-gray-600 mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="email"
            type="email"
            {...emailForm.register('email')}
            placeholder="Enter your email address"
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        {emailForm.formState.errors.email && (
          <p className="text-sm text-red-600 mt-1">{emailForm.formState.errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
      </Button>
    </form>
  )

  const renderSentStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Check Your Email</h3>
        <p className="text-gray-600 mt-2">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          The reset link will expire in 1 hour for security reasons.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Didn't receive the email? Check your spam folder or{' '}
          <button 
            onClick={resendResetEmail}
            className="text-wedding-gold hover:underline"
          >
            resend the link
          </button>
        </p>
        
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('email')}
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Try Different Email
        </Button>
      </div>
    </div>
  )

  const renderResetStep = () => (
    <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-6">
      <div className="text-center">
        <Lock className="w-16 h-16 text-wedding-gold mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Create New Password</h3>
        <p className="text-gray-600 mt-2">
          Enter your new password below. Make sure it's strong and secure.
        </p>
      </div>

      <div>
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...resetForm.register('password')}
            placeholder="Enter your new password"
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {resetForm.formState.errors.password && (
          <p className="text-sm text-red-600 mt-1">{resetForm.formState.errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...resetForm.register('confirmPassword')}
            placeholder="Confirm your new password"
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {resetForm.formState.errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">{resetForm.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your password should be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
        </AlertDescription>
      </Alert>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Updating Password...' : 'Update Password'}
      </Button>
    </form>
  )

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Password Updated Successfully!</h3>
        <p className="text-gray-600 mt-2">
          Your password has been updated. You can now sign in with your new password.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900">Security Tips</h4>
        <ul className="text-sm text-green-800 mt-2 space-y-1">
          <li>• Don't share your password with anyone</li>
          <li>• Use a unique password for this account</li>
          <li>• Consider using a password manager</li>
          <li>• Sign out of any untrusted devices</li>
        </ul>
      </div>

      <Button onClick={() => router.push('/auth/login')} className="w-full">
        Sign In Now
      </Button>
    </div>
  )

  const getStepProgress = () => {
    switch (currentStep) {
      case 'email': return 25
      case 'sent': return 50
      case 'reset': return 75
      case 'complete': return 100
      default: return 0
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-blush/20 to-wedding-sage/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Password Reset</CardTitle>
            <CardDescription>
              Regain access to your wedding planning account
            </CardDescription>
            <div className="mt-4">
              <Progress value={getStepProgress()} className="w-full" />
            </div>
          </CardHeader>
          
          <CardContent>
            {currentStep === 'email' && renderEmailStep()}
            {currentStep === 'sent' && renderSentStep()}
            {currentStep === 'reset' && renderResetStep()}
            {currentStep === 'complete' && renderCompleteStep()}
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-wedding-gold hover:underline">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}