import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  Utensils, 
  AlertTriangle, 
  MessageSquare, 
  Baby,
  Bed,
  Plane,
  Calendar,
  ChevronLeft,
  Save
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChildDetail {
  name: string
  age: number
  dietaryRestrictions?: string
}

interface RsvpStage2Props {
  guestData: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
    plusOneAllowed: boolean
    plusOneConfirmed?: boolean
    plusOneName?: string
    plusOneEmail?: string
    plusOnePhone?: string
    plusOneRelationship?: string
    dietaryRestrictions?: string
    allergies?: string
    specialRequests?: string
    childrenDetails: ChildDetail[]
    needsAccommodation: boolean
    accommodationPreference?: string
    needsFlightAssistance: boolean
    arrivalDate?: string
    departureDate?: string
    notes?: string
  }
  allowChildrenDetails: boolean
  onSave: (data: any) => Promise<void>
  onBack: () => void
  className?: string
}

export default function RsvpStage2({
  guestData,
  allowChildrenDetails,
  onSave,
  onBack,
  className
}: RsvpStage2Props) {
  const [formData, setFormData] = useState(guestData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-save after 2 seconds of no changes
    setTimeout(() => {
      autoSave()
    }, 2000)
  }

  const autoSave = async () => {
    setAutoSaving(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setAutoSaving(false)
    }
  }

  const addChild = () => {
    const newChild: ChildDetail = { name: '', age: 0 }
    setFormData(prev => ({
      ...prev,
      childrenDetails: [...prev.childrenDetails, newChild]
    }))
  }

  const updateChild = (index: number, field: keyof ChildDetail, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      childrenDetails: prev.childrenDetails.map((child, i) => 
        i === index ? { ...child, [field]: value } : child
      )
    }))
  }

  const removeChild = (index: number) => {
    setFormData(prev => ({
      ...prev,
      childrenDetails: prev.childrenDetails.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSave(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-gray-900">
            Tell us more about yourself
          </CardTitle>
          <CardDescription>
            Help us make your experience perfect by sharing some details
          </CardDescription>
          {autoSaving && (
            <Badge variant="outline" className="w-fit mx-auto">
              <Save className="h-3 w-3 mr-1" />
              Auto-saving...
            </Badge>
          )}
        </CardHeader>
      </Card>

      {/* Plus One Details */}
      {formData.plusOneAllowed && formData.plusOneConfirmed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Guest Details
            </CardTitle>
            <CardDescription>
              Please provide information about your plus one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plusOneName">Guest Name *</Label>
                <Input
                  id="plusOneName"
                  value={formData.plusOneName || ''}
                  onChange={(e) => updateField('plusOneName', e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="plusOneRelationship">Relationship</Label>
                <Input
                  id="plusOneRelationship"
                  value={formData.plusOneRelationship || ''}
                  onChange={(e) => updateField('plusOneRelationship', e.target.value)}
                  placeholder="e.g., Partner, Friend, Family"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plusOneEmail">Guest Email</Label>
                <Input
                  id="plusOneEmail"
                  type="email"
                  value={formData.plusOneEmail || ''}
                  onChange={(e) => updateField('plusOneEmail', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="plusOnePhone">Guest Phone</Label>
                <Input
                  id="plusOnePhone"
                  type="tel"
                  value={formData.plusOnePhone || ''}
                  onChange={(e) => updateField('plusOnePhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dietary Restrictions & Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Dietary Information
          </CardTitle>
          <CardDescription>
            Let us know about any dietary restrictions or allergies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
            <Textarea
              id="dietaryRestrictions"
              value={formData.dietaryRestrictions || ''}
              onChange={(e) => updateField('dietaryRestrictions', e.target.value)}
              placeholder="e.g., Vegetarian, Vegan, Gluten-free, Kosher, Halal..."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="allergies" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Allergies
            </Label>
            <Textarea
              id="allergies"
              value={formData.allergies || ''}
              onChange={(e) => updateField('allergies', e.target.value)}
              placeholder="Please list any food allergies or severe dietary restrictions..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Children Details */}
      {allowChildrenDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Children Attending
            </CardTitle>
            <CardDescription>
              If you're bringing children, please provide their details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.childrenDetails.map((child, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Child {index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChild(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`child-name-${index}`}>Name</Label>
                    <Input
                      id={`child-name-${index}`}
                      value={child.name}
                      onChange={(e) => updateChild(index, 'name', e.target.value)}
                      placeholder="Child's name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`child-age-${index}`}>Age</Label>
                    <Input
                      id={`child-age-${index}`}
                      type="number"
                      value={child.age}
                      onChange={(e) => updateChild(index, 'age', parseInt(e.target.value) || 0)}
                      placeholder="Age"
                      min="0"
                      max="18"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`child-dietary-${index}`}>Dietary Restrictions</Label>
                  <Input
                    id={`child-dietary-${index}`}
                    value={child.dietaryRestrictions || ''}
                    onChange={(e) => updateChild(index, 'dietaryRestrictions', e.target.value)}
                    placeholder="Any dietary restrictions for this child"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addChild}
              className="w-full"
            >
              <Baby className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Accommodation & Travel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Accommodation & Travel
          </CardTitle>
          <CardDescription>
            Help us assist with your travel and accommodation needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium">Need accommodation assistance?</Label>
              <p className="text-sm text-gray-600">
                We can help recommend nearby hotels or arrangements
              </p>
            </div>
            <Switch
              checked={formData.needsAccommodation}
              onCheckedChange={(checked) => updateField('needsAccommodation', checked)}
            />
          </div>

          {formData.needsAccommodation && (
            <div>
              <Label htmlFor="accommodationPreference">Accommodation Preferences</Label>
              <Textarea
                id="accommodationPreference"
                value={formData.accommodationPreference || ''}
                onChange={(e) => updateField('accommodationPreference', e.target.value)}
                placeholder="Let us know your accommodation preferences, budget range, or any special needs..."
                rows={3}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium">Need flight assistance?</Label>
              <p className="text-sm text-gray-600">
                We can help with travel planning and group bookings
              </p>
            </div>
            <Switch
              checked={formData.needsFlightAssistance}
              onCheckedChange={(checked) => updateField('needsFlightAssistance', checked)}
            />
          </div>

          {formData.needsFlightAssistance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Planned Arrival Date
                </Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate || ''}
                  onChange={(e) => updateField('arrivalDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="departureDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Planned Departure Date
                </Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formData.departureDate || ''}
                  onChange={(e) => updateField('departureDate', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Special Requests
          </CardTitle>
          <CardDescription>
            Anything else you'd like us to know?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.specialRequests || ''}
            onChange={(e) => updateField('specialRequests', e.target.value)}
            placeholder="Any special requests, accessibility needs, or messages for the couple..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Submitting RSVP...
            </>
          ) : (
            'Complete RSVP'
          )}
        </Button>
      </div>
    </div>
  )
}