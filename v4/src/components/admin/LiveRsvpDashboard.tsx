'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRealtimeRsvp, useRealtimeGuestUpdates } from '@/lib/hooks/useRealtimeRsvp'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Activity, 
  Wifi, 
  WifiOff,
  RefreshCw,
  TrendingUp,
  Calendar,
  Bell,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiveRsvpDashboardProps {
  eventId: number
  eventTitle: string
  eventDate: string
  className?: string
}

export default function LiveRsvpDashboard({
  eventId,
  eventTitle,
  eventDate,
  className
}: LiveRsvpDashboardProps) {
  const [showRecentUpdates, setShowRecentUpdates] = useState(true)
  
  const { 
    isConnected, 
    recentUpdates, 
    stats, 
    clearRecentUpdates, 
    refreshStats 
  } = useRealtimeRsvp(eventId)

  const { guests, isLoading } = useRealtimeGuestUpdates(eventId)

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getResponseRate = () => {
    if (!stats || stats.totalGuests === 0) return 0
    return Math.round(((stats.confirmed + stats.declined) / stats.totalGuests) * 100)
  }

  const getConfirmationRate = () => {
    if (!stats || stats.totalGuests === 0) return 0
    return Math.round((stats.confirmed / stats.totalGuests) * 100)
  }

  const getTotalAttending = () => {
    if (!stats) return 0
    return stats.confirmed + stats.plusOnes
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">
                Live RSVP Dashboard
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {eventTitle} • {formatDate(eventDate)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant={isConnected ? "default" : "destructive"} 
                className="flex items-center gap-1"
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Live
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Disconnected
                  </>
                )}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStats}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invited</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalGuests || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.confirmed || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {getConfirmationRate()}% of total
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Declined</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.declined || 0}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.pending || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Response Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Response Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Response Rate</span>
                <span className="font-medium">{getResponseRate()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getResponseRate()}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confirmation Rate</span>
                <span className="font-medium">{getConfirmationRate()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getConfirmationRate()}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Attending</span>
                <div className="text-right">
                  <p className="font-semibold text-lg">{getTotalAttending()}</p>
                  <p className="text-xs text-gray-500">
                    {stats?.confirmed || 0} guests + {stats?.plusOnes || 0} plus ones
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Updates
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRecentUpdates(!showRecentUpdates)}
                >
                  {showRecentUpdates ? 'Hide' : 'Show'}
                </Button>
                {recentUpdates.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentUpdates}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          {showRecentUpdates && (
            <CardContent>
              {recentUpdates.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent updates</p>
                  <p className="text-xs">RSVP changes will appear here in real-time</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {recentUpdates.map((update, index) => (
                    <div 
                      key={`${update.id}-${update.timestamp}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {update.rsvpStatus === 'confirmed' ? (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        ) : update.rsvpStatus === 'declined' ? (
                          <UserX className="h-4 w-4 text-red-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{update.guestName}</p>
                          <p className="text-xs text-gray-600">
                            {update.rsvpStatus} their RSVP
                            {update.plusOneConfirmed && ' (+ guest)'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(update.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Real-time updates are currently disconnected. Data may not be up to date.
          </AlertDescription>
        </Alert>
      )}

      {/* Last Update */}
      {stats?.lastUpdate && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(stats.lastUpdate).toLocaleString()}
        </div>
      )}
    </div>
  )
}