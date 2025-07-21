import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { guestImportSchema } from '@/lib/validations/guests'
import { generateRsvpToken } from '@/lib/auth/utils'
import { z } from 'zod'

// POST /api/guests/import - Import guests from CSV/Excel data
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validatedData = guestImportSchema.parse(body)

    const supabase = createClient()

    // Verify user has access to the event (RLS will handle this)
    const { data: event, error: eventError } = await supabase
      .from('wedding_events')
      .select('id')
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

    const results = {
      total: validatedData.guests.length,
      imported: 0,
      skipped: 0,
      errors: [] as Array<{ row: number; error: string; data: any }>
    }

    const guestsToInsert = []
    const duplicateChecks = []

    // Process each guest
    for (let i = 0; i < validatedData.guests.length; i++) {
      const guestData = validatedData.guests[i]
      
      try {
        // Check for duplicates if skipDuplicates is enabled
        if (validatedData.skipDuplicates) {
          const { data: existingGuest } = await supabase
            .from('guests')
            .select('id, first_name, last_name, email')
            .eq('event_id', validatedData.eventId)
            .eq('first_name', guestData.firstName)
            .eq('last_name', guestData.lastName)
            .maybeSingle()

          if (existingGuest) {
            // Check if email matches for stronger duplicate detection
            if (guestData.email && existingGuest.email && 
                guestData.email.toLowerCase() === existingGuest.email.toLowerCase()) {
              results.skipped++
              continue
            }
            // Check name-only duplicates
            if (!validatedData.overwriteExisting) {
              results.skipped++
              continue
            }
          }
        }

        // Generate RSVP token for each guest
        const rsvpToken = generateRsvpToken()

        // Prepare guest data for insertion
        const guestInsertData = {
          event_id: validatedData.eventId,
          first_name: guestData.firstName,
          last_name: guestData.lastName,
          email: guestData.email,
          phone: guestData.phone,
          country_code: guestData.countryCode,
          side: guestData.side,
          relationship: guestData.relationship,
          is_family: guestData.isFamily || false,
          is_vip: guestData.isVip || false,
          rsvp_status: guestData.rsvpStatus || 'pending',
          rsvp_token: rsvpToken,
          plus_one_allowed: guestData.plusOneAllowed || false,
          plus_one_name: guestData.plusOneName,
          plus_one_email: guestData.plusOneEmail,
          plus_one_phone: guestData.plusOnePhone,
          plus_one_relationship: guestData.plusOneRelationship,
          dietary_restrictions: guestData.dietaryRestrictions,
          allergies: guestData.allergies,
          special_requests: guestData.specialRequests,
          children_details: guestData.childrenDetails || [],
          needs_accommodation: guestData.needsAccommodation || false,
          accommodation_preference: guestData.accommodationPreference,
          needs_flight_assistance: guestData.needsFlightAssistance || false,
          arrival_date: guestData.arrivalDate,
          departure_date: guestData.departureDate,
          notes: guestData.notes,
        }

        guestsToInsert.push(guestInsertData)
        
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Processing error',
          data: guestData
        })
      }
    }

    // Batch insert guests
    if (guestsToInsert.length > 0) {
      const { data: insertedGuests, error: insertError } = await supabase
        .from('guests')
        .insert(guestsToInsert)
        .select('id, first_name, last_name, email, rsvp_token')

      if (insertError) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to import guests: ${insertError.message}`,
            code: 'IMPORT_FAILED',
            details: results
          },
          { status: 500 }
        )
      }

      results.imported = insertedGuests?.length || 0
    }

    // Calculate final results
    const successRate = results.total > 0 ? Math.round((results.imported / results.total) * 100) : 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total: results.total,
          imported: results.imported,
          skipped: results.skipped,
          errors: results.errors.length,
          successRate
        },
        errors: results.errors.length > 0 ? results.errors : undefined
      },
      message: `Import completed: ${results.imported} guests imported, ${results.skipped} skipped, ${results.errors.length} errors`
    })

  } catch (error) {
    console.error('Error importing guests:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to import guests',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}