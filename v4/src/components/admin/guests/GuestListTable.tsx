'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  Heart,
  Family,
  Star,
  ChevronDown,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  Plus
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
  rsvpStatus: 'pending' | 'confirmed' | 'declined'
  rsvpDate?: string
  plusOneAllowed: boolean
  plusOneConfirmed: boolean
  plusOneName?: string
  plusOneEmail?: string
  plusOnePhone?: string
  plusOneRelationship?: string
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
  dietaryRestrictions?: string
  allergies?: string
  specialRequests?: string
  notes?: string
  createdAt: string
  updatedAt?: string
  
  // Guest ceremony attendance
  guestCeremonies?: Array<{
    ceremonyId: number
    attending: boolean
    ceremonies: {
      id: number
      name: string
    }
  }>
}

interface GuestListTableProps {
  guests: Guest[]
  loading?: boolean
  onSelectGuest?: (guest: Guest) => void
  onEditGuest?: (guest: Guest) => void
  onDeleteGuest?: (guest: Guest) => void
  onBulkAction?: (action: string, guestIds: number[]) => void
  onExport?: () => void
  onImport?: () => void
  onAddGuest?: () => void
  className?: string
}

type SortField = 'firstName' | 'lastName' | 'rsvpStatus' | 'rsvpDate' | 'createdAt' | 'side'
type SortDirection = 'asc' | 'desc'

export default function GuestListTable({
  guests,
  loading = false,
  onSelectGuest,
  onEditGuest,
  onDeleteGuest,
  onBulkAction,
  onExport,
  onImport,
  onAddGuest,
  className
}: GuestListTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuests, setSelectedGuests] = useState<number[]>([])
  const [sortField, setSortField] = useState<SortField>('firstName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  // Filters
  const [sideFilter, setSideFilter] = useState<string>('all')
  const [rsvpStatusFilter, setRsvpStatusFilter] = useState<string>('all')
  const [familyFilter, setFamilyFilter] = useState<string>('all')
  const [accommodationFilter, setAccommodationFilter] = useState<string>('all')
  const [flightFilter, setFlightFilter] = useState<string>('all')

  // Filter and sort guests
  const filteredAndSortedGuests = useMemo(() => {
    let filtered = guests.filter(guest => {
      // Search filter
      const searchMatch = !searchQuery || 
        `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.phone?.includes(searchQuery) ||
        guest.relationship?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.plusOneName?.toLowerCase().includes(searchQuery.toLowerCase())

      // Side filter
      const sideMatch = sideFilter === 'all' || guest.side === sideFilter

      // RSVP status filter
      const rsvpMatch = rsvpStatusFilter === 'all' || guest.rsvpStatus === rsvpStatusFilter

      // Family filter
      const familyMatch = familyFilter === 'all' || 
        (familyFilter === 'family' && guest.isFamily) ||
        (familyFilter === 'non-family' && !guest.isFamily)

      // Accommodation filter
      const accommodationMatch = accommodationFilter === 'all' ||
        (accommodationFilter === 'needs' && guest.needsAccommodation) ||
        (accommodationFilter === 'no-needs' && !guest.needsAccommodation)

      // Flight assistance filter
      const flightMatch = flightFilter === 'all' ||
        (flightFilter === 'needs' && guest.needsFlightAssistance) ||
        (flightFilter === 'no-needs' && !guest.needsFlightAssistance)

      return searchMatch && sideMatch && rsvpMatch && familyMatch && accommodationMatch && flightMatch
    })

    // Sort guests
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'firstName':
          aValue = a.firstName.toLowerCase()
          bValue = b.firstName.toLowerCase()
          break
        case 'lastName':
          aValue = a.lastName.toLowerCase()
          bValue = b.lastName.toLowerCase()
          break
        case 'rsvpStatus':
          aValue = a.rsvpStatus
          bValue = b.rsvpStatus
          break
        case 'rsvpDate':
          aValue = a.rsvpDate ? new Date(a.rsvpDate) : new Date(0)
          bValue = b.rsvpDate ? new Date(b.rsvpDate) : new Date(0)
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'side':
          aValue = a.side
          bValue = b.side
          break
        default:
          aValue = a.firstName.toLowerCase()
          bValue = b.firstName.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [guests, searchQuery, sideFilter, rsvpStatusFilter, familyFilter, accommodationFilter, flightFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGuests(filteredAndSortedGuests.map(g => g.id))
    } else {
      setSelectedGuests([])
    }
  }

  const handleSelectGuest = (guestId: number, checked: boolean) => {
    if (checked) {
      setSelectedGuests(prev => [...prev, guestId])
    } else {
      setSelectedGuests(prev => prev.filter(id => id !== guestId))
    }
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
        return <Badge variant="outline" className="border-pink-200 text-pink-700">Bride</Badge>
      case 'groom':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">Groom</Badge>
      default:
        return <Badge variant="outline" className="border-purple-200 text-purple-700">Both</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getAttendanceCount = (guest: Guest) => {
    const attending = guest.guestCeremonies?.filter(gc => gc.attending).length || 0
    const total = guest.guestCeremonies?.length || 0
    return `${attending}/${total}`
  }

  const getTotalAttending = (guest: Guest) => {
    let count = guest.rsvpStatus === 'confirmed' ? 1 : 0
    if (guest.plusOneConfirmed) count += 1
    if (guest.childrenDetails?.length) count += guest.childrenDetails.length
    return count
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Guest Management
              </CardTitle>
              <CardDescription>
                Manage and track all wedding guests ({filteredAndSortedGuests.length} of {guests.length} guests)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {onImport && (
                <Button variant="outline" onClick={onImport} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              )}
              {onExport && (
                <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
              {onAddGuest && (
                <Button onClick={onAddGuest} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Guest
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search guests by name, email, phone, or relationship..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Select value={sideFilter} onValueChange={setSideFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sides</SelectItem>
                  <SelectItem value="bride">Bride</SelectItem>
                  <SelectItem value="groom">Groom</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>

              <Select value={rsvpStatusFilter} onValueChange={setRsvpStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="RSVP Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>

              <Select value={familyFilter} onValueChange={setFamilyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Guests</SelectItem>
                  <SelectItem value="family">Family Only</SelectItem>
                  <SelectItem value="non-family">Non-Family</SelectItem>
                </SelectContent>
              </Select>

              <Select value={accommodationFilter} onValueChange={setAccommodationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Accommodation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="needs">Needs Accommodation</SelectItem>
                  <SelectItem value="no-needs">No Accommodation</SelectItem>
                </SelectContent>
              </Select>

              <Select value={flightFilter} onValueChange={setFlightFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Flight Assistance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="needs">Needs Flight Help</SelectItem>
                  <SelectItem value="no-needs">No Flight Help</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedGuests.length > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">
                {selectedGuests.length} guest{selectedGuests.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction?.('send-email', selectedGuests)}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction?.('export-selected', selectedGuests)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onBulkAction?.('delete', selectedGuests)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guest Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedGuests.length === filteredAndSortedGuests.length && filteredAndSortedGuests.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === 'firstName' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('side')}
                  >
                    <div className="flex items-center gap-1">
                      Side
                      {sortField === 'side' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('rsvpStatus')}
                  >
                    <div className="flex items-center gap-1">
                      RSVP Status
                      {sortField === 'rsvpStatus' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Attending</TableHead>
                  <TableHead>Special Needs</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('rsvpDate')}
                  >
                    <div className="flex items-center gap-1">
                      RSVP Date
                      {sortField === 'rsvpDate' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
                        Loading guests...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No guests found matching your criteria</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedGuests.map((guest) => (
                    <TableRow 
                      key={guest.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectGuest?.(guest)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedGuests.includes(guest.id)}
                          onCheckedChange={(checked) => handleSelectGuest(guest.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">
                              {guest.firstName} {guest.lastName}
                              {guest.isFamily && <Family className="inline h-3 w-3 ml-1 text-blue-600" />}
                            </div>
                            {guest.relationship && (
                              <div className="text-sm text-gray-500">{guest.relationship}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSideBadge(guest.side)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {guest.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              {guest.email}
                            </div>
                          )}
                          {guest.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {guest.countryCode && `${guest.countryCode} `}{guest.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRsvpStatusBadge(guest.rsvpStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {getTotalAttending(guest)} person{getTotalAttending(guest) !== 1 ? 's' : ''}
                          </div>
                          {guest.guestCeremonies && (
                            <div className="text-xs text-gray-500">
                              Ceremonies: {getAttendanceCount(guest)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {guest.needsAccommodation && (
                            <Badge variant="outline" className="text-xs">
                              🏨 Hotel
                            </Badge>
                          )}
                          {guest.needsFlightAssistance && (
                            <Badge variant="outline" className="text-xs">
                              ✈️ Flight
                            </Badge>
                          )}
                          {(guest.dietaryRestrictions || guest.allergies) && (
                            <Badge variant="outline" className="text-xs">
                              🍽️ Diet
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(guest.rsvpDate)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onSelectGuest?.(guest)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditGuest?.(guest)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Guest
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDeleteGuest?.(guest)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Guest
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
    </div>
  )
}