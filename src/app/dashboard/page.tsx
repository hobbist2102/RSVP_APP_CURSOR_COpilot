'use client'

import { useSupabaseSession } from '@/hooks/useSupabaseSession'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  Mail, 
  MessageSquare, 
  Hotel, 
  Car, 
  BarChart3, 
  Settings,
  Plus,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface EventStats {
  totalGuests: number
  rsvpReceived: number
  attending: number
  pendingRsvp: number
  emailsSent: number
  whatsappSent: number
  accommodationBooked: number
  transportationBooked: number
}

interface Event {
  id: string
  name: string
  coupleNames: string
  weddingDate: string
  status: string
  totalGuests: number
  rsvpReceived: number
}

export default function DashboardPage() {
  const { data: session, status } = useSupabaseSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<EventStats>({
    totalGuests: 0,
    rsvpReceived: 0,
    attending: 0,
    pendingRsvp: 0,
    emailsSent: 0,
    whatsappSent: 0,
    accommodationBooked: 0,
    transportationBooked: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }

    // Mock data for now - will be replaced with real API calls
    setTimeout(() => {
      const mockEvents: Event[] = [
        {
          id: '1',
          name: 'Sarah & John Wedding',
          coupleNames: 'Sarah & John',
          weddingDate: '2024-06-15',
          status: 'active',
          totalGuests: 150,
          rsvpReceived: 120
        }
      ]
      
      setEvents(mockEvents)
      setCurrentEvent(mockEvents[0])
      
      setStats({
        totalGuests: 150,
        rsvpReceived: 120,
        attending: 105,
        pendingRsvp: 30,
        emailsSent: 145,
        whatsappSent: 89,
        accommodationBooked: 45,
        transportationBooked: 32
      })
      
      setIsLoading(false)
    }, 1000)
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Heart className="w-12 h-12 text-wedding-gold mx-auto mb-4" />
            <CardTitle>Welcome to Your Wedding Dashboard!</CardTitle>
            <CardDescription>
              Create your first event to start managing your wedding RSVP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-wedding-gold hover:bg-wedding-gold/90">
              <Link href="/dashboard/events/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const rsvpRate = ((stats.rsvpReceived / stats.totalGuests) * 100).toFixed(1)
  const attendanceRate = ((stats.attending / stats.rsvpReceived) * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-wedding-gold mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentEvent.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date(currentEvent.weddingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Guests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">RSVP Received</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rsvpReceived}</p>
                  <p className="text-xs text-gray-500">{rsvpRate}% response rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-wedding-gold" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Attending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.attending}</p>
                  <p className="text-xs text-gray-500">{attendanceRate}% attending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending RSVP</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRsvp}</p>
                  <p className="text-xs text-gray-500">Need follow-up</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your wedding planning tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/dashboard/guests">
                    <Users className="w-6 h-6 mb-2" />
                    Manage Guests
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/dashboard/communications">
                    <Mail className="w-6 h-6 mb-2" />
                    Send Invites
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/dashboard/accommodations">
                    <Hotel className="w-6 h-6 mb-2" />
                    Accommodations
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/dashboard/transportation">
                    <Car className="w-6 h-6 mb-2" />
                    Transportation
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication Summary</CardTitle>
              <CardDescription>Track your outreach efforts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium">Emails Sent</span>
                  </div>
                  <span className="text-lg font-bold">{stats.emailsSent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium">WhatsApp Messages</span>
                  </div>
                  <span className="text-lg font-bold">{stats.whatsappSent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Hotel className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium">Rooms Booked</span>
                  </div>
                  <span className="text-lg font-bold">{stats.accommodationBooked}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Car className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="text-sm font-medium">Transport Arranged</span>
                  </div>
                  <span className="text-lg font-bold">{stats.transportationBooked}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your wedding planning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">John Smith confirmed attendance</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Invitation emails sent to 25 guests</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Hotel rooms assigned to 15 guests</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Transport schedules updated</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}