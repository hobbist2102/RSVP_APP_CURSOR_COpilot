'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus,
  Edit,
  Trash2,
  Car,
  Plane,
  MapPin,
  Clock,
  Users,
  Route,
  Calendar,
  Phone,
  Mail,
  Navigation,
  Bus,
  Truck
} from 'lucide-react'

interface TransportProvider {
  id: string
  name: string
  type: 'bus_company' | 'car_rental' | 'taxi_service' | 'private_driver' | 'shuttle_service'
  contact: {
    phone: string
    email: string
    website?: string
  }
  vehicles: Vehicle[]
  rating: number
  notes?: string
}

interface Vehicle {
  id: string
  type: 'sedan' | 'suv' | 'van' | 'bus' | 'limousine' | 'shuttle'
  make: string
  model: string
  capacity: number
  features: string[]
  pricePerHour?: number
  pricePerTrip?: number
  availability: boolean
}

interface TransportRoute {
  id: string
  name: string
  type: 'airport_pickup' | 'hotel_shuttle' | 'venue_shuttle' | 'sightseeing' | 'custom'
  origin: string
  destination: string
  distance: number
  estimatedDuration: number
  stops: string[]
  schedule: {
    departureTime: string
    arrivalTime: string
    frequency?: string
  }
  assignedVehicles: string[]
  passengerCount: number
  maxCapacity: number
  driverInfo?: {
    name: string
    phone: string
    license: string
  }
}

const SAMPLE_PROVIDERS: TransportProvider[] = [
  {
    id: '1',
    name: 'Elite Wedding Transportation',
    type: 'shuttle_service',
    contact: {
      phone: '+1-555-WEDDING',
      email: 'bookings@elitewedding.com',
      website: 'https://elitewedding.com'
    },
    vehicles: [
      {
        id: 'v1',
        type: 'shuttle',
        make: 'Mercedes',
        model: 'Sprinter',
        capacity: 14,
        features: ['ac', 'wifi', 'luggage_space', 'water'],
        pricePerTrip: 150,
        availability: true
      },
      {
        id: 'v2',
        type: 'bus',
        make: 'Volvo',
        model: 'Coach',
        capacity: 45,
        features: ['ac', 'wifi', 'restroom', 'entertainment'],
        pricePerTrip: 300,
        availability: true
      }
    ],
    rating: 4.8,
    notes: 'Specializes in wedding transportation with decorated vehicles'
  },
  {
    id: '2',
    name: 'City Cab Services',
    type: 'taxi_service',
    contact: {
      phone: '+1-555-TAXI',
      email: 'dispatch@citycab.com'
    },
    vehicles: [
      {
        id: 'v3',
        type: 'sedan',
        make: 'Toyota',
        model: 'Camry',
        capacity: 4,
        features: ['ac', 'gps'],
        pricePerHour: 45,
        availability: true
      }
    ],
    rating: 4.2
  }
]

const SAMPLE_ROUTES: TransportRoute[] = [
  {
    id: '1',
    name: 'Airport to Hotel Shuttle',
    type: 'airport_pickup',
    origin: 'International Airport Terminal 1',
    destination: 'Grand Wedding Resort',
    distance: 25.5,
    estimatedDuration: 45,
    stops: ['Terminal 1', 'Terminal 2', 'Grand Wedding Resort'],
    schedule: {
      departureTime: '14:00',
      arrivalTime: '14:45',
      frequency: 'Every 2 hours'
    },
    assignedVehicles: ['v1'],
    passengerCount: 12,
    maxCapacity: 14,
    driverInfo: {
      name: 'Michael Johnson',
      phone: '+1-555-DRIVER',
      license: 'CDL-12345'
    }
  },
  {
    id: '2',
    name: 'Hotel to Venue Shuttle',
    type: 'venue_shuttle',
    origin: 'Grand Wedding Resort',
    destination: 'Sunset Beach Venue',
    distance: 8.2,
    estimatedDuration: 20,
    stops: ['Grand Wedding Resort', 'Cozy Downtown Inn', 'Sunset Beach Venue'],
    schedule: {
      departureTime: '16:30',
      arrivalTime: '16:50'
    },
    assignedVehicles: ['v1', 'v2'],
    passengerCount: 45,
    maxCapacity: 59
  }
]

const VEHICLE_ICONS: Record<string, JSX.Element> = {
  sedan: <Car className="w-4 h-4" />,
  suv: <Car className="w-4 h-4" />,
  van: <Truck className="w-4 h-4" />,
  bus: <Bus className="w-4 h-4" />,
  limousine: <Car className="w-4 h-4" />,
  shuttle: <Bus className="w-4 h-4" />
}

export default function TransportationPage() {
  const [providers, setProviders] = useState<TransportProvider[]>(SAMPLE_PROVIDERS)
  const [routes, setRoutes] = useState<TransportRoute[]>(SAMPLE_ROUTES)
  const [activeTab, setActiveTab] = useState('overview')
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false)
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false)

  const getTotalVehicles = () => {
    return providers.reduce((sum, provider) => sum + provider.vehicles.length, 0)
  }

  const getTotalCapacity = () => {
    return providers.reduce((sum, provider) => 
      sum + provider.vehicles.reduce((vSum, vehicle) => vSum + vehicle.capacity, 0), 0
    )
  }

  const getActiveRoutes = () => {
    return routes.length
  }

  const getAssignedPassengers = () => {
    return routes.reduce((sum, route) => sum + route.passengerCount, 0)
  }

  const renderProviderCard = (provider: TransportProvider) => (
    <Card key={provider.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{provider.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="capitalize">
                {provider.type.replace('_', ' ')}
              </Badge>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">★ {provider.rating}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost">
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{provider.contact.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="truncate">{provider.contact.email}</span>
          </div>
        </div>

        {/* Vehicle Fleet */}
        <div className="mb-4">
          <h5 className="text-sm font-medium mb-2">Fleet ({provider.vehicles.length} vehicles)</h5>
          <div className="space-y-2">
            {provider.vehicles.slice(0, 3).map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  {VEHICLE_ICONS[vehicle.type]}
                  <span className="text-sm font-medium">{vehicle.make} {vehicle.model}</span>
                  <Badge variant="secondary" className="text-xs">
                    {vehicle.capacity} seats
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  ${vehicle.pricePerTrip || vehicle.pricePerHour}/{vehicle.pricePerTrip ? 'trip' : 'hr'}
                </div>
              </div>
            ))}
            {provider.vehicles.length > 3 && (
              <div className="text-sm text-gray-600">+{provider.vehicles.length - 3} more vehicles</div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
          <div>
            <div className="text-lg font-semibold text-blue-600">{provider.vehicles.length}</div>
            <div className="text-xs text-gray-600">Vehicles</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {provider.vehicles.reduce((sum, v) => sum + v.capacity, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Capacity</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              {provider.vehicles.filter(v => v.availability).length}
            </div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
        </div>

        {provider.notes && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-900">{provider.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderRouteCard = (route: TransportRoute) => (
    <Card key={route.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{route.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="capitalize">
                {route.type.replace('_', ' ')}
              </Badge>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Route className="w-4 h-4" />
                <span>{route.distance} miles</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{route.estimatedDuration} min</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost">
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Route Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm"><strong>From:</strong> {route.origin}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="text-sm"><strong>To:</strong> {route.destination}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm">
              <strong>Schedule:</strong> {route.schedule.departureTime} - {route.schedule.arrivalTime}
              {route.schedule.frequency && ` (${route.schedule.frequency})`}
            </span>
          </div>
        </div>

        {/* Stops */}
        {route.stops.length > 2 && (
          <div className="mb-4">
            <h6 className="text-sm font-medium mb-2">Stops ({route.stops.length})</h6>
            <div className="text-sm text-gray-600">
              {route.stops.join(' → ')}
            </div>
          </div>
        )}

        {/* Driver Info */}
        {route.driverInfo && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h6 className="text-sm font-medium mb-1">Driver</h6>
            <div className="text-sm text-gray-600">
              <div>{route.driverInfo.name}</div>
              <div>{route.driverInfo.phone}</div>
              <div>License: {route.driverInfo.license}</div>
            </div>
          </div>
        )}

        {/* Capacity */}
        <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
          <div>
            <div className="text-lg font-semibold text-blue-600">{route.passengerCount}</div>
            <div className="text-xs text-gray-600">Assigned</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">{route.maxCapacity - route.passengerCount}</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-600">{route.maxCapacity}</div>
            <div className="text-xs text-gray-600">Total Capacity</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transportation</h1>
              <p className="text-gray-600 mt-2">
                Manage transport providers, routes, and guest assignments
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsProviderDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
              <Button onClick={() => setIsRouteDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Route
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Transport Providers</p>
                      <p className="text-2xl font-bold">{providers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Bus className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                      <p className="text-2xl font-bold">{getTotalVehicles()}</p>
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
                      <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                      <p className="text-2xl font-bold">{getTotalCapacity()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Route className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Routes</p>
                      <p className="text-2xl font-bold">{getActiveRoutes()}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Plane className="w-6 h-6 mb-2" />
                    Airport Pickup
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Car className="w-6 h-6 mb-2" />
                    Hotel Shuttle
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Navigation className="w-6 h-6 mb-2" />
                    Venue Transport
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="w-6 h-6 mb-2" />
                    Assign Guests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {providers.map(renderProviderCard)}
            </div>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {routes.map(renderRouteCard)}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Guest transportation assignment features will allow you to assign guests to specific routes and vehicles based on their preferences and locations.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Guest Transportation Assignments</CardTitle>
                <CardDescription>
                  Manage which guests are assigned to which transport routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Route className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Guest assignment interface coming soon</p>
                  <p className="text-sm">This will include drag-and-drop assignment, route optimization, and capacity management</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}