import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { exportGuestsSchema } from '@/lib/validations/guests'
import { z } from 'zod'

// GET /api/guests/export - Export guests to CSV/Excel format
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    // Parse numeric and boolean fields
    if (queryParams.eventId) queryParams.eventId = parseInt(queryParams.eventId)
    ['includePersonalInfo', 'includeRsvpStatus', 'includeCeremonies', 'includeAccommodation', 'includeTravel', 'includeNotes'].forEach(field => {
      if (queryParams[field] !== undefined) {
        queryParams[field] = queryParams[field] === 'true'
      }
    })

    const validatedQuery = exportGuestsSchema.parse(queryParams)

    const supabase = createClient()

    // Build the select statement based on what to include
    let selectFields = ['id', 'first_name', 'last_name', 'side', 'relationship', 'is_family', 'is_vip', 'created_at']

    if (validatedQuery.includePersonalInfo) {
      selectFields.push('email', 'phone', 'country_code')
    }

    if (validatedQuery.includeRsvpStatus) {
      selectFields.push('rsvp_status', 'rsvp_date', 'plus_one_allowed', 'plus_one_confirmed', 'plus_one_name', 'plus_one_email', 'dietary_restrictions', 'allergies', 'special_requests', 'children_details')
    }

    if (validatedQuery.includeAccommodation) {
      selectFields.push('needs_accommodation', 'accommodation_preference')
    }

    if (validatedQuery.includeTravel) {
      selectFields.push('needs_flight_assistance', 'arrival_date', 'departure_date')
    }

    if (validatedQuery.includeNotes) {
      selectFields.push('notes')
    }

    // Add ceremony data if requested
    let selectQuery = selectFields.join(', ')
    if (validatedQuery.includeCeremonies) {
      selectQuery += `, guest_ceremonies (
        ceremony_id,
        attending,
        meal_preference,
        ceremonies (
          id,
          name,
          date,
          start_time
        )
      )`
    }

    let query = supabase
      .from('guests')
      .select(selectQuery)

    // Apply event filter if specified
    if (validatedQuery.eventId) {
      query = query.eq('event_id', validatedQuery.eventId)
    }

    // Apply additional filters if provided
    if (validatedQuery.filters) {
      const filters = validatedQuery.filters
      
      if (filters.side) {
        query = query.eq('side', filters.side)
      }
      if (filters.rsvpStatus) {
        query = query.eq('rsvp_status', filters.rsvpStatus)
      }
      if (filters.isFamily !== undefined) {
        query = query.eq('is_family', filters.isFamily)
      }
      if (filters.isVip !== undefined) {
        query = query.eq('is_vip', filters.isVip)
      }
      if (filters.needsAccommodation !== undefined) {
        query = query.eq('needs_accommodation', filters.needsAccommodation)
      }
      if (filters.needsFlightAssistance !== undefined) {
        query = query.eq('needs_flight_assistance', filters.needsFlightAssistance)
      }
      if (filters.hasEmail !== undefined) {
        if (filters.hasEmail) {
          query = query.not('email', 'is', null)
        } else {
          query = query.is('email', null)
        }
      }
      if (filters.hasPhone !== undefined) {
        if (filters.hasPhone) {
          query = query.not('phone', 'is', null)
        } else {
          query = query.is('phone', null)
        }
      }
      if (filters.plusOneAllowed !== undefined) {
        query = query.eq('plus_one_allowed', filters.plusOneAllowed)
      }
      if (filters.plusOneConfirmed !== undefined) {
        query = query.eq('plus_one_confirmed', filters.plusOneConfirmed)
      }
      if (filters.query) {
        query = query.or(`first_name.ilike.%${filters.query}%,last_name.ilike.%${filters.query}%,email.ilike.%${filters.query}%`)
      }
    }

    // Order by name for consistent export
    query = query.order('first_name', { ascending: true })
    query = query.order('last_name', { ascending: true })

    const { data: guests, error } = await query

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to export guests: ${error.message}`,
          code: 'EXPORT_FAILED'
        },
        { status: 500 }
      )
    }

    if (!guests || guests.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No guests found matching the criteria',
          code: 'NO_DATA'
        },
        { status: 404 }
      )
    }

    // Transform data for export
    const exportData = guests.map(guest => {
      const row: any = {
        'First Name': guest.first_name,
        'Last Name': guest.last_name,
        'Side': guest.side,
        'Relationship': guest.relationship || '',
        'Family Member': guest.is_family ? 'Yes' : 'No',
        'VIP': guest.is_vip ? 'Yes' : 'No',
      }

      if (validatedQuery.includePersonalInfo) {
        row['Email'] = guest.email || ''
        row['Phone'] = guest.phone || ''
        row['Country Code'] = guest.country_code || ''
      }

      if (validatedQuery.includeRsvpStatus) {
        row['RSVP Status'] = guest.rsvp_status
        row['RSVP Date'] = guest.rsvp_date || ''
        row['Plus One Allowed'] = guest.plus_one_allowed ? 'Yes' : 'No'
        row['Plus One Confirmed'] = guest.plus_one_confirmed ? 'Yes' : 'No'
        row['Plus One Name'] = guest.plus_one_name || ''
        row['Plus One Email'] = guest.plus_one_email || ''
        row['Dietary Restrictions'] = guest.dietary_restrictions || ''
        row['Allergies'] = guest.allergies || ''
        row['Special Requests'] = guest.special_requests || ''
        row['Children Count'] = guest.children_details ? guest.children_details.length : 0
      }

      if (validatedQuery.includeAccommodation) {
        row['Needs Accommodation'] = guest.needs_accommodation ? 'Yes' : 'No'
        row['Accommodation Preference'] = guest.accommodation_preference || ''
      }

      if (validatedQuery.includeTravel) {
        row['Needs Flight Assistance'] = guest.needs_flight_assistance ? 'Yes' : 'No'
        row['Arrival Date'] = guest.arrival_date || ''
        row['Departure Date'] = guest.departure_date || ''
      }

      if (validatedQuery.includeCeremonies && guest.guest_ceremonies) {
        const ceremonies = guest.guest_ceremonies.map((gc: any) => 
          `${gc.ceremonies.name}: ${gc.attending ? 'Attending' : 'Not Attending'}${gc.meal_preference ? ` (${gc.meal_preference})` : ''}`
        ).join('; ')
        row['Ceremonies'] = ceremonies
      }

      if (validatedQuery.includeNotes) {
        row['Notes'] = guest.notes || ''
      }

      return row
    })

    // Return structured data for client-side CSV/Excel generation
    return NextResponse.json({
      success: true,
      data: {
        guests: exportData,
        summary: {
          total: guests.length,
          format: validatedQuery.format,
          exportDate: new Date().toISOString(),
          filters: validatedQuery.filters
        }
      },
      message: `Successfully exported ${guests.length} guests`
    })

  } catch (error) {
    console.error('Error exporting guests:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to export guests',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}