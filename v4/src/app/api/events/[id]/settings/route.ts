import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { eventService } from '@/lib/services/events'
import { eventSettingsSchema } from '@/lib/validations/events'
import { z } from 'zod'

// GET /api/events/[id]/settings - Get event settings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    
    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid event ID',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      )
    }

    const event = await eventService.getEvent(eventId)

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Extract settings from event data
    const settings = {
      allowPlusOnes: event.allow_plus_ones,
      allowChildrenDetails: event.allow_children_details,
      customRsvpUrl: event.custom_rsvp_url,
      rsvpWelcomeTitle: event.rsvp_welcome_title,
      rsvpWelcomeMessage: event.rsvp_welcome_message,
      rsvpCustomBranding: event.rsvp_custom_branding,
      rsvpShowSelectAll: event.rsvp_show_select_all,
      rsvpDeadline: event.rsvp_deadline,
      emailProvider: event.email_provider,
      emailFromAddress: event.email_from_address,
      emailFromName: event.email_from_name,
      emailConfigured: event.email_configured,
      whatsappConfigured: event.whatsapp_configured,
      whatsappBusinessPhoneId: event.whatsapp_business_phone_id,
      whatsappAccessToken: event.whatsapp_access_token,
      primaryColor: event.primary_color,
      secondaryColor: event.secondary_color,
      logoUrl: event.logo_url,
      bannerUrl: event.banner_url,
    }

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error getting event settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event settings',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id]/settings - Update event settings
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    
    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid event ID',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = eventSettingsSchema.parse(body)

    const updatedEvent = await eventService.updateEventSettings(eventId, validatedData)

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'Event settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating event settings:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to update event settings',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}