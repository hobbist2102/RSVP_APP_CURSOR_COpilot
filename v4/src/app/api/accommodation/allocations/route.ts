import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createAllocationSchema = z.object({
  accommodationId: z.number().int().positive(),
  guestId: z.number().int().positive(),
  roomNumber: z.string().optional(),
  checkInDate: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutDate: z.string().optional(),
  checkOutTime: z.string().optional(),
  specialRequests: z.string().optional(),
  includesPlusOne: z.boolean().default(false),
  includesChildren: z.boolean().default(false),
  childrenCount: z.number().int().min(0).default(0),
  additionalGuestsInfo: z.string().optional()
})

const updateAllocationSchema = createAllocationSchema.partial()

const updateStatusSchema = z.object({
  checkInStatus: z.enum(['pending', 'confirmed', 'checked-in', 'no-show']).optional(),
  checkOutStatus: z.enum(['pending', 'checked-out']).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional()
})

// POST /api/accommodation/allocations - Create new room allocation
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const validatedData = createAllocationSchema.parse(body)

    const supabase = createClient()

    // First, get the accommodation to check availability
    const { data: accommodation, error: accommodationError } = await supabase
      .from('accommodations')
      .select('total_rooms, allocated_rooms')
      .eq('id', validatedData.accommodationId)
      .single()

    if (accommodationError) {
      return NextResponse.json({
        success: false,
        error: `Accommodation not found: ${accommodationError.message}`,
        code: 'ACCOMMODATION_NOT_FOUND'
      }, { status: 404 })
    }

    // Check if there are available rooms
    if (accommodation.allocated_rooms >= accommodation.total_rooms) {
      return NextResponse.json({
        success: false,
        error: 'No available rooms in this accommodation',
        code: 'NO_ROOMS_AVAILABLE'
      }, { status: 409 })
    }

    // Check if guest is already allocated to this accommodation
    const { data: existingAllocation } = await supabase
      .from('room_allocations')
      .select('id')
      .eq('guest_id', validatedData.guestId)
      .eq('accommodation_id', validatedData.accommodationId)
      .single()

    if (existingAllocation) {
      return NextResponse.json({
        success: false,
        error: 'Guest is already allocated to this accommodation',
        code: 'GUEST_ALREADY_ALLOCATED'
      }, { status: 409 })
    }

    // Create room allocation
    const { data: allocation, error } = await supabase
      .from('room_allocations')
      .insert({
        accommodation_id: validatedData.accommodationId,
        guest_id: validatedData.guestId,
        room_number: validatedData.roomNumber,
        check_in_date: validatedData.checkInDate,
        check_in_time: validatedData.checkInTime,
        check_out_date: validatedData.checkOutDate,
        check_out_time: validatedData.checkOutTime,
        check_in_status: 'pending',
        check_out_status: 'pending',
        special_requests: validatedData.specialRequests,
        includes_plus_one: validatedData.includesPlusOne,
        includes_children: validatedData.includesChildren,
        children_count: validatedData.childrenCount,
        additional_guests_info: validatedData.additionalGuestsInfo
      })
      .select(`
        *,
        guests (
          id,
          first_name,
          last_name,
          email,
          phone,
          side,
          rsvp_status
        ),
        accommodations (
          id,
          name,
          room_type,
          bed_type,
          max_occupancy,
          hotels (
            id,
            name
          )
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to create allocation: ${error.message}`,
        code: 'CREATE_FAILED'
      }, { status: 500 })
    }

    // Update allocated rooms count
    await supabase
      .from('accommodations')
      .update({ allocated_rooms: accommodation.allocated_rooms + 1 })
      .eq('id', validatedData.accommodationId)

    // Transform response to camelCase
    const transformedAllocation = {
      id: allocation.id,
      accommodationId: allocation.accommodation_id,
      guestId: allocation.guest_id,
      roomNumber: allocation.room_number,
      checkInDate: allocation.check_in_date,
      checkInStatus: allocation.check_in_status,
      checkInTime: allocation.check_in_time,
      checkOutDate: allocation.check_out_date,
      checkOutStatus: allocation.check_out_status,
      checkOutTime: allocation.check_out_time,
      specialRequests: allocation.special_requests,
      includesPlusOne: allocation.includes_plus_one,
      includesChildren: allocation.includes_children,
      childrenCount: allocation.children_count,
      additionalGuestsInfo: allocation.additional_guests_info,
      guest: allocation.guests ? {
        id: allocation.guests.id,
        firstName: allocation.guests.first_name,
        lastName: allocation.guests.last_name,
        email: allocation.guests.email,
        phone: allocation.guests.phone,
        side: allocation.guests.side,
        rsvpStatus: allocation.guests.rsvp_status
      } : null,
      accommodation: allocation.accommodations ? {
        id: allocation.accommodations.id,
        name: allocation.accommodations.name,
        roomType: allocation.accommodations.room_type,
        bedType: allocation.accommodations.bed_type,
        maxOccupancy: allocation.accommodations.max_occupancy,
        hotel: allocation.accommodations.hotels ? {
          id: allocation.accommodations.hotels.id,
          name: allocation.accommodations.hotels.name
        } : null
      } : null
    }

    return NextResponse.json({
      success: true,
      data: transformedAllocation,
      message: 'Room allocation created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create allocation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create allocation',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// GET /api/accommodation/allocations - Get allocations for event
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const guestId = searchParams.get('guestId')
    const accommodationId = searchParams.get('accommodationId')

    if (!eventId) {
      return NextResponse.json({
        success: false,
        error: 'Event ID is required',
        code: 'MISSING_EVENT_ID'
      }, { status: 400 })
    }

    const supabase = createClient()

    let query = supabase
      .from('room_allocations')
      .select(`
        *,
        guests (
          id,
          first_name,
          last_name,
          email,
          phone,
          side,
          rsvp_status
        ),
        accommodations (
          id,
          name,
          room_type,
          bed_type,
          max_occupancy,
          event_id,
          hotels (
            id,
            name
          )
        )
      `)

    // Filter by event through accommodation
    query = query.eq('accommodations.event_id', parseInt(eventId))

    // Optional filters
    if (guestId) {
      query = query.eq('guest_id', parseInt(guestId))
    }

    if (accommodationId) {
      query = query.eq('accommodation_id', parseInt(accommodationId))
    }

    query = query.order('id', { ascending: false })

    const { data: allocations, error } = await query

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch allocations: ${error.message}`,
        code: 'QUERY_FAILED'
      }, { status: 500 })
    }

    // Transform database fields to camelCase for frontend
    const transformedAllocations = allocations.map(allocation => ({
      id: allocation.id,
      accommodationId: allocation.accommodation_id,
      guestId: allocation.guest_id,
      roomNumber: allocation.room_number,
      checkInDate: allocation.check_in_date,
      checkInStatus: allocation.check_in_status,
      checkInTime: allocation.check_in_time,
      checkOutDate: allocation.check_out_date,
      checkOutStatus: allocation.check_out_status,
      checkOutTime: allocation.check_out_time,
      specialRequests: allocation.special_requests,
      includesPlusOne: allocation.includes_plus_one,
      includesChildren: allocation.includes_children,
      childrenCount: allocation.children_count,
      additionalGuestsInfo: allocation.additional_guests_info,
      guest: allocation.guests ? {
        id: allocation.guests.id,
        firstName: allocation.guests.first_name,
        lastName: allocation.guests.last_name,
        email: allocation.guests.email,
        phone: allocation.guests.phone,
        side: allocation.guests.side,
        rsvpStatus: allocation.guests.rsvp_status
      } : null,
      accommodation: allocation.accommodations ? {
        id: allocation.accommodations.id,
        name: allocation.accommodations.name,
        roomType: allocation.accommodations.room_type,
        bedType: allocation.accommodations.bed_type,
        maxOccupancy: allocation.accommodations.max_occupancy,
        hotel: allocation.accommodations.hotels ? {
          id: allocation.accommodations.hotels.id,
          name: allocation.accommodations.hotels.name
        } : null
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: transformedAllocations,
      message: 'Allocations retrieved successfully'
    })

  } catch (error) {
    console.error('Get allocations error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch allocations',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}