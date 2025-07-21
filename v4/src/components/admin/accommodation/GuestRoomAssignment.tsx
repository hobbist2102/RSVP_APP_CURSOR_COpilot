'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Bed, 
  Search, 
  Filter, 
  UserCheck, 
  UserX,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Using shared schema field mappings
interface Guest {
  id: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  side: string
  rsvpStatus: string
  needsAccommodation: boolean
  accommodationNotes?: string
  hasAllocation?: boolean
}

interface Accommodation {
  id: number
  name: string
  roomType: string
  bedType?: string
  maxOccupancy: number
  totalRooms: number
  allocatedRooms: number
  availableRooms: number
  hotel?: {
    id: number
    name: string
  }
}

interface RoomAllocation {
  id: number
  accommodationId: number
  guestId: number
  roomNumber?: string
  checkInDate?: string
  checkOutDate?: string
  checkInStatus: string
  guest: Guest
  accommodation: Accommodation
}

interface GuestRoomAssignmentProps {
  eventId: number
  className?: string
}

export default function GuestRoomAssignment({
  eventId,
  className
}: GuestRoomAssignmentProps) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [allocations, setAllocations] = useState<RoomAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sideFilter, setSideFilter] = useState<string>('all')
  const [rsvpFilter, setRsvpFilter] = useState<string>('confirmed')
  const [accommodationFilter, setAccommodationFilter] = useState<string>('unassigned')
  const [selectedGuests, setSelectedGuests] = useState<number[]>([])
  const [selectedAccommodation, setSelectedAccommodation] = useState<number | null>(null)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Assignment form data
  const [assignmentData, setAssignmentData] = useState({
    checkInDate: '',
    checkOutDate: '',
    roomNumber: '',
    specialRequests: '',
    includesPlusOne: false,
    includesChildren: false,
    childrenCount: 0
  })

  useEffect(() => {
    fetchData()
  }, [eventId])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchGuests(),
        fetchAccommodations(),
        fetchAllocations()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGuests = async () => {
    try {
      const response = await fetch(`/api/guests?eventId=${eventId}`)
      const result = await response.json()
      if (result.success) {
        setGuests(result.data.map((guest: any) => ({
          ...guest,
          hasAllocation: false // Will be updated when allocations are fetched
        })))
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }

  const fetchAccommodations = async () => {
    try {
      const response = await fetch(`/api/accommodation/rooms?eventId=${eventId}`)
      const result = await response.json()
      if (result.success) {
        setAccommodations(result.data.map((acc: any) => ({
          ...acc,
          availableRooms: acc.totalRooms - acc.allocatedRooms
        })))
      }
    } catch (error) {
      console.error('Error fetching accommodations:', error)
    }
  }

  const fetchAllocations = async () => {
    try {
      const response = await fetch(`/api/accommodation/allocations?eventId=${eventId}`)
      const result = await response.json()
      if (result.success) {
        setAllocations(result.data)
        
        // Update guests with allocation status
        const allocatedGuestIds = new Set(result.data.map((alloc: any) => alloc.guestId))
        setGuests(prev => prev.map(guest => ({
          ...guest,
          hasAllocation: allocatedGuestIds.has(guest.id)
        })))
      }
    } catch (error) {
      console.error('Error fetching allocations:', error)
    }
  }

  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      // Search filter
      const searchMatch = !searchQuery || 
        `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email?.toLowerCase().includes(searchQuery.toLowerCase())

      // Side filter
      const sideMatch = sideFilter === 'all' || guest.side === sideFilter

      // RSVP filter
      const rsvpMatch = rsvpFilter === 'all' || guest.rsvpStatus === rsvpFilter

      // Accommodation filter
      let accommodationMatch = true
      if (accommodationFilter === 'unassigned') {
        accommodationMatch = !guest.hasAllocation
      } else if (accommodationFilter === 'assigned') {
        accommodationMatch = guest.hasAllocation
      } else if (accommodationFilter === 'needs_accommodation') {
        accommodationMatch = guest.needsAccommodation
      }

      return searchMatch && sideMatch && rsvpMatch && accommodationMatch
    })
  }, [guests, searchQuery, sideFilter, rsvpFilter, accommodationFilter])

  const handleAssignRooms = async () => {
    if (!selectedAccommodation || selectedGuests.length === 0) return

    try {
      setSubmitting(true)
      
      const promises = selectedGuests.map(guestId => 
        fetch('/api/accommodation/allocations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accommodationId: selectedAccommodation,
            guestId,
            ...assignmentData
          })
        })
      )

      const results = await Promise.all(promises)
      const allSuccessful = results.every(result => result.ok)

      if (allSuccessful) {
        await fetchData() // Refresh all data
        setAssignmentDialogOpen(false)
        setSelectedGuests([])
        setSelectedAccommodation(null)
        resetAssignmentForm()
      } else {
        alert('Some room assignments failed. Please check and try again.')
      }
    } catch (error) {
      console.error('Error assigning rooms:', error)
      alert('Failed to assign rooms')
    } finally {
      setSubmitting(false)
    }
  }

  const resetAssignmentForm = () => {
    setAssignmentData({
      checkInDate: '',
      checkOutDate: '',
      roomNumber: '',
      specialRequests: '',
      includesPlusOne: false,
      includesChildren: false,
      childrenCount: 0
    })
  }

  const openAssignmentDialog = () => {
    if (selectedGuests.length === 0) {
      alert('Please select guests to assign rooms to')
      return
    }
    setAssignmentDialogOpen(true)
  }

  const getGuestStatusBadge = (guest: Guest) => {
    if (guest.hasAllocation) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Assigned</Badge>
    } else if (guest.rsvpStatus === 'confirmed') {
      return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />Needs Room</Badge>
    } else {
      return <Badge variant="outline"><UserX className="h-3 w-3 mr-1" />Pending RSVP</Badge>
    }
  }

  const getAvailabilityBadge = (accommodation: Accommodation) => {
    const percentage = accommodation.totalRooms > 0 
      ? (accommodation.availableRooms / accommodation.totalRooms) * 100 
      : 0

    if (percentage > 50) {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>
    } else if (percentage > 0) {
      return <Badge className="bg-orange-100 text-orange-800">Limited</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Full</Badge>
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Guest Room Assignment
          </CardTitle>
          <CardDescription>
            Assign guests to hotel rooms and manage accommodation allocations
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Search Guests</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Wedding Side</Label>
                <Select value={sideFilter} onValueChange={setSideFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sides</SelectItem>
                    <SelectItem value="bride">Bride's Side</SelectItem>
                    <SelectItem value="groom">Groom's Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>RSVP Status</Label>
                <Select value={rsvpFilter} onValueChange={setRsvpFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Accommodation</Label>
                <Select value={accommodationFilter} onValueChange={setAccommodationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Guests</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="needs_accommodation">Needs Accommodation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedGuests.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {selectedGuests.length} guest{selectedGuests.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <Button onClick={openAssignmentDialog} size="sm" className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Assign Rooms
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedGuests([])}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="guests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guests">
            Guests ({filteredGuests.length})
          </TabsTrigger>
          <TabsTrigger value="accommodations">
            Accommodations ({accommodations.length})
          </TabsTrigger>
        </TabsList>

        {/* Guests Tab */}
        <TabsContent value="guests" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
                  Loading guests...
                </div>
              </CardContent>
            </Card>
          ) : filteredGuests.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No guests found matching your criteria</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuests.map((guest) => (
                <Card 
                  key={guest.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedGuests.includes(guest.id) && "ring-2 ring-blue-500 bg-blue-50"
                  )}
                  onClick={() => {
                    setSelectedGuests(prev => 
                      prev.includes(guest.id)
                        ? prev.filter(id => id !== guest.id)
                        : [...prev, guest.id]
                    )
                  }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {guest.firstName} {guest.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{guest.email}</div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedGuests.includes(guest.id)}
                            onChange={() => {}}
                            className="rounded border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {guest.side === 'bride' ? "Bride's Side" : "Groom's Side"}
                        </Badge>
                        {getGuestStatusBadge(guest)}
                      </div>

                      {guest.accommodationNotes && (
                        <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                          {guest.accommodationNotes}
                        </div>
                      )}

                      {guest.hasAllocation && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Room assigned
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Accommodations Tab */}
        <TabsContent value="accommodations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accommodations.map((accommodation) => (
              <Card 
                key={accommodation.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedAccommodation === accommodation.id && "ring-2 ring-purple-500 bg-purple-50"
                )}
                onClick={() => setSelectedAccommodation(
                  selectedAccommodation === accommodation.id ? null : accommodation.id
                )}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{accommodation.name}</div>
                        <div className="text-sm text-gray-500">
                          {accommodation.roomType}
                          {accommodation.bedType && ` • ${accommodation.bedType}`}
                        </div>
                      </div>
                      {getAvailabilityBadge(accommodation)}
                    </div>

                    {accommodation.hotel && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {accommodation.hotel.name}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Occupancy:</span>
                        <span>Up to {accommodation.maxOccupancy} guests</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Available:</span>
                        <span>{accommodation.availableRooms} / {accommodation.totalRooms} rooms</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${accommodation.totalRooms > 0 
                              ? ((accommodation.totalRooms - accommodation.availableRooms) / accommodation.totalRooms) * 100 
                              : 0}%` 
                          }}
                        />
                      </div>
                    </div>

                    {selectedAccommodation === accommodation.id && selectedGuests.length > 0 && (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          openAssignmentDialog()
                        }}
                        size="sm" 
                        className="w-full"
                        disabled={accommodation.availableRooms === 0}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Assign {selectedGuests.length} Guest{selectedGuests.length !== 1 ? 's' : ''}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Room</DialogTitle>
            <DialogDescription>
              Configure room assignment details for {selectedGuests.length} selected guest{selectedGuests.length !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInDate">Check-in Date</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={assignmentData.checkInDate}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, checkInDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="checkOutDate">Check-out Date</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={assignmentData.checkOutDate}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="roomNumber">Room Number (Optional)</Label>
              <Input
                id="roomNumber"
                value={assignmentData.roomNumber}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, roomNumber: e.target.value }))}
                placeholder="101, 205, etc."
              />
            </div>

            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Input
                id="specialRequests"
                value={assignmentData.specialRequests}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="High floor, quiet room, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignRooms}
              disabled={submitting || !selectedAccommodation}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              Assign Rooms
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}