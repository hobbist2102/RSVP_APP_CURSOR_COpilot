import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Clock, Heart, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RsvpStage1Props {
  guestName: string
  eventTitle: string
  coupleNames: string
  location: string
  startDate: string
  rsvpDeadline?: string
  currentResponse?: 'confirmed' | 'declined' | 'pending'
  allowPlusOne: boolean
  onContinue: (response: 'confirmed' | 'declined', withPlusOne?: boolean) => void
  className?: string
}

export default function RsvpStage1({
  guestName,
  eventTitle,
  coupleNames,
  location,
  startDate,
  rsvpDeadline,
  currentResponse,
  allowPlusOne,
  onContinue,
  className
}: RsvpStage1Props) {
  const [rsvpResponse, setRsvpResponse] = useState<'confirmed' | 'declined' | ''>('')
  const [includePlusOne, setIncludePlusOne] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSubmit = async () => {
    if (!rsvpResponse) return

    setIsSubmitting(true)
    try {
      await onContinue(rsvpResponse, allowPlusOne ? includePlusOne : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDeadlinePassed = rsvpDeadline && new Date() > new Date(rsvpDeadline)

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      {/* Event Header */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <Heart className="h-8 w-8 text-purple-600 fill-current" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            {eventTitle}
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 font-medium">
            {coupleNames}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-gray-600 font-medium">
            📅 {formatDate(startDate)}
          </p>
          <p className="text-gray-600">
            📍 {location}
          </p>
          {rsvpDeadline && (
            <p className={cn(
              "text-sm font-medium",
              isDeadlinePassed ? "text-red-600" : "text-purple-600"
            )}>
              {isDeadlinePassed 
                ? `RSVP deadline has passed (${formatDate(rsvpDeadline)})`
                : `Please respond by ${formatDate(rsvpDeadline)}`
              }
            </p>
          )}
        </CardContent>
      </Card>

      {/* Personal Greeting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Hello, {guestName}! 👋
          </CardTitle>
          <CardDescription>
            We're so excited to celebrate with you! Please let us know if you'll be able to join us.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* RSVP Response Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Will you be attending?
          </CardTitle>
          <CardDescription>
            Please select your attendance status for our wedding celebration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={rsvpResponse}
            onValueChange={(value) => setRsvpResponse(value as 'confirmed' | 'declined')}
            className="space-y-4"
            disabled={isDeadlinePassed}
          >
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-green-50 transition-colors cursor-pointer">
              <RadioGroupItem value="confirmed" id="confirmed" />
              <Label htmlFor="confirmed" className="flex items-center gap-3 cursor-pointer flex-1">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">Yes, I'll be there! 🎉</div>
                  <div className="text-sm text-green-600">Can't wait to celebrate with you</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-red-50 transition-colors cursor-pointer">
              <RadioGroupItem value="declined" id="declined" />
              <Label htmlFor="declined" className="flex items-center gap-3 cursor-pointer flex-1">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <div className="font-semibold text-red-800">Sorry, I can't make it 😔</div>
                  <div className="text-sm text-red-600">Will be celebrating from afar</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Plus One Selection */}
          {allowPlusOne && rsvpResponse === 'confirmed' && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <Label className="font-semibold text-purple-800">
                      Bringing a plus one?
                    </Label>
                    <p className="text-sm text-purple-600">
                      You're welcome to bring a guest
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant={includePlusOne ? "outline" : "default"}
                    size="sm"
                    onClick={() => setIncludePlusOne(false)}
                    className={cn(
                      "transition-colors",
                      !includePlusOne && "bg-purple-600 hover:bg-purple-700"
                    )}
                  >
                    Just me
                  </Button>
                  <Button
                    type="button"
                    variant={includePlusOne ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIncludePlusOne(true)}
                    className={cn(
                      "transition-colors",
                      includePlusOne && "bg-purple-600 hover:bg-purple-700"
                    )}
                  >
                    + Guest
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!rsvpResponse || isSubmitting || isDeadlinePassed}
          size="lg"
          className={cn(
            "px-8 py-3 text-lg font-semibold transition-all duration-200",
            rsvpResponse === 'confirmed' 
              ? "bg-green-600 hover:bg-green-700" 
              : rsvpResponse === 'declined'
              ? "bg-red-600 hover:bg-red-700"
              : "bg-purple-600 hover:bg-purple-700"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : rsvpResponse === 'confirmed' ? (
            'Continue to Details →'
          ) : rsvpResponse === 'declined' ? (
            'Submit RSVP'
          ) : (
            'Please select your response'
          )}
        </Button>
      </div>

      {/* Current Status Indicator */}
      {currentResponse && currentResponse !== 'pending' && (
        <Card className="border-l-4 border-l-purple-500 bg-purple-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {currentResponse === 'confirmed' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                Your current response: {currentResponse === 'confirmed' ? 'Attending' : 'Not Attending'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              You can update your response anytime before the deadline.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Deadline Warning */}
      {isDeadlinePassed && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                RSVP Deadline Passed
              </span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              The RSVP deadline has passed. Please contact the couple directly if you need to make changes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}