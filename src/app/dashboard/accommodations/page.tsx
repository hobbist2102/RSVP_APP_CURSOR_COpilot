'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Users,
  Bed,
  Car,
  Wifi,
  Coffee,
  Car as ParkingIcon,
  ShowerHead,
  Utensils,
  Monitor
} from 'lucide-react'

interface Accommodation {
  id: string
  name: string
  type: 'hotel' | 'resort' | 'guesthouse' | 'airbnb' | 'other'
  address: string
  phone: string
  email: string
  website: string
  description: string
  amenities: string[]
  roomTypes: {
    type: string
    bedType: string
    maxOccupancy: number
    pricePerNight: number
    availableRooms: number
    description: string
  }[]
  distanceFromVenue: number
  rating: number
  bookingInfo: {
    bookingCode?: string
    cutoffDate?: string
    specialRate?: number
    contactPerson?: string
    notes?: string
  }
  assignedGuests: number
  totalCapacity: number
}

const SAMPLE_ACCOMMODATIONS: Accommodation[] = [
  {
    id: '1',
    name: 'The Grand Wedding Resort',
    type: 'resort',
    address: '123 Paradise Drive, Wedding City, WC 12345',
    phone: '+1-555-WEDDING',
    email: 'reservations@grandwedding.com',
    website: 'https://grandweddingresort.com',
    description: 'Luxury beachfront resort perfect for destination weddings with stunning ocean views and world-class amenities.',
    amenities: ['wifi', 'parking', 'pool', 'spa', 'restaurant', 'room_service', 'fitness', 'beach_access'],
    roomTypes: [
      {
        type: 'Standard Room',
        bedType: 'Queen',
        maxOccupancy: 2,
        pricePerNight: 299,
        availableRooms: 25,
        description: 'Ocean view room with balcony'
      },
      {
        type: 'Suite',
        bedType: 'King',
        maxOccupancy: 4,
        pricePerNight: 499,
        availableRooms: 10,
        description: 'Luxury suite with living area and ocean view'
      }
    ],
    distanceFromVenue: 0.5,
    rating: 4.8,
    bookingInfo: {
      bookingCode: 'SMITH-WEDDING-2024',
      cutoffDate: '2024-05-15',
      specialRate: 20,
      contactPerson: 'Sarah Johnson - Wedding Coordinator',
      notes: 'Special rates available until cutoff date. Includes welcome reception.'
    },
    assignedGuests: 45,
    totalCapacity: 70
  },
  {
    id: '2',
    name: 'Cozy Downtown Inn',
    type: 'hotel',
    address: '456 Main Street, Wedding City, WC 12346',
    phone: '+1-555-COZY-INN',
    email: 'info@cozydowntown.com',
    website: 'https://cozydowntown.com',
    description: 'Charming boutique hotel in the heart of downtown, walking distance to restaurants and attractions.',
    amenities: ['wifi', 'parking', 'restaurant', 'fitness'],
    roomTypes: [
      {
        type: 'Standard Room',
        bedType: 'Double',
        maxOccupancy: 2,
        pricePerNight: 159,
        availableRooms: 15,
        description: 'Comfortable downtown room'
      }
    ],
    distanceFromVenue: 2.1,
    rating: 4.2,
    bookingInfo: {
      bookingCode: 'WEDDING-GROUP-2024',
      cutoffDate: '2024-05-01',
      specialRate: 15,
      contactPerson: 'Mike Davis - Group Sales'
    },
    assignedGuests: 18,
    totalCapacity: 30
  }
]

const AMENITY_ICONS: Record<string, JSX.Element> = {
  wifi: <Wifi className="w-4 h-4" />,
  parking: <ParkingIcon className="w-4 h-4" />,
  pool: <ShowerHead className="w-4 h-4" />,
  spa: <ShowerHead className="w-4 h-4" />,
  restaurant: <Utensils className="w-4 h-4" />,
  room_service: <Coffee className="w-4 h-4" />,
  fitness: <Monitor className="w-4 h-4" />,
  beach_access: <MapPin className="w-4 h-4" />
}

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'WiFi',
  parking: 'Parking',
  pool: 'Pool',
  spa: 'Spa',
  restaurant: 'Restaurant',
  room_service: 'Room Service',
  fitness: 'Fitness Center',
  beach_access: 'Beach Access'
}

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>(SAMPLE_ACCOMMODATIONS)
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleCreateAccommodation = () => {
    setIsCreateDialogOpen(true)
  }

  const handleEditAccommodation = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation)
    setIsCreateDialogOpen(true)
  }

  const getTotalCapacity = () => {
    return accommodations.reduce((sum, acc) => sum + acc.totalCapacity, 0)
  }

  const getTotalAssigned = () => {
    return accommodations.reduce((sum, acc) => sum + acc.assignedGuests, 0)
  }

  const getAvailableRooms = () => {
    return accommodations.reduce((sum, acc) => 
      sum + acc.roomTypes.reduce((roomSum, room) => roomSum + room.availableRooms, 0), 0
    )
  }

  const renderAccommodationCard = (accommodation: Accommodation) => (
    <Card key={accommodation.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{accommodation.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="capitalize">{accommodation.type}</Badge>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{accommodation.rating}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{accommodation.distanceFromVenue} miles</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost" onClick={() => handleEditAccommodation(accommodation)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{accommodation.description}</p>
        
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{accommodation.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="truncate">{accommodation.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <a href={accommodation.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
              Website
            </a>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <h5 className="text-sm font-medium mb-2">Amenities</h5>
          <div className="flex flex-wrap gap-2">
            {accommodation.amenities.slice(0, 6).map((amenity) => (
              <div key={amenity} className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
                {AMENITY_ICONS[amenity]}
                <span className="text-xs">{AMENITY_LABELS[amenity]}</span>
              </div>
            ))}
            {accommodation.amenities.length > 6 && (
              <Badge variant="secondary">+{accommodation.amenities.length - 6} more</Badge>
            )}
          </div>
        </div>

        {/* Occupancy */}
        <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
          <div>
            <div className="text-lg font-semibold text-blue-600">{accommodation.assignedGuests}</div>
            <div className="text-xs text-gray-600">Assigned</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">{accommodation.totalCapacity - accommodation.assignedGuests}</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-600">{accommodation.totalCapacity}</div>
            <div className="text-xs text-gray-600">Total Capacity</div>
          </div>
        </div>

        {/* Booking Info */}
        {accommodation.bookingInfo.bookingCode && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900">Group Booking: {accommodation.bookingInfo.bookingCode}</div>
            {accommodation.bookingInfo.specialRate && (
              <div className="text-sm text-blue-700">{accommodation.bookingInfo.specialRate}% discount available</div>
            )}
            {accommodation.bookingInfo.cutoffDate && (
              <div className="text-xs text-blue-600">Cutoff: {accommodation.bookingInfo.cutoffDate}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderCreateDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedAccommodation ? 'Edit Accommodation' : 'Add New Accommodation'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Hotel/Property Name *</Label>
              <Input id="name" placeholder="The Grand Hotel" />
            </div>
            <div>
              <Label htmlFor="type">Property Type *</Label>
              <select id="type" className="w-full p-2 border rounded-md">
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="guesthouse">Guest House</option>
                <option value="airbnb">Airbnb/Vacation Rental</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea id="address" placeholder="Full address including city, state, and postal code" rows={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+1-555-123-4567" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="reservations@hotel.com" />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://hotel.com" />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe the property, its features, and what makes it special..." rows={3} />
          </div>

          {/* Location & Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="distance">Distance from Venue (miles)</Label>
              <Input id="distance" type="number" step="0.1" placeholder="2.5" />
            </div>
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input id="rating" type="number" min="1" max="5" step="0.1" placeholder="4.5" />
            </div>
          </div>

          {/* Booking Information */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Group Booking Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bookingCode">Group Booking Code</Label>
                <Input id="bookingCode" placeholder="WEDDING-2024" />
              </div>
              <div>
                <Label htmlFor="cutoffDate">Booking Cutoff Date</Label>
                <Input id="cutoffDate" type="date" />
              </div>
              <div>
                <Label htmlFor="specialRate">Special Discount (%)</Label>
                <Input id="specialRate" type="number" min="0" max="100" placeholder="15" />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" placeholder="Sarah Johnson - Wedding Coordinator" />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="bookingNotes">Additional Notes</Label>
              <Textarea id="bookingNotes" placeholder="Special arrangements, policies, or instructions..." rows={2} />
            </div>
          </div>

          {/* Room Types Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Room Types & Pricing</h4>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Room Type
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                <div>
                  <Label>Room Type</Label>
                  <Input placeholder="Standard Room" />
                </div>
                <div>
                  <Label>Bed Type</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Queen</option>
                    <option>King</option>
                    <option>Double</option>
                    <option>Twin</option>
                    <option>Sofa Bed</option>
                  </select>
                </div>
                <div>
                  <Label>Max Occupancy</Label>
                  <Input type="number" min="1" placeholder="2" />
                </div>
                <div>
                  <Label>Price/Night</Label>
                  <Input type="number" placeholder="199" />
                </div>
                <div>
                  <Label>Available Rooms</Label>
                  <Input type="number" placeholder="10" />
                </div>
                <div className="flex items-end">
                  <Button size="sm" variant="ghost">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              {selectedAccommodation ? 'Update Accommodation' : 'Add Accommodation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accommodations</h1>
              <p className="text-gray-600 mt-2">
                Manage hotels and lodging options for your wedding guests
              </p>
            </div>
            <Button onClick={handleCreateAccommodation}>
              <Plus className="w-4 h-4 mr-2" />
              Add Accommodation
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="assignments">Guest Assignments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bed className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Properties</p>
                      <p className="text-2xl font-bold">{accommodations.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                      <p className="text-2xl font-bold">{getTotalCapacity()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Users className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Guests Assigned</p>
                      <p className="text-2xl font-bold">{getTotalAssigned()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Bed className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                      <p className="text-2xl font-bold">{getAvailableRooms()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Plus className="w-6 h-6 mb-2" />
                    Add New Property
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="w-6 h-6 mb-2" />
                    Bulk Assign Guests
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Mail className="w-6 h-6 mb-2" />
                    Send Booking Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {accommodations.map(renderAccommodationCard)}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Guest assignment features will allow you to automatically or manually assign guests to accommodations based on preferences, party size, and availability.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Guest Accommodation Assignments</CardTitle>
                <CardDescription>
                  Manage which guests are staying at each property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Bed className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Guest assignment interface coming soon</p>
                  <p className="text-sm">This will include drag-and-drop assignment, filters, and bulk operations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {renderCreateDialog()}
      </div>
    </div>
  )
}