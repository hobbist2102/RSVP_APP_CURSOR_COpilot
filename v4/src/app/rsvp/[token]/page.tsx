'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { RsvpStage1Schema, RsvpStage2Schema, type RsvpStage1, type RsvpStage2 } from '@/lib/validations/schemas'

interface GuestData {
  id: string
  firstName: string
  lastName: string
  email?: string
  side: 'bride' | 'groom' | 'mutual'
  plusOneAllowed: boolean
  plusOneName?: string
  eventName: string
  coupleNames: string
  weddingDate: string
  rsvpDeadline: string
  ceremonies: Array<{
    id: string
    name: string
    date: string
    startTime: string
    venueName: string
    venueAddress: string
    description?: string
    isMainCeremony: boolean
    mealOptions: string[]
  }>
  existingRsvp?: {
    stage1Complete: boolean
    stage2Complete: boolean
    attending: boolean
    plusOneAttending?: boolean
    ceremonies: Array<{
      ceremonyId: string
      attending: 'yes' | 'no' | 'maybe'
      mealPreference?: string
      plusOneAttending?: 'yes' | 'no' | 'maybe'
      plusOneMealPreference?: string
    }>
    dietaryRequirements?: string
    specialRequests?: string
  }
}

const mockGuestData: GuestData = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  side: 'groom',
  plusOneAllowed: true,
  plusOneName: 'Jane Smith',
  eventName: 'Sarah & Michael Wedding',
  coupleNames: 'Sarah & Michael',
  weddingDate: '2024-06-15',
  rsvpDeadline: '2024-05-15',
  ceremonies: [
    {
      id: '1',
      name: 'Wedding Ceremony',
      date: '2024-06-15',
      startTime: '15:00',
      venueName: 'St. Mary\'s Church',
      venueAddress: '123 Church Street, City, State',
      description: 'Join us for our wedding ceremony',
      isMainCeremony: true,
      mealOptions: ['Chicken', 'Beef', 'Vegetarian', 'Vegan']
    },
    {
      id: '2',
      name: 'Wedding Reception',
      date: '2024-06-15',
      startTime: '18:00',
      venueName: 'Grand Hotel Ballroom',
      venueAddress: '456 Hotel Avenue, City, State',
      description: 'Dinner, dancing, and celebration',
      isMainCeremony: false,
      mealOptions: ['Chicken', 'Beef', 'Vegetarian', 'Vegan', 'Kids Menu']
    },
    {
      id: '3',
      name: 'Welcome Brunch',
      date: '2024-06-16',
      startTime: '11:00',
      venueName: 'Garden Restaurant',
      venueAddress: '789 Garden Lane, City, State',
      description: 'Casual brunch the day after',
      isMainCeremony: false,
      mealOptions: ['Full Brunch', 'Continental', 'Vegetarian']
    }
  ]
}

type RsvpStage = 1 | 2 | 'complete'

export default function RsvpPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [currentStage, setCurrentStage] = useState<RsvpStage>(1)
  const [guestData, setGuestData] = useState<GuestData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Stage 1 form
  const stage1Form = useForm<RsvpStage1>({
    resolver: zodResolver(RsvpStage1Schema),
  })
  
  // Stage 2 form  
  const stage2Form = useForm<RsvpStage2>({
    resolver: zodResolver(RsvpStage2Schema),
  })

  const isStageComplete = (stage: number): boolean => {
    if (typeof currentStage === 'string') return currentStage === 'complete'
    return currentStage >= stage
  }

  useEffect(() => {
    // Simulate API call to fetch guest data by token
    const fetchGuestData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setGuestData(mockGuestData)
        
        // Pre-fill form if existing RSVP
        if (mockGuestData.existingRsvp) {
          const { existingRsvp } = mockGuestData
          
          if (existingRsvp.stage1Complete) {
            stage1Form.setValue('guestId', mockGuestData.id)
            stage1Form.setValue('attending', existingRsvp.attending)
            stage1Form.setValue('plusOneAttending', existingRsvp.plusOneAttending)
            
            if (existingRsvp.stage2Complete) {
              setCurrentStage('complete')
            } else {
              setCurrentStage(2)
            }
          }
        }
      } catch (error) {
        setError('Failed to load RSVP information')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuestData()
  }, [token, stage1Form])

  const handleStage1Submit = async (data: RsvpStage1) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (data.attending) {
        setCurrentStage(2)
      } else {
        // If not attending, submit and complete
        setCurrentStage('complete')
      }
    } catch (error) {
      setError('Failed to submit RSVP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStage2Submit = async (data: RsvpStage2) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentStage('complete')
    } catch (error) {
      setError('Failed to submit RSVP details')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToStage1 = () => {
    setCurrentStage(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wedding-blush/20 to-wedding-sage/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <Loader2 className="w-8 h-8 animate-spin text-wedding-gold mx-auto mb-4" />
            <p className="text-gray-600">Loading your RSVP...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !guestData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wedding-blush/20 to-wedding-sage/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">RSVP Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || 'We couldn\'t find your RSVP invitation. Please check your link.'}
            </p>
            <Button variant="outline" onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderHeader = () => (
    <div className="text-center mb-8">
      <div className="mb-6">
        <Heart className="w-16 h-16 text-wedding-gold mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          {guestData.coupleNames}
        </h1>
        <p className="text-lg text-gray-600">
          {new Date(guestData.weddingDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      <div className="bg-wedding-gold/10 rounded-lg p-4">
        <p className="text-gray-800">
          Dear {guestData.firstName} {guestData.lastName},
        </p>
        <p className="text-gray-600 mt-2">
          We're excited to celebrate our special day with you! Please let us know if you'll be joining us.
        </p>
      </div>
    </div>
  )

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${isStageComplete(1) ? 'text-wedding-gold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isStageComplete(1) ? 'bg-wedding-gold text-white' : 'bg-gray-200'
          }`}>
            {(typeof currentStage === 'number' && currentStage > 1) || currentStage === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : '1'}
          </div>
          <span className="text-sm font-medium">Initial Response</span>
        </div>
                  <div className={`w-16 h-px ${isStageComplete(2) ? 'bg-wedding-gold' : 'bg-gray-300'}`}></div>
                  <div className={`flex items-center space-x-2 ${isStageComplete(2) ? 'text-wedding-gold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isStageComplete(2) ? 'bg-wedding-gold text-white' : 'bg-gray-200'
            }`}>
              {currentStage === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : '2'}
          </div>
          <span className="text-sm font-medium">Event Details</span>
        </div>
        <div className={`w-16 h-px ${currentStage === 'complete' ? 'bg-wedding-gold' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center space-x-2 ${currentStage === 'complete' ? 'text-wedding-gold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStage === 'complete' ? 'bg-wedding-gold text-white' : 'bg-gray-200'
          }`}>
            {currentStage === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : '3'}
          </div>
          <span className="text-sm font-medium">Complete</span>
        </div>
      </div>
    </div>
  )

  const renderStage1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Will you be joining us?</CardTitle>
        <CardDescription className="text-center">
          Please let us know if you'll be attending our celebration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={stage1Form.handleSubmit(handleStage1Submit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              type="button"
              variant={stage1Form.watch('attending') === true ? 'default' : 'outline'}
              className={`h-20 flex-col ${
                stage1Form.watch('attending') === true 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'hover:bg-green-50'
              }`}
              onClick={() => stage1Form.setValue('attending', true)}
            >
              <CheckCircle2 className="w-6 h-6 mb-2" />
              Yes, I'll be there!
            </Button>
            <Button
              type="button"
              variant={stage1Form.watch('attending') === false ? 'default' : 'outline'}
              className={`h-20 flex-col ${
                stage1Form.watch('attending') === false 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'hover:bg-red-50'
              }`}
              onClick={() => stage1Form.setValue('attending', false)}
            >
              <AlertCircle className="w-6 h-6 mb-2" />
              Sorry, can't make it
            </Button>
          </div>

          {guestData.plusOneAllowed && stage1Form.watch('attending') === true && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <Label className="text-lg font-medium text-blue-900 mb-3 block">
                Plus One Guest
              </Label>
              <p className="text-blue-800 mb-4">
                You're invited to bring a guest! Will your plus one be joining us?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={stage1Form.watch('plusOneAttending') === true ? 'default' : 'outline'}
                  className={`h-16 ${
                    stage1Form.watch('plusOneAttending') === true 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'hover:bg-green-50'
                  }`}
                  onClick={() => stage1Form.setValue('plusOneAttending', true)}
                >
                  Yes, bringing a guest
                </Button>
                <Button
                  type="button"
                  variant={stage1Form.watch('plusOneAttending') === false ? 'default' : 'outline'}
                  className={`h-16 ${
                    stage1Form.watch('plusOneAttending') === false 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => stage1Form.setValue('plusOneAttending', false)}
                >
                  Just me
                </Button>
              </div>
            </div>
          )}

          {stage1Form.watch('attending') === false && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-800 text-center">
                We're sorry you can't make it! We'll miss you on our special day. 💔
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-wedding-gold hover:bg-wedding-gold/90" 
            size="lg"
            disabled={stage1Form.watch('attending') === undefined || isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {stage1Form.watch('attending') === true ? 'Continue to Event Details' : 'Submit RSVP'}
            {stage1Form.watch('attending') === true && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  const renderStage2 = () => (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Event Details & Preferences</CardTitle>
          <CardDescription className="text-center">
            Help us plan the perfect celebration by sharing your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={stage2Form.handleSubmit(handleStage2Submit)} className="space-y-8">
            {/* Ceremony Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Attendance</h3>
              <div className="grid gap-6">
                {guestData.ceremonies.map((ceremony) => (
                  <Card key={ceremony.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            {ceremony.name}
                            {ceremony.isMainCeremony && (
                              <span className="ml-2 px-2 py-1 bg-wedding-gold text-white text-xs rounded-full">
                                Main Event
                              </span>
                            )}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1 mt-2">
                            <p className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(ceremony.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {ceremony.startTime}
                            </p>
                            <p className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {ceremony.venueName}
                            </p>
                            {ceremony.description && (
                              <p className="text-gray-700 mt-2">{ceremony.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Will you attend?</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select attendance" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes, I'll be there</SelectItem>
                              <SelectItem value="no">No, I can't make it</SelectItem>
                              <SelectItem value="maybe">Maybe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Meal Choice</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select meal" />
                            </SelectTrigger>
                            <SelectContent>
                              {ceremony.mealOptions.map(option => (
                                <SelectItem key={option} value={option.toLowerCase()}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {guestData.plusOneAllowed && stage1Form.watch('plusOneAttending') && (
                          <div>
                            <Label className="text-sm font-medium">Plus One Meal</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select meal" />
                              </SelectTrigger>
                              <SelectContent>
                                {ceremony.mealOptions.map(option => (
                                  <SelectItem key={option} value={option.toLowerCase()}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dietary">Dietary Requirements</Label>
                <Textarea
                  id="dietary"
                  placeholder="Please let us know about any allergies or dietary restrictions..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="special">Special Requests</Label>
                <Textarea
                  id="special"
                  placeholder="Any special accommodations or requests..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToStage1}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Previous Step
              </Button>
              <Button 
                type="submit" 
                className="bg-wedding-gold hover:bg-wedding-gold/90" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Complete RSVP
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  const renderComplete = () => (
    <Card className="w-full max-w-2xl mx-auto text-center">
      <CardContent className="p-8">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Thank You for Your RSVP!
        </h2>
        <p className="text-gray-600 mb-6">
          We've received your response and can't wait to celebrate with you on our special day!
        </p>
        
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• You'll receive a confirmation email shortly</li>
            <li>• Event details and directions will be sent closer to the date</li>
            <li>• Feel free to update your RSVP anytime using this link</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => window.print()} 
            variant="outline" 
            className="w-full"
          >
            Print RSVP Confirmation
          </Button>
          <p className="text-sm text-gray-500">
            Have questions? Contact us at{' '}
            <a href="mailto:couple@example.com" className="text-wedding-gold hover:underline">
              couple@example.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-blush/20 to-wedding-sage/20 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {renderHeader()}
        {currentStage !== 'complete' && renderProgressBar()}
        
        {currentStage === 1 && renderStage1()}
        {currentStage === 2 && renderStage2()}
        {currentStage === 'complete' && renderComplete()}
      </div>
    </div>
  )
}