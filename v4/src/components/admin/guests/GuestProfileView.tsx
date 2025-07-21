'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  Utensils, 
  Bed, 
  Plane, 
  Baby, 
  FileText, 
  Edit, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Family,
  Star,
  AlertTriangle,
  Globe,
  Car,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Using shared schema field mappings
interface Guest {
  id: number
  eventId: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  countryCode?: string
  side: 'bride' | 'groom' | 'both'
  relationship?: string
  isFamily: boolean
  gender?: string
  salutation?: string
  address?: string
  rsvpStatus: 'pending' | 'confirmed' | 'declined'
  rsvpDate?: string
  plusOneAllowed: boolean
  plusOneConfirmed: boolean
  plusOneName?: string
  plusOneEmail?: string
  plusOnePhone?: string
  plusOneCountryCode?: string
  plusOneRelationship?: string
  plusOneGender?: string
  plusOneSalutation?: string
  childrenDetails: Array<{
    name: string
    age: number
    gender?: string
    salutation?: string
    dietaryRestrictions?: string
  }>
  childrenNotes?: string
  needsAccommodation: boolean
  accommodationPreference?: string
  needsFlightAssistance: boolean
  arrivalDate?: string
  arrivalTime?: string
  departureDate?: string
  departureTime?: string
  travelMode?: string
  flightStatus?: string
  dietaryRestrictions?: string
  allergies?: string
  specialRequests?: string
  notes?: string
  tableAssignment?: string
  giftTracking?: string
  createdAt: string
  updatedAt?: string
  
  // Guest ceremony attendance
  guestCeremonies?: Array<{
    ceremonyId: number
    attending: boolean
    ceremonies: {
      id: number
      name: string
      date: string
      startTime: string
      location: string
    }
  }>
  
  // Travel information
  travelInfo?: {
    flightNumber?: string
    airline?: string
    terminal?: string
    gate?: string
    needsTransportation: boolean
    transportationType?: string
    specialRequirements?: string
  }
}

interface GuestProfileViewProps {
  guest: Guest
  onEdit?: () => void
  onClose?: () => void
  className?: string
}

export default function GuestProfileView({
  guest,
  onEdit,
  onClose,
  className
}: GuestProfileViewProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Not provided'
    return timeString
  }

  const getRsvpStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" />Confirmed</Badge>
      case 'declined':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>
      default:
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  const getSideBadge = (side: string) => {
    switch (side) {
      case 'bride':
        return <Badge variant="outline" className="border-pink-200 text-pink-700">Bride's Side</Badge>
      case 'groom':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">Groom's Side</Badge>
      default:
        return <Badge variant="outline" className="border-purple-200 text-purple-700">Both Sides</Badge>
    }
  }

  const getTotalAttending = () => {
    let count = guest.rsvpStatus === 'confirmed' ? 1 : 0
    if (guest.plusOneConfirmed) count += 1
    if (guest.childrenDetails?.length) count += guest.childrenDetails.length
    return count
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                  {guest.salutation && `${guest.salutation} `}{guest.firstName} {guest.lastName}
                  {guest.isFamily && <Family className="h-5 w-5 text-blue-600" />}
                </CardTitle>
                <div className="flex items-center gap-3 mt-1">
                  {getSideBadge(guest.side)}
                  {guest.relationship && (
                    <span className="text-gray-600">{guest.relationship}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button onClick={onEdit} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Guest
                </Button>
              )}
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rsvp">RSVP Details</TabsTrigger>
          <TabsTrigger value="travel">Travel & Stay</TabsTrigger>
          <TabsTrigger value="ceremonies">Ceremonies</TabsTrigger>
          <TabsTrigger value="notes">Notes & Tracking</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guest.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{guest.email}</p>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>
                )}
                
                {guest.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {guest.countryCode && `${guest.countryCode} `}{guest.phone}
                      </p>
                      <p className="text-sm text-gray-500">Phone</p>
                    </div>
                  </div>
                )}

                {guest.address && (
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{guest.address}</p>
                      <p className="text-sm text-gray-500">Address</p>
                    </div>
                  </div>
                )}

                {guest.gender && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{guest.gender}</p>
                      <p className="text-sm text-gray-500">Gender</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RSVP Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  RSVP Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {getRsvpStatusBadge(guest.rsvpStatus)}
                </div>

                {guest.rsvpDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Date</span>
                    <span className="font-medium">{formatDate(guest.rsvpDate)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Attending</span>
                  <span className="font-medium text-lg">{getTotalAttending()} person{getTotalAttending() !== 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Added to System</span>
                  <span className="font-medium">{formatDate(guest.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RSVP Details Tab */}
        <TabsContent value="rsvp" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plus One Information */}
            {guest.plusOneAllowed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Plus One Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plus One Allowed</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Yes</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plus One Confirmed</span>
                    <Badge variant={guest.plusOneConfirmed ? "default" : "outline"}>
                      {guest.plusOneConfirmed ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  {guest.plusOneName && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Plus One Name</p>
                      <p className="font-medium">
                        {guest.plusOneSalutation && `${guest.plusOneSalutation} `}{guest.plusOneName}
                      </p>
                    </div>
                  )}

                  {guest.plusOneEmail && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Plus One Email</p>
                      <p className="font-medium">{guest.plusOneEmail}</p>
                    </div>
                  )}

                  {guest.plusOnePhone && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Plus One Phone</p>
                      <p className="font-medium">
                        {guest.plusOneCountryCode && `${guest.plusOneCountryCode} `}{guest.plusOnePhone}
                      </p>
                    </div>
                  )}

                  {guest.plusOneRelationship && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Relationship</p>
                      <p className="font-medium">{guest.plusOneRelationship}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Children Information */}
            {guest.childrenDetails && guest.childrenDetails.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-5 w-5" />
                    Children ({guest.childrenDetails.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {guest.childrenDetails.map((child, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">
                        {child.salutation && `${child.salutation} `}{child.name}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Age: {child.age} years old</p>
                        {child.gender && <p>Gender: {child.gender}</p>}
                        {child.dietaryRestrictions && (
                          <p>Dietary: {child.dietaryRestrictions}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {guest.childrenNotes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-1">Special Notes</p>
                      <p className="text-sm bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                        {guest.childrenNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dietary Information */}
            {(guest.dietaryRestrictions || guest.allergies) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Dietary Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {guest.dietaryRestrictions && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Dietary Restrictions</p>
                      <p className="font-medium">{guest.dietaryRestrictions}</p>
                    </div>
                  )}

                  {guest.allergies && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Allergies</p>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="font-medium">
                          {guest.allergies}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Travel & Stay Tab */}
        <TabsContent value="travel" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Travel Information */}
            {(guest.needsFlightAssistance || guest.arrivalDate || guest.departureDate) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Travel Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Needs Flight Assistance</span>
                    <Badge variant={guest.needsFlightAssistance ? "default" : "outline"}>
                      {guest.needsFlightAssistance ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  {guest.travelMode && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Travel Mode</p>
                      <p className="font-medium">{guest.travelMode}</p>
                    </div>
                  )}

                  {guest.arrivalDate && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Arrival</p>
                      <p className="font-medium">
                        {formatDate(guest.arrivalDate)}
                        {guest.arrivalTime && ` at ${formatTime(guest.arrivalTime)}`}
                      </p>
                    </div>
                  )}

                  {guest.departureDate && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Departure</p>
                      <p className="font-medium">
                        {formatDate(guest.departureDate)}
                        {guest.departureTime && ` at ${formatTime(guest.departureTime)}`}
                      </p>
                    </div>
                  )}

                  {guest.flightStatus && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Flight Status</p>
                      <Badge variant="outline">{guest.flightStatus}</Badge>
                    </div>
                  )}

                  {guest.travelInfo && (
                    <div className="space-y-2">
                      {guest.travelInfo.flightNumber && (
                        <p><span className="text-gray-600">Flight:</span> {guest.travelInfo.flightNumber}</p>
                      )}
                      {guest.travelInfo.airline && (
                        <p><span className="text-gray-600">Airline:</span> {guest.travelInfo.airline}</p>
                      )}
                      {guest.travelInfo.terminal && (
                        <p><span className="text-gray-600">Terminal:</span> {guest.travelInfo.terminal}</p>
                      )}
                      {guest.travelInfo.gate && (
                        <p><span className="text-gray-600">Gate:</span> {guest.travelInfo.gate}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Accommodation Information */}
            {guest.needsAccommodation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    Accommodation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Needs Accommodation</span>
                    <Badge className="bg-blue-100 text-blue-800">Yes</Badge>
                  </div>

                  {guest.accommodationPreference && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Preferences</p>
                      <p className="font-medium">{guest.accommodationPreference}</p>
                    </div>
                  )}

                  {guest.travelInfo?.needsTransportation && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Transportation</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Car className="h-3 w-3 mr-1" />
                        Needs Transportation
                      </Badge>
                      {guest.travelInfo.transportationType && (
                        <p className="text-sm mt-1">Type: {guest.travelInfo.transportationType}</p>
                      )}
                    </div>
                  )}

                  {guest.travelInfo?.specialRequirements && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Special Requirements</p>
                      <p className="text-sm bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                        {guest.travelInfo.specialRequirements}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Ceremonies Tab */}
        <TabsContent value="ceremonies" className="space-y-6">
          {guest.guestCeremonies && guest.guestCeremonies.length > 0 ? (
            <div className="space-y-4">
              {guest.guestCeremonies.map((gc) => (
                <Card key={gc.ceremonyId}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{gc.ceremonies.name}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(gc.ceremonies.date)} at {formatTime(gc.ceremonies.startTime)}
                        </p>
                        <p className="text-sm text-gray-500">{gc.ceremonies.location}</p>
                      </div>
                      <Badge variant={gc.attending ? "default" : "outline"} className={cn(
                        gc.attending 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {gc.attending ? 'Attending' : 'Not Attending'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No ceremony information available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notes & Tracking Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notes & Special Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notes & Special Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guest.specialRequests && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm">{guest.specialRequests}</p>
                    </div>
                  </div>
                )}

                {guest.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Internal Notes</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">{guest.notes}</p>
                    </div>
                  </div>
                )}

                {!guest.specialRequests && !guest.notes && (
                  <div className="text-center text-gray-500 py-4">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No special requests or notes</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Event Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guest.tableAssignment && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Table Assignment</p>
                    <Badge variant="outline">{guest.tableAssignment}</Badge>
                  </div>
                )}

                {guest.giftTracking && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Gift Information</p>
                    <p className="text-sm">{guest.giftTracking}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">Guest Type</p>
                  <div className="flex gap-2">
                    {guest.isFamily && (
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        <Family className="h-3 w-3 mr-1" />
                        Family Member
                      </Badge>
                    )}
                  </div>
                </div>

                {guest.updatedAt && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="text-sm font-medium">{formatDate(guest.updatedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}