import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface RsvpUpdate {
  id: number
  eventId: number
  guestName: string
  rsvpStatus: 'confirmed' | 'declined' | 'pending'
  timestamp: string
  plusOneConfirmed?: boolean
  ceremonyCount?: number
}

interface RsvpStats {
  totalGuests: number
  confirmed: number
  declined: number
  pending: number
  plusOnes: number
  lastUpdate: string
}

export function useRealtimeRsvp(eventId?: number) {
  const [isConnected, setIsConnected] = useState(false)
  const [recentUpdates, setRecentUpdates] = useState<RsvpUpdate[]>([])
  const [stats, setStats] = useState<RsvpStats | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!eventId) return

    const supabase = createClient()

    // Create channel for real-time updates
    const channelName = `rsvp-updates-${eventId}`
    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          handleGuestUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guest_ceremonies',
        },
        (payload) => {
          handleCeremonyUpdate(payload)
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') {
          console.log(`Connected to real-time RSVP updates for event ${eventId}`)
          fetchCurrentStats()
        }
      })

    setChannel(realtimeChannel)

    // Initial stats fetch
    fetchCurrentStats()

    return () => {
      realtimeChannel.unsubscribe()
      setIsConnected(false)
      setChannel(null)
    }
  }, [eventId])

  const handleGuestUpdate = (payload: any) => {
    const { new: newRecord, old: oldRecord, eventType } = payload

    // Filter updates for our event
    if (newRecord?.event_id !== eventId && oldRecord?.event_id !== eventId) {
      return
    }

    let updateType = 'updated'
    if (eventType === 'INSERT') updateType = 'new guest'
    if (eventType === 'DELETE') updateType = 'guest removed'

    // Check if RSVP status changed
    if (newRecord && oldRecord && newRecord.rsvp_status !== oldRecord.rsvp_status) {
      const update: RsvpUpdate = {
        id: newRecord.id,
        eventId: newRecord.event_id,
        guestName: `${newRecord.first_name} ${newRecord.last_name}`,
        rsvpStatus: newRecord.rsvp_status,
        timestamp: new Date().toISOString(),
        plusOneConfirmed: newRecord.plus_one_confirmed
      }

      setRecentUpdates(prev => [update, ...prev.slice(0, 9)]) // Keep last 10 updates
    }

    // Refresh stats after any guest change
    setTimeout(fetchCurrentStats, 500) // Small delay to ensure DB consistency
  }

  const handleCeremonyUpdate = (payload: any) => {
    // Refresh stats when ceremony responses change
    setTimeout(fetchCurrentStats, 500)
  }

  const fetchCurrentStats = async () => {
    if (!eventId) return

    try {
      const supabase = createClient()

      // Get guest statistics
      const { data: guests, error } = await supabase
        .from('guests')
        .select('id, rsvp_status, plus_one_confirmed')
        .eq('event_id', eventId)

      if (error) {
        console.error('Error fetching RSVP stats:', error)
        return
      }

      const newStats: RsvpStats = {
        totalGuests: guests?.length || 0,
        confirmed: guests?.filter(g => g.rsvp_status === 'confirmed').length || 0,
        declined: guests?.filter(g => g.rsvp_status === 'declined').length || 0,
        pending: guests?.filter(g => g.rsvp_status === 'pending').length || 0,
        plusOnes: guests?.filter(g => g.plus_one_confirmed).length || 0,
        lastUpdate: new Date().toISOString()
      }

      setStats(newStats)
    } catch (error) {
      console.error('Error fetching current stats:', error)
    }
  }

  const clearRecentUpdates = () => {
    setRecentUpdates([])
  }

  return {
    isConnected,
    recentUpdates,
    stats,
    clearRecentUpdates,
    refreshStats: fetchCurrentStats
  }
}

// Hook for listening to specific guest updates (for admin view)
export function useRealtimeGuestUpdates(eventId?: number) {
  const [guests, setGuests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return

    const supabase = createClient()

    // Fetch initial guests
    const fetchGuests = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('guests')
        .select(`
          *,
          guest_ceremonies (
            ceremony_id,
            attending,
            meal_preference,
            ceremonies (
              id,
              name
            )
          )
        `)
        .eq('event_id', eventId)
        .order('updated_at', { ascending: false })

      if (!error && data) {
        setGuests(data)
      }
      setIsLoading(false)
    }

    fetchGuests()

    // Set up real-time subscription
    const channel = supabase
      .channel(`guest-updates-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          const { new: newRecord, old: oldRecord, eventType } = payload

          setGuests(prev => {
            if (eventType === 'DELETE') {
              return prev.filter(g => g.id !== oldRecord.id)
            }
            
            if (eventType === 'INSERT') {
              return [newRecord, ...prev]
            }
            
            if (eventType === 'UPDATE') {
              return prev.map(g => g.id === newRecord.id ? { ...g, ...newRecord } : g)
            }
            
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [eventId])

  return { guests, isLoading }
}

// Hook for global RSVP notifications (across all events for a user)
export function useRealtimeRsvpNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    timestamp: string
    type: 'new_rsvp' | 'status_change' | 'guest_update'
    eventId: number
    eventTitle?: string
  }>>([])

  useEffect(() => {
    const supabase = createClient()

    // Listen to all guest updates for user's events
    const channel = supabase
      .channel('global-rsvp-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'guests'
        },
        (payload) => {
          const { new: guest, old: oldGuest } = payload
          
          // Only notify on RSVP status changes
          if (guest.rsvp_status !== oldGuest.rsvp_status && guest.rsvp_status !== 'pending') {
            const notification = {
              id: `${guest.id}-${Date.now()}`,
              message: `${guest.first_name} ${guest.last_name} ${guest.rsvp_status} their RSVP`,
              timestamp: new Date().toISOString(),
              type: 'status_change' as const,
              eventId: guest.event_id
            }

            setNotifications(prev => [notification, ...prev.slice(0, 19)]) // Keep last 20
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const clearNotifications = () => {
    setNotifications([])
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  return {
    notifications,
    clearNotifications,
    markAsRead
  }
}