'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import RsvpStage1 from '@/components/rsvp/RsvpStage1'
import RsvpStage2 from '@/components/rsvp/RsvpStage2'
import CeremonySelection from '@/components/rsvp/CeremonySelection'
import { AlertCircle, CheckCircle, Heart, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RsvpData {
  token: string
  guest: {
    id: number
    firstName: string
    lastName: string
    email?: string
    phone?: string
    side: string
    relationship?: string
    rsvpStatus: string
    rsvpDate?: string
    plusOneAllowed: boolean
    plusOneConfirmed: boolean
    plusOneName?: string
    plusOneEmail?: string
    plusOnePhone?: string
    plusOneRelationship?: string
    dietaryRestrictions?: string
    allergies?: string
    specialRequests?: string
    childrenDetails: Array<{
      name: string
      age: number
      dietaryRestrictions?: string
    }>
    needsAccommodation: boolean
    accommodationPreference?: string
    needsFlightAssistance: boolean
    arrivalDate?: string
    departureDate?: string
    notes?: string
  }
  event: {
    id: number
    title: string
    coupleNames: string
    brideName: string
    groomName: string
    startDate: string
    endDate: string
    location: string
    description?: string
    rsvpDeadline?: string
    allowPlusOnes: boolean
    allowChildrenDetails: boolean
    rsvpWelcomeTitle?: string
    rsvpWelcomeMessage?: string
    rsvpCustomBranding?: string
    rsvpShowSelectAll: boolean
    primaryColor: string
    secondaryColor: string
    logoUrl?: string
    bannerUrl?: string
  }
  ceremonies: Array<{
    id: number
    name: string
    date: string
    startTime: string
    endTime: string
    location: string
    description?: string
    attireCode?: string
    ceremonyType?: string
    maxCapacity?: number
  }>
  currentCeremonyResponses: Array<{
    ceremonyId: number
    attending: boolean
    mealPreference?: string
    specialDietaryNeeds?: string
  }>
}

type Stage = 'loading' | 'stage1' | 'ceremonies' | 'stage2' | 'complete' | 'error'

export default function RsvpPageClient({ token }: { token: string }) {
  const [stage, setStage] = useState<Stage>('loading')
  const [rsvpData, setRsvpData] = useState<RsvpData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentRsvpStatus, setCurrentRsvpStatus] = useState<'confirmed' | 'declined' | ''>('')
  const [ceremonyResponses, setCeremonyResponses] = useState<any[]>([])

  useEffect(() => {
    fetchRsvpData()
  }, [token])

  const fetchRsvpData = async () => {
    try {
      const response = await fetch(`/api/rsvp/${token}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load RSVP data')
      }

      setRsvpData(result.data)
      setCurrentRsvpStatus(result.data.guest.rsvpStatus === 'pending' ? '' : result.data.guest.rsvpStatus)
      setCeremonyResponses(result.data.currentCeremonyResponses || [])
      setStage('stage1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RSVP')
      setStage('error')
    }
  }

  const handleStage1Continue = async (response: 'confirmed' | 'declined', withPlusOne?: boolean) => {
    setCurrentRsvpStatus(response)

    if (response === 'declined') {
      // For declined, submit immediately
      await submitRsvp(response, withPlusOne)
      setStage('complete')
      return
    }

    // For confirmed, check if we need ceremony selection
    if (rsvpData?.ceremonies && rsvpData.ceremonies.length > 0) {
      setStage('ceremonies')
    } else {
      setStage('stage2')
    }
  }

  const handleCeremonyContinue = (responses: any[]) => {
    setCeremonyResponses(responses)
    setStage('stage2')
  }

  const handleStage2Save = async (formData: any) => {
    await submitRsvp(currentRsvpStatus, undefined, formData, ceremonyResponses)
    setStage('complete')
  }

  const submitRsvp = async (
    status: 'confirmed' | 'declined', 
    withPlusOne?: boolean, 
    detailsData?: any,
    ceremonies?: any[]
  ) => {
    try {
      const requestData: any = {
        rsvpStatus: status
      }

      if (withPlusOne !== undefined && rsvpData?.event.allowPlusOnes) {
        requestData.plusOneConfirmed = withPlusOne
      }

      if (detailsData) {
        Object.assign(requestData, detailsData)
      }

      if (ceremonies && ceremonies.length > 0) {
        requestData.ceremonyResponses = ceremonies
      }

      const response = await fetch(`/api/rsvp/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit RSVP')
      }

      // Refresh data to show updated status
      if (rsvpData) {
        setRsvpData({
          ...rsvpData,
          guest: {
            ...rsvpData.guest,
            rsvpStatus: status,
            rsvpDate: new Date().toISOString(),
            ...detailsData
          }
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit RSVP')
      throw err
    }
  }

  const getStageProgress = () => {
    const stages = ['stage1', 'ceremonies', 'stage2', 'complete']
    const currentIndex = stages.indexOf(stage)
    const totalStages = rsvpData?.ceremonies && rsvpData.ceremonies.length > 0 ? 4 : 3
    const progressStages = rsvpData?.ceremonies && rsvpData.ceremonies.length > 0 ? stages : ['stage1', 'stage2', 'complete']
    
    return {
      current: Math.max(0, progressStages.indexOf(stage)) + 1,
      total: progressStages.length
    }
  }

  if (stage === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600">Loading your invitation...</p>
        </div>
      </div>
    )
  }

  if (stage === 'error' || !rsvpData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {error?.includes('not found') ? 'Invitation Not Found' : 'Something went wrong'}
                </h1>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error || 'Unable to load your RSVP invitation. Please check your link or contact the couple.'}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (stage === 'complete') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
            <CardContent className="pt-8 pb-6 text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentRsvpStatus === 'confirmed' 
                    ? '🎉 RSVP Confirmed!' 
                    : '💔 Thanks for letting us know'
                  }
                </h1>
                <p className="text-gray-700">
                  {currentRsvpStatus === 'confirmed'
                    ? `Thank you for confirming your attendance! We can't wait to celebrate with you.`
                    : `We're sorry you can't join us, but we appreciate you letting us know. You'll be in our hearts on the special day.`
                  }
                </p>
              </div>

              {currentRsvpStatus === 'confirmed' && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• You'll receive a confirmation email shortly</p>
                    <p>• Watch for updates and additional details</p>
                    <p>• Feel free to update your RSVP using this same link</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Heart className="h-4 w-4 fill-current text-pink-500" />
                <span>{rsvpData.event.coupleNames}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { current, total } = getStageProgress()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Custom Branding */}
      {rsvpData.event.bannerUrl && (
        <div className="mb-8">
          <img 
            src={rsvpData.event.bannerUrl} 
            alt="Wedding Banner"
            className="w-full h-32 md:h-48 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Welcome Message */}
      {rsvpData.event.rsvpWelcomeTitle && stage === 'stage1' && (
        <Card className="mb-6 border-none shadow-lg" style={{ 
          backgroundColor: rsvpData.event.primaryColor + '10',
          borderColor: rsvpData.event.primaryColor + '30'
        }}>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2" style={{ color: rsvpData.event.primaryColor }}>
              {rsvpData.event.rsvpWelcomeTitle}
            </h2>
            {rsvpData.event.rsvpWelcomeMessage && (
              <p className="text-gray-700">
                {rsvpData.event.rsvpWelcomeMessage}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      {stage !== 'stage1' && (
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-600">Step {current} of {total}</span>
            <div className="flex space-x-1">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i < current ? "bg-purple-600" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stage Content */}
      {stage === 'stage1' && (
        <RsvpStage1
          guestName={`${rsvpData.guest.firstName} ${rsvpData.guest.lastName}`}
          eventTitle={rsvpData.event.title}
          coupleNames={rsvpData.event.coupleNames}
          location={rsvpData.event.location}
          startDate={rsvpData.event.startDate}
          rsvpDeadline={rsvpData.event.rsvpDeadline}
          currentResponse={rsvpData.guest.rsvpStatus as any}
          allowPlusOne={rsvpData.event.allowPlusOnes && rsvpData.guest.plusOneAllowed}
          onContinue={handleStage1Continue}
        />
      )}

      {stage === 'ceremonies' && (
        <CeremonySelection
          ceremonies={rsvpData.ceremonies}
          currentResponses={ceremonyResponses}
          showSelectAll={rsvpData.event.rsvpShowSelectAll}
          onUpdate={setCeremonyResponses}
        />
      )}

      {stage === 'ceremonies' && (
        <div className="max-w-2xl mx-auto mt-6 flex justify-center">
          <button
            onClick={() => handleCeremonyContinue(ceremonyResponses)}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Continue to Details →
          </button>
        </div>
      )}

      {stage === 'stage2' && (
        <RsvpStage2
          guestData={{
            firstName: rsvpData.guest.firstName,
            lastName: rsvpData.guest.lastName,
            email: rsvpData.guest.email,
            phone: rsvpData.guest.phone,
            plusOneAllowed: rsvpData.guest.plusOneAllowed,
            plusOneConfirmed: rsvpData.guest.plusOneConfirmed,
            plusOneName: rsvpData.guest.plusOneName,
            plusOneEmail: rsvpData.guest.plusOneEmail,
            plusOnePhone: rsvpData.guest.plusOnePhone,
            plusOneRelationship: rsvpData.guest.plusOneRelationship,
            dietaryRestrictions: rsvpData.guest.dietaryRestrictions,
            allergies: rsvpData.guest.allergies,
            specialRequests: rsvpData.guest.specialRequests,
            childrenDetails: rsvpData.guest.childrenDetails,
            needsAccommodation: rsvpData.guest.needsAccommodation,
            accommodationPreference: rsvpData.guest.accommodationPreference,
            needsFlightAssistance: rsvpData.guest.needsFlightAssistance,
            arrivalDate: rsvpData.guest.arrivalDate,
            departureDate: rsvpData.guest.departureDate,
            notes: rsvpData.guest.notes
          }}
          allowChildrenDetails={rsvpData.event.allowChildrenDetails}
          onSave={handleStage2Save}
          onBack={() => {
            if (rsvpData.ceremonies.length > 0) {
              setStage('ceremonies')
            } else {
              setStage('stage1')
            }
          }}
        />
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>Need help? Contact {rsvpData.event.coupleNames} directly.</p>
      </div>
    </div>
  )
}