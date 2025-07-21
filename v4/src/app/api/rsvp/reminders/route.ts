import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const reminderRequestSchema = z.object({
  eventId: z.number().min(1, "Event ID is required"),
  targetStatus: z.enum(['pending', 'all']).default('pending'),
  reminderType: z.enum(['email', 'sms', 'both']).default('email'),
  customMessage: z.string().optional(),
  includeDeadline: z.boolean().default(true),
  scheduleFor: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).optional(), // ISO datetime for scheduling
  testMode: z.boolean().default(false) // For testing without actually sending
})

// POST /api/rsvp/reminders - Send RSVP reminder notifications
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validatedData = reminderRequestSchema.parse(body)

    const supabase = createClient()

    // Verify user has access to the event (RLS will handle this)
    const { data: event, error: eventError } = await supabase
      .from('wedding_events')
      .select(`
        id,
        title,
        couple_names,
        bride_name,
        groom_name,
        start_date,
        rsvp_deadline,
        email_configured,
        email_from_address,
        email_from_name
      `)
      .eq('id', validatedData.eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found or access denied',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Check if email is configured for this event
    if ((validatedData.reminderType === 'email' || validatedData.reminderType === 'both') && !event.email_configured) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email not configured for this event',
          code: 'EMAIL_NOT_CONFIGURED'
        },
        { status: 400 }
      )
    }

    // Get guests who need reminders
    let guestQuery = supabase
      .from('guests')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        country_code,
        rsvp_status,
        rsvp_token,
        plus_one_allowed,
        created_at
      `)
      .eq('event_id', validatedData.eventId)

    // Filter by target status
    if (validatedData.targetStatus === 'pending') {
      guestQuery = guestQuery.eq('rsvp_status', 'pending')
    }

    // Only include guests with contact info based on reminder type
    if (validatedData.reminderType === 'email') {
      guestQuery = guestQuery.not('email', 'is', null)
    } else if (validatedData.reminderType === 'sms') {
      guestQuery = guestQuery.not('phone', 'is', null)
    } else if (validatedData.reminderType === 'both') {
      guestQuery = guestQuery.or('email.not.is.null,phone.not.is.null')
    }

    const { data: guests, error: guestsError } = await guestQuery

    if (guestsError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to get guests: ${guestsError.message}`,
          code: 'QUERY_FAILED'
        },
        { status: 500 }
      )
    }

    if (!guests || guests.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No guests found matching the criteria',
          code: 'NO_RECIPIENTS'
        },
        { status: 404 }
      )
    }

    // Prepare reminder data
    const reminderData = {
      eventId: validatedData.eventId,
      eventTitle: event.title,
      coupleNames: event.couple_names,
      rsvpDeadline: event.rsvp_deadline,
      customMessage: validatedData.customMessage,
      includeDeadline: validatedData.includeDeadline,
      fromEmail: event.email_from_address,
      fromName: event.email_from_name || event.couple_names,
      scheduledFor: validatedData.scheduleFor ? new Date(validatedData.scheduleFor) : new Date()
    }

    // Categorize guests by available contact methods
    const emailGuests = guests.filter(g => g.email)
    const smsGuests = guests.filter(g => g.phone)

    const results = {
      total: guests.length,
      emailReminders: 0,
      smsReminders: 0,
      scheduled: 0,
      errors: [] as Array<{ guestId: number; error: string }>
    }

    // Process reminders (in test mode, we just validate and return counts)
    if (validatedData.testMode) {
      // Test mode - just validate and return what would be sent
      if (validatedData.reminderType === 'email' || validatedData.reminderType === 'both') {
        results.emailReminders = emailGuests.length
      }
      if (validatedData.reminderType === 'sms' || validatedData.reminderType === 'both') {
        results.smsReminders = smsGuests.length
      }

      return NextResponse.json({
        success: true,
        data: {
          testMode: true,
          results,
          reminderData,
          recipientPreview: guests.slice(0, 5).map(g => ({
            id: g.id,
            name: `${g.first_name} ${g.last_name}`,
            email: g.email,
            phone: g.phone,
            rsvpStatus: g.rsvp_status
          }))
        },
        message: `Test mode: Would send ${results.emailReminders + results.smsReminders} reminders`
      })
    }

    // Production mode - queue reminders for sending
    const reminderQueue = []

    for (const guest of guests) {
      const reminderRecord = {
        guest_id: guest.id,
        event_id: validatedData.eventId,
        reminder_type: validatedData.reminderType,
        recipient_email: guest.email,
        recipient_phone: guest.phone,
        custom_message: validatedData.customMessage,
        scheduled_for: reminderData.scheduledFor.toISOString(),
        status: validatedData.scheduleFor ? 'scheduled' : 'pending',
        rsvp_url: `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${guest.rsvp_token}`
      }

      reminderQueue.push(reminderRecord)
    }

    // Insert reminder records into the database
    const { data: insertedReminders, error: insertError } = await supabase
      .from('rsvp_reminders')
      .insert(reminderQueue)
      .select('id, guest_id, reminder_type, status')

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to queue reminders: ${insertError.message}`,
          code: 'INSERT_FAILED'
        },
        { status: 500 }
      )
    }

    // Count successful reminders by type
    insertedReminders?.forEach(reminder => {
      if (reminder.reminder_type === 'email' || reminder.reminder_type === 'both') {
        results.emailReminders++
      }
      if (reminder.reminder_type === 'sms' || reminder.reminder_type === 'both') {
        results.smsReminders++
      }
      if (reminder.status === 'scheduled') {
        results.scheduled++
      }
    })

    // Update event reminder statistics
    await supabase
      .from('wedding_events')
      .update({
        last_reminder_sent: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.eventId)

    return NextResponse.json({
      success: true,
      data: {
        results,
        reminderData: {
          eventTitle: event.title,
          targetStatus: validatedData.targetStatus,
          reminderType: validatedData.reminderType,
          scheduledFor: reminderData.scheduledFor,
          totalRecipients: guests.length
        }
      },
      message: `Successfully queued ${results.emailReminders + results.smsReminders} RSVP reminders`
    })

  } catch (error) {
    console.error('Error sending RSVP reminders:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send RSVP reminders',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// GET /api/rsvp/reminders - Get reminder history and stats
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId || isNaN(parseInt(eventId))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid event ID is required',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get reminder history for the event
    const { data: reminders, error: remindersError } = await supabase
      .from('rsvp_reminders')
      .select(`
        *,
        guests (
          id,
          first_name,
          last_name,
          email,
          phone,
          rsvp_status
        )
      `)
      .eq('event_id', parseInt(eventId))
      .order('created_at', { ascending: false })

    if (remindersError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to get reminders: ${remindersError.message}`,
          code: 'QUERY_FAILED'
        },
        { status: 500 }
      )
    }

    // Calculate reminder statistics
    const stats = {
      total: reminders?.length || 0,
      pending: reminders?.filter(r => r.status === 'pending').length || 0,
      sent: reminders?.filter(r => r.status === 'sent').length || 0,
      failed: reminders?.filter(r => r.status === 'failed').length || 0,
      scheduled: reminders?.filter(r => r.status === 'scheduled').length || 0,
      byType: {
        email: reminders?.filter(r => r.reminder_type === 'email' || r.reminder_type === 'both').length || 0,
        sms: reminders?.filter(r => r.reminder_type === 'sms' || r.reminder_type === 'both').length || 0
      },
      lastSent: reminders?.find(r => r.status === 'sent')?.sent_at || null
    }

    return NextResponse.json({
      success: true,
      data: {
        reminders: reminders || [],
        statistics: stats
      }
    })

  } catch (error) {
    console.error('Error getting reminder history:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get reminder history',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}