'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { CalendarIcon, ArrowLeft, ArrowRight, Check } from 'lucide-react'

interface EventSetupData {
  // Step 1: Basic Information
  eventTitle: string
  brideName: string
  groomName: string
  eventDate: string
  location: string
  description: string
  
  // Step 2: Ceremony Configuration
  ceremonies: Array<{
    name: string
    date: string
    time: string
    location: string
    description: string
  }>
  
  // Step 3: Venue Setup
  venues: Array<{
    name: string
    address: string
    capacity: number
    type: string
  }>
  
  // Step 4: Guest Categories
  guestCategories: Array<{
    name: string
    description: string
    allowPlusOne: boolean
  }>
  
  // Step 5: Communication Setup
  emailProvider: string
  welcomeMessage: string
  
  // Step 6: RSVP Configuration
  rsvpDeadline: string
  allowPlusOnes: boolean
  customMessage: string
}

const STEPS = [
  { id: 1, title: 'Basic Information', description: 'Event details and couple information' },
  { id: 2, title: 'Ceremony Configuration', description: 'Setup individual ceremonies' },
  { id: 3, title: 'Venue Setup', description: 'Configure venues and locations' },
  { id: 4, title: 'Guest Categories', description: 'Define guest types and permissions' },
  { id: 5, title: 'Communication Setup', description: 'Email and messaging configuration' },
  { id: 6, title: 'RSVP Configuration', description: 'Response settings and deadlines' },
  { id: 7, title: 'Review & Launch', description: 'Final review and event activation' }
]

export default function EventSetupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EventSetupData>({
    eventTitle: '',
    brideName: '',
    groomName: '',
    eventDate: '',
    location: '',
    description: '',
    ceremonies: [{ name: '', date: '', time: '', location: '', description: '' }],
    venues: [{ name: '', address: '', capacity: 0, type: 'ceremony' }],
    guestCategories: [{ name: 'Family', description: 'Close family members', allowPlusOne: true }],
    emailProvider: 'resend',
    welcomeMessage: '',
    rsvpDeadline: '',
    allowPlusOnes: true,
    customMessage: ''
  })

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCeremony = () => {
    setFormData(prev => ({
      ...prev,
      ceremonies: [...prev.ceremonies, { name: '', date: '', time: '', location: '', description: '' }]
    }))
  }

  const addVenue = () => {
    setFormData(prev => ({
      ...prev,
      venues: [...prev.venues, { name: '', address: '', capacity: 0, type: 'ceremony' }]
    }))
  }

  const addGuestCategory = () => {
    setFormData(prev => ({
      ...prev,
      guestCategories: [...prev.guestCategories, { name: '', description: '', allowPlusOne: false }]
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventTitle">Event Title</Label>
                <Input
                  id="eventTitle"
                  value={formData.eventTitle}
                  onChange={(e) => updateFormData('eventTitle', e.target.value)}
                  placeholder="Sarah & John's Wedding"
                />
              </div>
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => updateFormData('eventDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brideName">Bride's Name</Label>
                <Input
                  id="brideName"
                  value={formData.brideName}
                  onChange={(e) => updateFormData('brideName', e.target.value)}
                  placeholder="Sarah"
                />
              </div>
              <div>
                <Label htmlFor="groomName">Groom's Name</Label>
                <Input
                  id="groomName"
                  value={formData.groomName}
                  onChange={(e) => updateFormData('groomName', e.target.value)}
                  placeholder="John"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Primary Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="Grand Hotel, New York"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="A beautiful celebration of love..."
                rows={4}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Ceremony Configuration</h3>
              <Button onClick={addCeremony} variant="outline">Add Ceremony</Button>
            </div>
            
            {formData.ceremonies.map((ceremony, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">Ceremony {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Ceremony Name</Label>
                      <Input
                        value={ceremony.name}
                        onChange={(e) => {
                          const newCeremonies = [...formData.ceremonies]
                          newCeremonies[index].name = e.target.value
                          updateFormData('ceremonies', newCeremonies)
                        }}
                        placeholder="Wedding Ceremony"
                      />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={ceremony.date}
                        onChange={(e) => {
                          const newCeremonies = [...formData.ceremonies]
                          newCeremonies[index].date = e.target.value
                          updateFormData('ceremonies', newCeremonies)
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={ceremony.time}
                        onChange={(e) => {
                          const newCeremonies = [...formData.ceremonies]
                          newCeremonies[index].time = e.target.value
                          updateFormData('ceremonies', newCeremonies)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={ceremony.location}
                        onChange={(e) => {
                          const newCeremonies = [...formData.ceremonies]
                          newCeremonies[index].location = e.target.value
                          updateFormData('ceremonies', newCeremonies)
                        }}
                        placeholder="Church of St. Mary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={ceremony.description}
                      onChange={(e) => {
                        const newCeremonies = [...formData.ceremonies]
                        newCeremonies[index].description = e.target.value
                        updateFormData('ceremonies', newCeremonies)
                      }}
                      placeholder="Traditional wedding ceremony..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="rsvpDeadline">RSVP Deadline</Label>
              <Input
                id="rsvpDeadline"
                type="date"
                value={formData.rsvpDeadline}
                onChange={(e) => updateFormData('rsvpDeadline', e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowPlusOnes"
                checked={formData.allowPlusOnes}
                onCheckedChange={(checked) => updateFormData('allowPlusOnes', checked)}
              />
              <Label htmlFor="allowPlusOnes">Allow Plus Ones</Label>
            </div>
            
            <div>
              <Label htmlFor="customMessage">Custom RSVP Message</Label>
              <Textarea
                id="customMessage"
                value={formData.customMessage}
                onChange={(e) => updateFormData('customMessage', e.target.value)}
                placeholder="We can't wait to celebrate with you!"
                rows={4}
              />
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Ready to Launch!</h3>
              <p className="text-gray-600 mb-6">
                Review your event configuration and launch your wedding platform.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><strong>Event:</strong> {formData.eventTitle}</div>
                <div><strong>Couple:</strong> {formData.brideName} & {formData.groomName}</div>
                <div><strong>Date:</strong> {formData.eventDate}</div>
                <div><strong>Location:</strong> {formData.location}</div>
                <div><strong>Ceremonies:</strong> {formData.ceremonies.length}</div>
                <div><strong>RSVP Deadline:</strong> {formData.rsvpDeadline}</div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold">Step {currentStep} Configuration</h3>
              <p className="text-gray-600">This step is under development</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Event Setup Wizard</h1>
          <p className="text-gray-600">Configure your wedding event step by step</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="mb-4" />
          
          {/* Step indicators */}
          <div className="grid grid-cols-7 gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`text-center p-2 rounded-lg border ${
                  step.id === currentStep
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : step.id < currentStep
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <div className="font-semibold text-xs">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === STEPS.length ? (
            <Button className="bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4 mr-2" />
              Launch Event
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}