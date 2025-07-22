'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle2, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  Calendar,
  MapPin,
  Users,
  Mail,
  MessageSquare,
  Settings,
  Sparkles
} from 'lucide-react'
import { CreateEventSchema, type CreateEvent } from '@/lib/validations/schemas'

type SetupStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

interface StepConfig {
  number: SetupStep
  title: string
  description: string
  icon: React.ReactNode
  fields: string[]
}

const SETUP_STEPS: StepConfig[] = [
  {
    number: 1,
    title: 'Basic Information',
    description: 'Essential details about your event',
    icon: <Calendar className="w-5 h-5" />,
    fields: ['eventName', 'coupleNames', 'brideName', 'groomName', 'eventDate', 'description']
  },
  {
    number: 2,
    title: 'Ceremony Configuration',
    description: 'Set up multiple ceremonies and events',
    icon: <Sparkles className="w-5 h-5" />,
    fields: ['ceremonies', 'receptionDetails']
  },
  {
    number: 3,
    title: 'Venue Setup',
    description: 'Location and timing details',
    icon: <MapPin className="w-5 h-5" />,
    fields: ['venue', 'address', 'timezone', 'directions']
  },
  {
    number: 4,
    title: 'Guest Categories',
    description: 'Organize guests by relationship',
    icon: <Users className="w-5 h-5" />,
    fields: ['guestCategories', 'allowPlusOnes', 'allowChildren']
  },
  {
    number: 5,
    title: 'Communication Setup',
    description: 'Configure email and messaging',
    icon: <Mail className="w-5 h-5" />,
    fields: ['emailProvider', 'whatsappEnabled', 'communicationSettings']
  },
  {
    number: 6,
    title: 'RSVP Configuration',
    description: 'Set response options and deadlines',
    icon: <MessageSquare className="w-5 h-5" />,
    fields: ['rsvpDeadline', 'rsvpOptions', 'customQuestions']
  },
  {
    number: 7,
    title: 'Review & Launch',
    description: 'Final confirmation and activation',
    icon: <Settings className="w-5 h-5" />,
    fields: ['confirmation']
  }
]

export default function EventSetupWizard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<SetupStep>(1)
  const [completedSteps, setCompletedSteps] = useState<Set<SetupStep>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateEvent>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      eventName: '',
      coupleNames: '',
      brideName: '',
      groomName: '',
      description: '',
      venue: '',
      allowPlusOnes: true,
      allowChildren: true,
      rsvpDeadline: '',
      emailProvider: 'resend',
      whatsappEnabled: false,
    }
  })

  const progress = (completedSteps.size / SETUP_STEPS.length) * 100

  const handleStepComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    if (currentStep < 7) {
      setCurrentStep((prev) => (prev + 1) as SetupStep)
    }
  }

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as SetupStep)
    }
  }

  const handleFinalSubmit = async (data: CreateEvent) => {
    setIsLoading(true)
    try {
      // API call to create event
      console.log('Creating event:', data)
      // Redirect to event dashboard
      router.push('/dashboard/events')
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {SETUP_STEPS.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div 
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
              completedSteps.has(step.number)
                ? 'bg-green-500 border-green-500 text-white'
                : currentStep === step.number
                ? 'border-wedding-gold bg-wedding-gold text-white'
                : 'border-gray-300 text-gray-500'
            }`}
          >
            {completedSteps.has(step.number) ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{step.number}</span>
            )}
          </div>
          {index < SETUP_STEPS.length - 1 && (
            <div 
              className={`w-12 h-0.5 mx-2 ${
                completedSteps.has(step.number) ? 'bg-green-500' : 'bg-gray-300'
              }`} 
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="eventName">Event Name *</Label>
          <Input
            id="eventName"
            {...form.register('eventName')}
            placeholder="Sarah & John's Wedding"
          />
        </div>
        <div>
          <Label htmlFor="coupleNames">Couple Names *</Label>
          <Input
            id="coupleNames"
            {...form.register('coupleNames')}
            placeholder="Sarah Smith & John Doe"
          />
        </div>
        <div>
          <Label htmlFor="brideName">Bride's Name *</Label>
          <Input
            id="brideName"
            {...form.register('brideName')}
            placeholder="Sarah Smith"
          />
        </div>
        <div>
          <Label htmlFor="groomName">Groom's Name *</Label>
          <Input
            id="groomName"
            {...form.register('groomName')}
            placeholder="John Doe"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="eventDate">Wedding Date *</Label>
          <Input
            id="eventDate"
            type="date"
            {...form.register('eventDate')}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Event Description</Label>
          <Textarea
            id="description"
            {...form.register('description')}
            placeholder="Tell your guests about your special day..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Configure multiple ceremonies like Mehendi, Sangam, Wedding, Reception, etc.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <h4 className="font-medium">Main Ceremony</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Ceremony Type</Label>
            <Input placeholder="Wedding Ceremony" />
          </div>
          <div>
            <Label>Date & Time</Label>
            <Input type="datetime-local" />
          </div>
        </div>
        
        <Button variant="outline" className="w-full">
          + Add Another Ceremony
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="venue">Venue Name *</Label>
          <Input
            id="venue"
            {...form.register('venue')}
            placeholder="The Grand Ballroom"
          />
        </div>
        <div>
          <Label>Venue Address *</Label>
          <Input placeholder="123 Wedding Lane, City, State" />
        </div>
        <div>
          <Label>Timezone</Label>
          <Input placeholder="EST (UTC-5)" />
        </div>
        <div>
          <Label>Parking Instructions</Label>
          <Input placeholder="Valet available, street parking" />
        </div>
        <div className="md:col-span-2">
          <Label>Directions & Additional Info</Label>
          <Textarea 
            placeholder="Special instructions for guests..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )

  const currentStepConfig = SETUP_STEPS.find(step => step.number === currentStep)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Setup Wizard</h1>
          <p className="text-gray-600 mt-2">
            Let's create your perfect wedding event in 7 easy steps
          </p>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
            </div>
          </div>
        </div>

        {renderStepIndicator()}

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              {currentStepConfig?.icon}
              <div>
                <CardTitle>{currentStepConfig?.title}</CardTitle>
                <CardDescription>{currentStepConfig?.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(currentStep === 7 ? handleFinalSubmit : handleStepComplete)}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-4">Guest Categories (Step 4)</h3>
                  <p className="text-gray-600">Coming soon - Guest organization features</p>
                </div>
              )}
              {currentStep === 5 && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-4">Communication Setup (Step 5)</h3>
                  <p className="text-gray-600">Coming soon - Email and WhatsApp configuration</p>
                </div>
              )}
              {currentStep === 6 && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-4">RSVP Configuration (Step 6)</h3>
                  <p className="text-gray-600">Coming soon - RSVP options and deadlines</p>
                </div>
              )}
              {currentStep === 7 && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-4">Review & Launch</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <p className="text-green-800 font-medium">Your event is ready to launch!</p>
                    <p className="text-green-600 text-sm mt-1">All required information has been configured</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStepBack}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {currentStep === 7 ? (
                    isLoading ? 'Creating Event...' : 'Launch Event'
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}