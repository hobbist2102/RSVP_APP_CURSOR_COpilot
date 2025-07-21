import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rsvpUpdateSchema } from '@/lib/validations/guests'
import { z } from 'zod'

// GET /api/rsvp/[token] - Access RSVP form using token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token || token.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid RSVP token',
          code: 'INVALID_TOKEN'
        },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Find guest by RSVP token
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select(`
        *,
        wedding_events (
          id,
          title,
          couple_names,
          bride_name,
          groom_name,
          start_date,
          end_date,
          location,
          description,
          rsvp_deadline,
          allow_plus_ones,
          allow_children_details,
          rsvp_welcome_title,
          rsvp_welcome_message,
          rsvp_custom_branding,
          rsvp_show_select_all,
          primary_color,
          secondary_color,
          logo_url,
          banner_url
        ),
        guest_ceremonies (
          ceremony_id,
          attending,
          meal_preference,
          special_dietary_needs,
          ceremonies (
            id,
            name,
            date,
            start_time,
            end_time,
            location,
            description,
            attire_code,
            ceremony_type,
            max_capacity
          )
        )
      `)
      .eq('rsvp_token', token)
      .single()

    if (guestError || !guest) {
      return NextResponse.json(
        {
          success: false,
          error: 'RSVP invitation not found',
          code: 'TOKEN_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Check if RSVP deadline has passed (if set)
    const event = guest.wedding_events
    if (event.rsvp_deadline) {
      const deadline = new Date(event.rsvp_deadline)
      const now = new Date()
      if (now > deadline) {
        return NextResponse.json(
          {
            success: false,
            error: 'RSVP deadline has passed',
            code: 'DEADLINE_PASSED',
            data: {
              deadline: event.rsvp_deadline,
              guest: {
                firstName: guest.first_name,
                lastName: guest.last_name,
                rsvpStatus: guest.rsvp_status
              }
            }
          },
          { status: 410 }
        )
      }
    }

    // Get all ceremonies for this event
    const { data: ceremonies, error: ceremoniesError } = await supabase
      .from('ceremonies')
      .select('*')
      .eq('event_id', event.id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (ceremoniesError) {
      console.error('Error fetching ceremonies:', ceremoniesError)
    }

    // Transform guest data for frontend
    const rsvpData = {
      token,
      guest: {
        id: guest.id,
        firstName: guest.first_name,
        lastName: guest.last_name,
        email: guest.email,
        phone: guest.phone,
        side: guest.side,
        relationship: guest.relationship,
        rsvpStatus: guest.rsvp_status,
        rsvpDate: guest.rsvp_date,
        plusOneAllowed: guest.plus_one_allowed,
        plusOneConfirmed: guest.plus_one_confirmed,
        plusOneName: guest.plus_one_name,
        plusOneEmail: guest.plus_one_email,
        plusOnePhone: guest.plus_one_phone,
        plusOneRelationship: guest.plus_one_relationship,
        dietaryRestrictions: guest.dietary_restrictions,
        allergies: guest.allergies,
        specialRequests: guest.special_requests,
        childrenDetails: guest.children_details || [],
        needsAccommodation: guest.needs_accommodation,
        accommodationPreference: guest.accommodation_preference,
        needsFlightAssistance: guest.needs_flight_assistance,
        arrivalDate: guest.arrival_date,
        departureDate: guest.departure_date,
        notes: guest.notes
      },
      event: {
        id: event.id,
        title: event.title,
        coupleNames: event.couple_names,
        brideName: event.bride_name,
        groomName: event.groom_name,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        description: event.description,
        rsvpDeadline: event.rsvp_deadline,
        allowPlusOnes: event.allow_plus_ones,
        allowChildrenDetails: event.allow_children_details,
        rsvpWelcomeTitle: event.rsvp_welcome_title,
        rsvpWelcomeMessage: event.rsvp_welcome_message,
        rsvpCustomBranding: event.rsvp_custom_branding,
        rsvpShowSelectAll: event.rsvp_show_select_all,
        primaryColor: event.primary_color,
        secondaryColor: event.secondary_color,
        logoUrl: event.logo_url,
        bannerUrl: event.banner_url
      },
      ceremonies: ceremonies || [],
      currentCeremonyResponses: guest.guest_ceremonies || []
    }

    return NextResponse.json({
      success: true,
      data: rsvpData
    })

  } catch (error) {
    console.error('Error accessing RSVP:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to access RSVP',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// PUT /api/rsvp/[token] - Submit RSVP response
export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token || token.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid RSVP token',
          code: 'INVALID_TOKEN'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = rsvpUpdateSchema.parse(body)

    const supabase = createClient()

    // Find guest by RSVP token
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select(`
        *,
        wedding_events (
          id,
          rsvp_deadline,
          allow_plus_ones,
          allow_children_details
        )
      `)
      .eq('rsvp_token', token)
      .single()

    if (guestError || !guest) {
      return NextResponse.json(
        {
          success: false,
          error: 'RSVP invitation not found',
          code: 'TOKEN_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Check RSVP deadline
    const event = guest.wedding_events
    if (event.rsvp_deadline) {
      const deadline = new Date(event.rsvp_deadline)
      const now = new Date()
      if (now > deadline) {
        return NextResponse.json(
          {
            success: false,
            error: 'RSVP deadline has passed',
            code: 'DEADLINE_PASSED'
          },
          { status: 410 }
        )
      }
    }

    // Validate plus one data if provided
    if (validatedData.plusOneConfirmed && !guest.plus_one_allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plus one not allowed for this guest',
          code: 'PLUS_ONE_NOT_ALLOWED'
        },
        { status: 400 }
      )
    }

    // Update guest RSVP information
    const updateData: any = {
      rsvp_status: validatedData.rsvpStatus,
      rsvp_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add optional fields if provided
    if (validatedData.plusOneConfirmed !== undefined) updateData.plus_one_confirmed = validatedData.plusOneConfirmed
    if (validatedData.plusOneName) updateData.plus_one_name = validatedData.plusOneName
    if (validatedData.plusOneEmail) updateData.plus_one_email = validatedData.plusOneEmail
    if (validatedData.plusOnePhone) updateData.plus_one_phone = validatedData.plusOnePhone
    if (validatedData.plusOneRelationship) updateData.plus_one_relationship = validatedData.plusOneRelationship
    if (validatedData.dietaryRestrictions !== undefined) updateData.dietary_restrictions = validatedData.dietaryRestrictions
    if (validatedData.allergies !== undefined) updateData.allergies = validatedData.allergies
    if (validatedData.specialRequests !== undefined) updateData.special_requests = validatedData.specialRequests
    if (validatedData.childrenDetails !== undefined) updateData.children_details = validatedData.childrenDetails
    if (validatedData.needsAccommodation !== undefined) updateData.needs_accommodation = validatedData.needsAccommodation
    if (validatedData.accommodationPreference !== undefined) updateData.accommodation_preference = validatedData.accommodationPreference
    if (validatedData.needsFlightAssistance !== undefined) updateData.needs_flight_assistance = validatedData.needsFlightAssistance
    if (validatedData.arrivalDate) updateData.arrival_date = validatedData.arrivalDate
    if (validatedData.departureDate) updateData.departure_date = validatedData.departureDate
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes

    const { data: updatedGuest, error: updateError } = await supabase
      .from('guests')
      .update(updateData)
      .eq('id', guest.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update RSVP: ${updateError.message}`,
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      )
    }

    // Handle ceremony responses if provided
    if (validatedData.ceremonyResponses && validatedData.ceremonyResponses.length > 0) {
      // Delete existing ceremony responses
      await supabase
        .from('guest_ceremonies')
        .delete()
        .eq('guest_id', guest.id)

      // Insert new ceremony responses
      const ceremonyInserts = validatedData.ceremonyResponses.map(response => ({
        guest_id: guest.id,
        ceremony_id: response.ceremonyId,
        attending: response.attending,
        meal_preference: response.mealPreference,
        special_dietary_needs: response.specialDietaryNeeds
      }))

      const { error: ceremonyError } = await supabase
        .from('guest_ceremonies')
        .insert(ceremonyInserts)

      if (ceremonyError) {
        console.error('Error updating ceremony responses:', ceremonyError)
        // Don't fail the whole request for ceremony errors
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        guest: updatedGuest,
        message: `RSVP ${validatedData.rsvpStatus} successfully recorded`
      },
      message: `Thank you! Your RSVP has been ${validatedData.rsvpStatus === 'confirmed' ? 'confirmed' : 'recorded'}.`
    })

  } catch (error) {
    console.error('Error submitting RSVP:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'RSVP validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit RSVP',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}