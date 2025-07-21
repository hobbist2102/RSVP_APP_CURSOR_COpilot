'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Bed, 
  Users, 
  MapPin,
  Star,
  Phone,
  Globe,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Using shared schema field mappings
interface Hotel {
  id: number
  eventId: number
  name: string
  address: string
  phone?: string
  website?: string
  description?: string
  isDefault: boolean
  priceRange?: string
  distanceFromVenue?: string
  amenities?: string
  images?: string
  specialNotes?: string
  bookingInstructions?: string
  createdAt: string
}

interface Accommodation {
  id: number
  eventId: number
  hotelId?: number
  name: string
  roomType: string
  bedType?: string
  maxOccupancy: number
  capacity?: number
  totalRooms: number
  allocatedRooms: number
  pricePerNight?: string
  specialFeatures?: string
  showPricing: boolean
  hotel?: Hotel
}

interface RoomAllocation {
  id: number
  accommodationId: number
  guestId: number
  roomNumber?: string
  checkInDate?: string
  checkInStatus: string
  checkInTime?: string
  checkOutDate?: string
  checkOutStatus: string
  checkOutTime?: string
  specialRequests?: string
  includesPlusOne: boolean
  includesChildren: boolean
  childrenCount: number
  additionalGuestsInfo?: string
  guest?: {
    id: number
    firstName: string
    lastName: string
    email?: string
    phone?: string
    side: string
    rsvpStatus: string
  }
  accommodation?: Accommodation
}

interface HotelManagementProps {
  eventId: number
  className?: string
}

export default function HotelManagement({
  eventId,
  className
}: HotelManagementProps) {
  const [activeTab, setActiveTab] = useState('hotels')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [allocations, setAllocations] = useState<RoomAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'hotel' | 'accommodation' | 'allocation'>('hotel')
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Hotel form data
  const [hotelFormData, setHotelFormData] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    isDefault: false,
    priceRange: '',
    distanceFromVenue: '',
    amenities: '',
    specialNotes: '',
    bookingInstructions: ''
  })

  // Accommodation form data
  const [accommodationFormData, setAccommodationFormData] = useState({
    hotelId: '',
    name: '',
    roomType: '',
    bedType: '',
    maxOccupancy: 2,
    totalRooms: 1,
    pricePerNight: '',
    specialFeatures: '',
    showPricing: false
  })

  useEffect(() => {
    fetchData()
  }, [eventId])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchHotels(),
        fetchAccommodations(),
        fetchAllocations()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHotels = async () => {
    try {
      const response = await fetch(`/api/accommodation/hotels?eventId=${eventId}`)
      const result = await response.json()
      if (result.success) {
        setHotels(result.data)
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
    }
  }

  const fetchAccommodations = async () => {
    try {
      const response = await fetch(`/api/accommodation/rooms?eventId=${eventId}`)
      const result = await response.json()
      if (result.success) {
        setAccommodations(result.data)
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
      }
    } catch (error) {
      console.error('Error fetching allocations:', error)
    }
  }

  const handleCreateHotel = async () => {
    try {
      setSubmitting(true)
      const response = await fetch('/api/accommodation/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...hotelFormData, eventId })
      })
      
      const result = await response.json()
      if (result.success) {
        await fetchHotels()
        setIsDialogOpen(false)
        resetHotelForm()
      } else {
        alert(`Failed to create hotel: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating hotel:', error)
      alert('Failed to create hotel')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateAccommodation = async () => {
    try {
      setSubmitting(true)
      const response = await fetch('/api/accommodation/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...accommodationFormData, 
          eventId,
          hotelId: accommodationFormData.hotelId ? parseInt(accommodationFormData.hotelId) : null
        })
      })
      
      const result = await response.json()
      if (result.success) {
        await fetchAccommodations()
        setIsDialogOpen(false)
        resetAccommodationForm()
      } else {
        alert(`Failed to create accommodation: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating accommodation:', error)
      alert('Failed to create accommodation')
    } finally {
      setSubmitting(false)
    }
  }

  const openCreateDialog = (type: 'hotel' | 'accommodation' | 'allocation') => {
    setDialogType(type)
    setIsEditing(false)
    setIsDialogOpen(true)
    
    if (type === 'hotel') {
      resetHotelForm()
    } else if (type === 'accommodation') {
      resetAccommodationForm()
    }
  }

  const resetHotelForm = () => {
    setHotelFormData({
      name: '',
      address: '',
      phone: '',
      website: '',
      description: '',
      isDefault: false,
      priceRange: '',
      distanceFromVenue: '',
      amenities: '',
      specialNotes: '',
      bookingInstructions: ''
    })
  }

  const resetAccommodationForm = () => {
    setAccommodationFormData({
      hotelId: '',
      name: '',
      roomType: '',
      bedType: '',
      maxOccupancy: 2,
      totalRooms: 1,
      pricePerNight: '',
      specialFeatures: '',
      showPricing: false
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
      case 'checked-in':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Checked In</Badge>
      case 'checked-out':
        return <Badge className="bg-gray-100 text-gray-800"><CheckCircle className="h-3 w-3 mr-1" />Checked Out</Badge>
      case 'no-show':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />No Show</Badge>
      default:
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  const getOccupancyPercentage = (accommodation: Accommodation) => {
    return accommodation.totalRooms > 0 
      ? Math.round((accommodation.allocatedRooms / accommodation.totalRooms) * 100)
      : 0
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Hotel & Accommodation Management
          </CardTitle>
          <CardDescription>
            Manage hotels, room types, and guest allocations for your wedding event
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hotels">Hotels ({hotels.length})</TabsTrigger>
          <TabsTrigger value="accommodations">Room Types ({accommodations.length})</TabsTrigger>
          <TabsTrigger value="allocations">Allocations ({allocations.length})</TabsTrigger>
        </TabsList>

        {/* Hotels Tab */}
        <TabsContent value="hotels" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hotels</CardTitle>
                  <CardDescription>Manage wedding accommodation hotels</CardDescription>
                </div>
                <Button onClick={() => openCreateDialog('hotel')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Hotel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Price Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
                            Loading hotels...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : hotels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-gray-500">
                            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No hotels added yet</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      hotels.map((hotel) => (
                        <TableRow key={hotel.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {hotel.name}
                                {hotel.isDefault && <Star className="h-4 w-4 text-yellow-500" />}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {hotel.address}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {hotel.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  {hotel.phone}
                                </div>
                              )}
                              {hotel.website && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Globe className="h-3 w-3 text-gray-400" />
                                  <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Website
                                  </a>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {hotel.distanceFromVenue && (
                                <div className="text-sm">Distance: {hotel.distanceFromVenue}</div>
                              )}
                              {hotel.amenities && (
                                <div className="text-sm text-gray-600">
                                  {hotel.amenities.split(',').slice(0, 3).join(', ')}
                                  {hotel.amenities.split(',').length > 3 && '...'}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {hotel.priceRange && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-green-600" />
                                <span className="text-sm">{hotel.priceRange}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {hotel.isDefault ? (
                              <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                            ) : (
                              <Badge variant="outline">Available</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Hotel
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Hotel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accommodations Tab */}
        <TabsContent value="accommodations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Room Types & Accommodations</CardTitle>
                  <CardDescription>Configure available room types and capacity</CardDescription>
                </div>
                <Button onClick={() => openCreateDialog('accommodation')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Room Type
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accommodations.map((accommodation) => (
                      <TableRow key={accommodation.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{accommodation.name}</div>
                            <div className="text-sm text-gray-500">
                              {accommodation.roomType}
                              {accommodation.bedType && ` • ${accommodation.bedType}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {accommodation.hotel?.name || 'No hotel assigned'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{accommodation.maxOccupancy} guests</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {accommodation.allocatedRooms} / {accommodation.totalRooms} rooms
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${getOccupancyPercentage(accommodation)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500">
                              {getOccupancyPercentage(accommodation)}% occupied
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {accommodation.pricePerNight && accommodation.showPricing ? (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="text-sm">{accommodation.pricePerNight}/night</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Price not shown</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Room Type
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                Manage Allocations
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Room Type
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allocations Tab */}
        <TabsContent value="allocations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Room Allocations</CardTitle>
                  <CardDescription>Manage guest room assignments and check-in status</CardDescription>
                </div>
                <Button onClick={() => openCreateDialog('allocation')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Assign Room
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Occupancy</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((allocation) => (
                      <TableRow key={allocation.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {allocation.guest?.firstName} {allocation.guest?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {allocation.guest?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {allocation.accommodation?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {allocation.roomNumber && `Room ${allocation.roomNumber}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {allocation.checkInDate && (
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                {new Date(allocation.checkInDate).toLocaleDateString()}
                              </div>
                            )}
                            {allocation.checkOutDate && (
                              <div className="text-sm text-gray-500">
                                to {new Date(allocation.checkOutDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(allocation.checkInStatus)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>1 guest</div>
                            {allocation.includesPlusOne && <div>+ Plus one</div>}
                            {allocation.includesChildren && allocation.childrenCount > 0 && (
                              <div>+ {allocation.childrenCount} child{allocation.childrenCount !== 1 ? 'ren' : ''}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Allocation
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Check In
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Allocation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hotel Form Dialog */}
      {dialogType === 'hotel' && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Hotel' : 'Add New Hotel'}
              </DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? 'Update hotel information and details.'
                  : 'Add a new hotel for wedding accommodations.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Hotel Name *</Label>
                  <Input
                    id="name"
                    value={hotelFormData.name}
                    onChange={(e) => setHotelFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Grand Hotel"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={hotelFormData.phone}
                    onChange={(e) => setHotelFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={hotelFormData.address}
                  onChange={(e) => setHotelFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, City, Country"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={hotelFormData.website}
                    onChange={(e) => setHotelFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://hotel.com"
                  />
                </div>
                <div>
                  <Label htmlFor="priceRange">Price Range</Label>
                  <Input
                    id="priceRange"
                    value={hotelFormData.priceRange}
                    onChange={(e) => setHotelFormData(prev => ({ ...prev, priceRange: e.target.value }))}
                    placeholder="$100-200/night"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="distanceFromVenue">Distance from Venue</Label>
                <Input
                  id="distanceFromVenue"
                  value={hotelFormData.distanceFromVenue}
                  onChange={(e) => setHotelFormData(prev => ({ ...prev, distanceFromVenue: e.target.value }))}
                  placeholder="5 minutes walk"
                />
              </div>

              <div>
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  value={hotelFormData.amenities}
                  onChange={(e) => setHotelFormData(prev => ({ ...prev, amenities: e.target.value }))}
                  placeholder="WiFi, Pool, Gym, Spa"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={hotelFormData.description}
                  onChange={(e) => setHotelFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the hotel..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="specialNotes">Special Notes</Label>
                <Textarea
                  id="specialNotes"
                  value={hotelFormData.specialNotes}
                  onChange={(e) => setHotelFormData(prev => ({ ...prev, specialNotes: e.target.value }))}
                  placeholder="Any special notes for guests..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="bookingInstructions">Booking Instructions</Label>
                <Textarea
                  id="bookingInstructions"
                  value={hotelFormData.bookingInstructions}
                  onChange={(e) => setHotelFormData(prev => ({ ...prev, bookingInstructions: e.target.value }))}
                  placeholder="Instructions for booking this hotel..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateHotel}
                disabled={submitting || !hotelFormData.name || !hotelFormData.address}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                {isEditing ? 'Update Hotel' : 'Create Hotel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Accommodation Form Dialog */}
      {dialogType === 'accommodation' && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Room Type' : 'Add New Room Type'}
              </DialogTitle>
              <DialogDescription>
                Configure room type details and capacity.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="hotelSelect">Hotel</Label>
                <Select value={accommodationFormData.hotelId} onValueChange={(value) => 
                  setAccommodationFormData(prev => ({ ...prev, hotelId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No hotel assigned</SelectItem>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id.toString()}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accommodationName">Room Name *</Label>
                  <Input
                    id="accommodationName"
                    value={accommodationFormData.name}
                    onChange={(e) => setAccommodationFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Deluxe Room"
                  />
                </div>
                <div>
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Input
                    id="roomType"
                    value={accommodationFormData.roomType}
                    onChange={(e) => setAccommodationFormData(prev => ({ ...prev, roomType: e.target.value }))}
                    placeholder="Standard/Deluxe/Suite"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedType">Bed Type</Label>
                  <Select value={accommodationFormData.bedType} onValueChange={(value) => 
                    setAccommodationFormData(prev => ({ ...prev, bedType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="twin">Twin</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="queen">Queen</SelectItem>
                      <SelectItem value="king">King</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxOccupancy">Max Occupancy *</Label>
                  <Input
                    id="maxOccupancy"
                    type="number"
                    min="1"
                    max="10"
                    value={accommodationFormData.maxOccupancy}
                    onChange={(e) => setAccommodationFormData(prev => ({ ...prev, maxOccupancy: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalRooms">Total Rooms *</Label>
                  <Input
                    id="totalRooms"
                    type="number"
                    min="1"
                    value={accommodationFormData.totalRooms}
                    onChange={(e) => setAccommodationFormData(prev => ({ ...prev, totalRooms: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerNight">Price per Night</Label>
                  <Input
                    id="pricePerNight"
                    value={accommodationFormData.pricePerNight}
                    onChange={(e) => setAccommodationFormData(prev => ({ ...prev, pricePerNight: e.target.value }))}
                    placeholder="$150"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialFeatures">Special Features</Label>
                <Textarea
                  id="specialFeatures"
                  value={accommodationFormData.specialFeatures}
                  onChange={(e) => setAccommodationFormData(prev => ({ ...prev, specialFeatures: e.target.value }))}
                  placeholder="Balcony, Sea view, etc..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAccommodation}
                disabled={submitting || !accommodationFormData.name || !accommodationFormData.roomType}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                {isEditing ? 'Update Room Type' : 'Create Room Type'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}