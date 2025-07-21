import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Church, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Circle,
  Utensils,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Ceremony {
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
}

interface CeremonyResponse {
  ceremonyId: number
  attending: boolean
  mealPreference?: string
  specialDietaryNeeds?: string
}

interface CeremonySelectionProps {
  ceremonies: Ceremony[]
  currentResponses: CeremonyResponse[]
  showSelectAll: boolean
  onUpdate: (responses: CeremonyResponse[]) => void
  className?: string
}

const mealOptions = [
  'Chicken',
  'Beef', 
  'Fish',
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Kids Meal',
  'Other'
]

export default function CeremonySelection({
  ceremonies,
  currentResponses,
  showSelectAll,
  onUpdate,
  className
}: CeremonySelectionProps) {
  const [responses, setResponses] = useState<CeremonyResponse[]>(currentResponses)

  useEffect(() => {
    setResponses(currentResponses)
  }, [currentResponses])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getResponse = (ceremonyId: number) => {
    return responses.find(r => r.ceremonyId === ceremonyId) || {
      ceremonyId,
      attending: false,
      mealPreference: '',
      specialDietaryNeeds: ''
    }
  }

  const updateResponse = (ceremonyId: number, updates: Partial<CeremonyResponse>) => {
    const newResponses = responses.filter(r => r.ceremonyId !== ceremonyId)
    const updatedResponse = { ...getResponse(ceremonyId), ...updates }
    
    setResponses([...newResponses, updatedResponse])
    onUpdate([...newResponses, updatedResponse])
  }

  const handleSelectAll = () => {
    const allSelected = ceremonies.every(ceremony => 
      getResponse(ceremony.id).attending
    )

    const newResponses = ceremonies.map(ceremony => ({
      ceremonyId: ceremony.id,
      attending: !allSelected,
      mealPreference: getResponse(ceremony.id).mealPreference || '',
      specialDietaryNeeds: getResponse(ceremony.id).specialDietaryNeeds || ''
    }))

    setResponses(newResponses)
    onUpdate(newResponses)
  }

  const attendingCount = responses.filter(r => r.attending).length
  const totalCeremonies = ceremonies.length
  const allSelected = totalCeremonies > 0 && attendingCount === totalCeremonies

  if (ceremonies.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <Church className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No ceremonies available for selection.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Church className="h-6 w-6" />
            Select Ceremonies to Attend
          </CardTitle>
          <CardDescription>
            Choose which events you'd like to attend during the celebration
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Select All Option */}
      {showSelectAll && totalCeremonies > 1 && (
        <Card className="border-2 border-purple-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-semibold text-purple-800 cursor-pointer">
                  Select All Ceremonies
                </Label>
              </div>
              <Badge variant={allSelected ? "default" : "outline"} className="bg-purple-100 text-purple-800">
                {attendingCount} of {totalCeremonies} selected
              </Badge>
            </div>
            <p className="text-sm text-purple-600 mt-2 ml-6">
              Join us for the complete celebration experience
            </p>
          </CardContent>
        </Card>
      )}

      {/* Individual Ceremonies */}
      <div className="space-y-4">
        {ceremonies.map((ceremony) => {
          const response = getResponse(ceremony.id)
          const isAttending = response.attending

          return (
            <Card 
              key={ceremony.id} 
              className={cn(
                "transition-all duration-200 border-2",
                isAttending 
                  ? "border-green-200 bg-green-50 shadow-md" 
                  : "border-gray-200 hover:border-purple-200"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`ceremony-${ceremony.id}`}
                      checked={isAttending}
                      onCheckedChange={(checked) => 
                        updateResponse(ceremony.id, { attending: checked as boolean })
                      }
                    />
                    <div>
                      <Label 
                        htmlFor={`ceremony-${ceremony.id}`}
                        className="font-semibold text-lg cursor-pointer"
                      >
                        {ceremony.name}
                      </Label>
                      {ceremony.ceremonyType && (
                        <Badge variant="outline" className="ml-2">
                          {ceremony.ceremonyType}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isAttending && (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Ceremony Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {formatDate(ceremony.date)} • {formatTime(ceremony.startTime)} - {formatTime(ceremony.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{ceremony.location}</span>
                  </div>
                  {ceremony.maxCapacity && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Capacity: {ceremony.maxCapacity} guests</span>
                    </div>
                  )}
                  {ceremony.attireCode && (
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-500" />
                      <span>Attire: {ceremony.attireCode}</span>
                    </div>
                  )}
                </div>

                {ceremony.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {ceremony.description}
                  </p>
                )}

                {/* Meal Selection (if attending) */}
                {isAttending && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Utensils className="h-4 w-4" />
                        Meal Preferences
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`meal-${ceremony.id}`} className="text-sm">
                            Preferred Meal
                          </Label>
                          <Select
                            value={response.mealPreference || ''}
                            onValueChange={(value) => 
                              updateResponse(ceremony.id, { mealPreference: value })
                            }
                          >
                            <SelectTrigger id={`meal-${ceremony.id}`}>
                              <SelectValue placeholder="Select meal preference" />
                            </SelectTrigger>
                            <SelectContent>
                              {mealOptions.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor={`dietary-${ceremony.id}`} className="text-sm">
                            Special Dietary Needs
                          </Label>
                          <input
                            id={`dietary-${ceremony.id}`}
                            type="text"
                            value={response.specialDietaryNeeds || ''}
                            onChange={(e) => 
                              updateResponse(ceremony.id, { specialDietaryNeeds: e.target.value })
                            }
                            placeholder="Any special requirements..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary */}
      {attendingCount > 0 && (
        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">
                  You're attending {attendingCount} {attendingCount === 1 ? 'ceremony' : 'ceremonies'}
                </h4>
                <p className="text-sm text-green-600">
                  We're so excited to celebrate with you!
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}