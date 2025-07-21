'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Heart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { RegisterSchema, type Register } from '@/lib/validations/schemas'

type RegistrationStep = 'account' | 'role' | 'verification' | 'complete'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: 'red' | 'yellow' | 'green'
}

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('account')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'red'
  })

  const form = useForm<Register>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'couple'
    }
  })

  const watchPassword = form.watch('password')

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) {
      score += 20
    } else {
      feedback.push('At least 8 characters')
    }

    if (/[a-z]/.test(password)) {
      score += 20
    } else {
      feedback.push('Include lowercase letters')
    }

    if (/[A-Z]/.test(password)) {
      score += 20
    } else {
      feedback.push('Include uppercase letters')
    }

    if (/\d/.test(password)) {
      score += 20
    } else {
      feedback.push('Include numbers')
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 20
    } else {
      feedback.push('Include special characters')
    }

    let color: 'red' | 'yellow' | 'green' = 'red'
    if (score >= 80) color = 'green'
    else if (score >= 60) color = 'yellow'

    return { score, feedback, color }
  }

  // Update password strength when password changes
  React.useEffect(() => {
    if (watchPassword) {
      setPasswordStrength(calculatePasswordStrength(watchPassword))
    }
  }, [watchPassword])

  const handleAccountSubmit = async (data: Register) => {
    setIsLoading(true)
    try {
      // Simulate API call for account creation
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCurrentStep('verification')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async () => {
    setIsLoading(true)
    try {
      // Simulate verification API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentStep('complete')
    } catch (error) {
      console.error('Verification error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerificationCode = async () => {
    // Simulate resend API call
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const renderAccountStep = () => (
    <form onSubmit={form.handleSubmit(handleAccountSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...form.register('firstName')}
            placeholder="Enter your first name"
            disabled={isLoading}
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...form.register('lastName')}
            placeholder="Enter your last name"
            disabled={isLoading}
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="Enter your email address"
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="role">Account Type *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              form.watch('role') === 'couple' ? 'border-wedding-gold bg-wedding-gold/5' : 'border-gray-300'
            }`}
            onClick={() => form.setValue('role', 'couple')}
          >
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-wedding-gold" />
              <div>
                <div className="font-medium">Couple</div>
                <div className="text-sm text-gray-600">Planning your wedding</div>
              </div>
            </div>
          </div>
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              form.watch('role') === 'planner' ? 'border-wedding-gold bg-wedding-gold/5' : 'border-gray-300'
            }`}
            onClick={() => form.setValue('role', 'planner')}
          >
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-wedding-gold" />
              <div>
                <div className="font-medium">Planner</div>
                <div className="text-sm text-gray-600">Wedding professional</div>
              </div>
            </div>
          </div>
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              form.watch('role') === 'admin' ? 'border-wedding-gold bg-wedding-gold/5' : 'border-gray-300'
            }`}
            onClick={() => form.setValue('role', 'admin')}
          >
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-wedding-gold" />
              <div>
                <div className="font-medium">Admin</div>
                <div className="text-sm text-gray-600">System administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...form.register('password')}
            placeholder="Create a strong password"
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
        {watchPassword && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <Progress 
                value={passwordStrength.score} 
                className={`flex-1 h-2 ${
                  passwordStrength.color === 'green' ? 'bg-green-200' : 
                  passwordStrength.color === 'yellow' ? 'bg-yellow-200' : 'bg-red-200'
                }`}
              />
              <Badge variant={passwordStrength.color === 'green' ? 'success' : 'destructive'}>
                {passwordStrength.score >= 80 ? 'Strong' : passwordStrength.score >= 60 ? 'Medium' : 'Weak'}
              </Badge>
            </div>
            {passwordStrength.feedback.length > 0 && (
              <ul className="text-xs text-gray-600 mt-1">
                {passwordStrength.feedback.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {form.formState.errors.password && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...form.register('confirmPassword')}
            placeholder="Confirm your password"
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
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </form>
  )

  const renderVerificationStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <Mail className="w-16 h-16 text-wedding-gold mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Check Your Email</h3>
        <p className="text-gray-600 mt-2">
          We've sent a verification code to <strong>{form.getValues('email')}</strong>
        </p>
      </div>

      <div>
        <Label htmlFor="verificationCode">Verification Code</Label>
        <Input
          id="verificationCode"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="text-center text-2xl tracking-widest mt-2"
          maxLength={6}
        />
      </div>

      <div className="space-y-3">
        <Button 
          onClick={handleVerificationSubmit} 
          className="w-full" 
          disabled={isLoading || verificationCode.length !== 6}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </Button>
        
        <div className="text-sm text-gray-600">
          Didn't receive the code?{' '}
          <button 
            onClick={resendVerificationCode}
            className="text-wedding-gold hover:underline"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Account Created Successfully!</h3>
        <p className="text-gray-600 mt-2">
          Welcome to the Wedding RSVP Platform. Your account has been verified and is ready to use.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900">What's Next?</h4>
        <ul className="text-sm text-green-800 mt-2 space-y-1">
          <li>• Complete your profile setup</li>
          <li>• Create your first wedding event</li>
          <li>• Import your guest list</li>
          <li>• Send invitations to your guests</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Button onClick={() => router.push('/dashboard')} className="w-full">
          Go to Dashboard
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/events/setup')}
          className="w-full"
        >
          Create Your First Event
        </Button>
      </div>
    </div>
  )

  const getStepProgress = () => {
    switch (currentStep) {
      case 'account': return 25
      case 'verification': return 75
      case 'complete': return 100
      default: return 0
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-blush/20 to-wedding-sage/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Join thousands of couples planning their perfect wedding
            </CardDescription>
            <div className="mt-4">
              <Progress value={getStepProgress()} className="w-full" />
              <p className="text-xs text-gray-600 mt-2">
                Step {currentStep === 'account' ? '1' : currentStep === 'verification' ? '2' : '3'} of 3
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            {currentStep === 'account' && renderAccountStep()}
            {currentStep === 'verification' && renderVerificationStep()}
            {currentStep === 'complete' && renderCompleteStep()}
          </CardContent>

          {currentStep === 'account' && (
            <CardFooter className="justify-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-wedding-gold hover:underline">
                  Sign in here
                </Link>
              </p>
            </CardFooter>
          )}

          {currentStep === 'verification' && (
            <CardFooter className="justify-center">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep('account')}
                className="text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Account Details
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}