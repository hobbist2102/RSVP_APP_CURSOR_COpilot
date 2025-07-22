'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Mail, 
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
  Heart,
  ArrowLeft
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  side: 'bride' | 'groom' | 'mutual'
  relationship: string
  rsvpStatus: 'pending' | 'attending' | 'not_attending' | 'maybe'
  plusOneAllowed: boolean
  plusOneName?: string
  dietaryRequirements?: string
  invitationSent: boolean
  tags: string[]
  createdAt: string
}

const mockGuests: Guest[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1234567890',
    side: 'groom',
    relationship: 'Brother',
    rsvpStatus: 'attending',
    plusOneAllowed: true,
    plusOneName: 'Jane Smith',
    dietaryRequirements: 'Vegetarian',
    invitationSent: true,
    tags: ['family', 'vip'],
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@email.com',
    side: 'bride',
    relationship: 'Best Friend',
    rsvpStatus: 'pending',
    plusOneAllowed: false,
    invitationSent: true,
    tags: ['friends'],
    createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    phone: '+1234567891',
    side: 'mutual',
    relationship: 'Colleague',
    rsvpStatus: 'not_attending',
    plusOneAllowed: true,
    invitationSent: true,
    tags: ['work'],
    createdAt: '2024-01-17T10:00:00Z'
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Davis',
    email: 'sarah.davis@email.com',
    side: 'bride',
    relationship: 'Sister',
    rsvpStatus: 'attending',
    plusOneAllowed: true,
    plusOneName: 'Tom Davis',
    invitationSent: true,
    tags: ['family', 'vip'],
    createdAt: '2024-01-18T10:00:00Z'
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    side: 'groom',
    relationship: 'Friend',
    rsvpStatus: 'maybe',
    plusOneAllowed: false,
    invitationSent: false,
    tags: ['friends'],
    createdAt: '2024-01-19T10:00:00Z'
  }
]

export default function GuestsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [guests, setGuests] = useState<Guest[]>(mockGuests)
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>(mockGuests)
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [sideFilter, setSideFilter] = useState<string>('all')
  const [rsvpFilter, setRsvpFilter] = useState<string>('all')
  const [invitationFilter, setInvitationFilter] = useState<string>('all')

  // Apply filters
  useEffect(() => {
    let filtered = guests

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(guest => 
        guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.relationship.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Side filter
    if (sideFilter !== 'all') {
      filtered = filtered.filter(guest => guest.side === sideFilter)
    }

    // RSVP filter
    if (rsvpFilter !== 'all') {
      filtered = filtered.filter(guest => guest.rsvpStatus === rsvpFilter)
    }

    // Invitation filter
    if (invitationFilter !== 'all') {
      filtered = filtered.filter(guest => 
        invitationFilter === 'sent' ? guest.invitationSent : !guest.invitationSent
      )
    }

    setFilteredGuests(filtered)
  }, [guests, searchQuery, sideFilter, rsvpFilter, invitationFilter])

  const handleSelectGuest = (guestId: string) => {
    const newSelected = new Set(selectedGuests)
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId)
    } else {
      newSelected.add(guestId)
    }
    setSelectedGuests(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedGuests.size === filteredGuests.length) {
      setSelectedGuests(new Set())
    } else {
      setSelectedGuests(new Set(filteredGuests.map(g => g.id)))
    }
  }

  const handleBulkAction = async (action: 'send_invitation' | 'send_reminder' | 'delete') => {
    if (selectedGuests.size === 0) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (action) {
        case 'send_invitation':
          toast({
            title: "Invitations Sent",
            description: `Sent invitations to ${selectedGuests.size} guests`,
          })
          break
        case 'send_reminder':
          toast({
            title: "Reminders Sent", 
            description: `Sent reminders to ${selectedGuests.size} guests`,
          })
          break
        case 'delete':
          setGuests(prev => prev.filter(g => !selectedGuests.has(g.id)))
          toast({
            title: "Guests Deleted",
            description: `Deleted ${selectedGuests.size} guests`,
          })
          break
      }
      setSelectedGuests(new Set())
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRsvpStatusColor = (status: Guest['rsvpStatus']) => {
    switch (status) {
      case 'attending': return 'text-green-600 bg-green-50'
      case 'not_attending': return 'text-red-600 bg-red-50'
      case 'maybe': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSideColor = (side: Guest['side']) => {
    switch (side) {
      case 'bride': return 'text-pink-600 bg-pink-50'
      case 'groom': return 'text-blue-600 bg-blue-50'
      default: return 'text-purple-600 bg-purple-50'
    }
  }

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvpStatus === 'attending').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    notAttending: guests.filter(g => g.rsvpStatus === 'not_attending').length,
    invitationsSent: guests.filter(g => g.invitationSent).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="ml-6">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Guest Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your wedding guest list and RSVPs
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-wedding-gold hover:bg-wedding-gold/90" asChild>
                <Link href="/dashboard/guests/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Guest
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Guests</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
                <p className="text-sm text-gray-600">Attending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.notAttending}</p>
                <p className="text-sm text-gray-600">Not Attending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.invitationsSent}</p>
                <p className="text-sm text-gray-600">Invited</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="search">Search Guests</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Side</Label>
                <Select value={sideFilter} onValueChange={setSideFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sides" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sides</SelectItem>
                    <SelectItem value="bride">Bride's Side</SelectItem>
                    <SelectItem value="groom">Groom's Side</SelectItem>
                    <SelectItem value="mutual">Mutual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>RSVP Status</Label>
                <Select value={rsvpFilter} onValueChange={setRsvpFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="attending">Attending</SelectItem>
                    <SelectItem value="not_attending">Not Attending</SelectItem>
                    <SelectItem value="maybe">Maybe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Invitation Status</Label>
                <Select value={invitationFilter} onValueChange={setInvitationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All invitations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="not_sent">Not Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedGuests.size > 0 && (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  {selectedGuests.size} guest{selectedGuests.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('send_invitation')}
                    disabled={isLoading}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitations
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('send_reminder')}
                    disabled={isLoading}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Reminders
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('delete')}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <Checkbox
                        checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Side
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RSVP Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plus One
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invitation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selectedGuests.has(guest.id)}
                          onCheckedChange={() => handleSelectGuest(guest.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {guest.firstName} {guest.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{guest.relationship}</div>
                          {guest.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {guest.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {guest.email && (
                            <div className="text-sm text-gray-900">{guest.email}</div>
                          )}
                          {guest.phone && (
                            <div className="text-sm text-gray-500">{guest.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSideColor(guest.side)}`}>
                          {guest.side === 'bride' ? 'Bride' : guest.side === 'groom' ? 'Groom' : 'Mutual'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRsvpStatusColor(guest.rsvpStatus)}`}>
                          {guest.rsvpStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {guest.plusOneAllowed ? (
                            <div>
                              <div className="text-sm text-green-600">Allowed</div>
                              {guest.plusOneName && (
                                <div className="text-xs text-gray-500">{guest.plusOneName}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not Allowed</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          guest.invitationSent ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
                        }`}>
                          {guest.invitationSent ? 'Sent' : 'Not Sent'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/guests/${guest.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredGuests.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
                <p className="text-gray-500 mb-4">
                  {guests.length === 0 
                    ? "Get started by adding your first guest."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {guests.length === 0 && (
                  <Button asChild className="bg-wedding-gold hover:bg-wedding-gold/90">
                    <Link href="/dashboard/guests/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Guest
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}