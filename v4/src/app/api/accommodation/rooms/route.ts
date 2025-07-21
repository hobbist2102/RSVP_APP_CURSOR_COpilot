import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createAccommodationSchema = z.object({
  eventId: z.number().int().positive(),
  hotelId: z.number().int().positive().optional().nullable(),
  name: z.string().min(1, 'Room name is required'),
  roomType: z.string().min(1, 'Room type is required'),
  bedType: z.string().optional(),
  maxOccupancy: z.number().int().min(1, 'Max occupancy must be at least 1'),
  totalRooms: z.number().int().min(1, 'Total rooms must be at least 1'),
  pricePerNight: z.string().optional(),
  specialFeatures: z.string().optional(),
  showPricing: z.boolean().default(false)
})

const updateAccommodationSchema = createAccommodationSchema.partial().omit({ eventId: true })

// POST /api/accommodation/rooms - Create new accommodation
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const validatedData = createAccommodationSchema.parse(body)

    const supabase = createClient()

    // Create accommodation
    const { data: accommodation, error } = await supabase
      .from('accommodations')
      .insert({
        event_id: validatedData.eventId,
        hotel_id: validatedData.hotelId,
        name: validatedData.name,
        room_type: validatedData.roomType,
        bed_type: validatedData.bedType,
        max_occupancy: validatedData.maxOccupancy,
        capacity: validatedData.maxOccupancy, // Legacy field
        total_rooms: validatedData.totalRooms,
        allocated_rooms: 0,
        price_per_night: validatedData.pricePerNight,
        special_features: validatedData.specialFeatures,
        show_pricing: validatedData.showPricing
      })
      .select(`
        *,
        hotels (
          id,
          name,
          address,
          phone,
          website
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to create accommodation: ${error.message}`,
        code: 'CREATE_FAILED'
      }, { status: 500 })
    }

    // Transform response to camelCase
    const transformedAccommodation = {
      id: accommodation.id,
      eventId: accommodation.event_id,
      hotelId: accommodation.hotel_id,
      name: accommodation.name,
      roomType: accommodation.room_type,
      bedType: accommodation.bed_type,
      maxOccupancy: accommodation.max_occupancy,
      capacity: accommodation.capacity,
      totalRooms: accommodation.total_rooms,
      allocatedRooms: accommodation.allocated_rooms,
      pricePerNight: accommodation.price_per_night,
      specialFeatures: accommodation.special_features,
      showPricing: accommodation.show_pricing,
      hotel: accommodation.hotels ? {
        id: accommodation.hotels.id,
        name: accommodation.hotels.name,
        address: accommodation.hotels.address,
        phone: accommodation.hotels.phone,
        website: accommodation.hotels.website
      } : null
    }

    return NextResponse.json({
      success: true,
      data: transformedAccommodation,
      message: 'Accommodation created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create accommodation error:', error)
    
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
      error: error instanceof Error ? error.message : 'Failed to create accommodation',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// GET /api/accommodation/rooms - Get accommodations for event
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({
        success: false,
        error: 'Event ID is required',
        code: 'MISSING_EVENT_ID'
      }, { status: 400 })
    }

    const supabase = createClient()

    const { data: accommodations, error } = await supabase
      .from('accommodations')
      .select(`
        *,
        hotels (
          id,
          name,
          address,
          phone,
          website,
          is_default
        )
      `)
      .eq('event_id', parseInt(eventId))
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch accommodations: ${error.message}`,
        code: 'QUERY_FAILED'
      }, { status: 500 })
    }

    // Transform database fields to camelCase for frontend
    const transformedAccommodations = accommodations.map(accommodation => ({
      id: accommodation.id,
      eventId: accommodation.event_id,
      hotelId: accommodation.hotel_id,
      name: accommodation.name,
      roomType: accommodation.room_type,
      bedType: accommodation.bed_type,
      maxOccupancy: accommodation.max_occupancy,
      capacity: accommodation.capacity,
      totalRooms: accommodation.total_rooms,
      allocatedRooms: accommodation.allocated_rooms,
      pricePerNight: accommodation.price_per_night,
      specialFeatures: accommodation.special_features,
      showPricing: accommodation.show_pricing,
      hotel: accommodation.hotels ? {
        id: accommodation.hotels.id,
        name: accommodation.hotels.name,
        address: accommodation.hotels.address,
        phone: accommodation.hotels.phone,
        website: accommodation.hotels.website,
        isDefault: accommodation.hotels.is_default
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: transformedAccommodations,
      message: 'Accommodations retrieved successfully'
    })

  } catch (error) {
    console.error('Get accommodations error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch accommodations',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}