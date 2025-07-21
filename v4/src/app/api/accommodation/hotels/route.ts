import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createHotelSchema = z.object({
  eventId: z.number().int().positive(),
  name: z.string().min(1, 'Hotel name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  priceRange: z.string().optional(),
  distanceFromVenue: z.string().optional(),
  amenities: z.string().optional(),
  images: z.string().optional(),
  specialNotes: z.string().optional(),
  bookingInstructions: z.string().optional()
})

const updateHotelSchema = createHotelSchema.partial().omit({ eventId: true })

// POST /api/accommodation/hotels - Create new hotel
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const validatedData = createHotelSchema.parse(body)

    const supabase = createClient()

    // If this is set as default, unset other defaults for this event
    if (validatedData.isDefault) {
      await supabase
        .from('hotels')
        .update({ isDefault: false })
        .eq('event_id', validatedData.eventId)
    }

    // Create hotel
    const { data: hotel, error } = await supabase
      .from('hotels')
      .insert({
        event_id: validatedData.eventId,
        name: validatedData.name,
        address: validatedData.address,
        phone: validatedData.phone,
        website: validatedData.website,
        description: validatedData.description,
        is_default: validatedData.isDefault,
        price_range: validatedData.priceRange,
        distance_from_venue: validatedData.distanceFromVenue,
        amenities: validatedData.amenities,
        images: validatedData.images,
        special_notes: validatedData.specialNotes,
        booking_instructions: validatedData.bookingInstructions
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to create hotel: ${error.message}`,
        code: 'CREATE_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: hotel,
      message: 'Hotel created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create hotel error:', error)
    
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
      error: error instanceof Error ? error.message : 'Failed to create hotel',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// GET /api/accommodation/hotels - Get hotels for event
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

    const { data: hotels, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('event_id', parseInt(eventId))
      .order('is_default', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch hotels: ${error.message}`,
        code: 'QUERY_FAILED'
      }, { status: 500 })
    }

    // Transform database fields to camelCase for frontend
    const transformedHotels = hotels.map(hotel => ({
      id: hotel.id,
      eventId: hotel.event_id,
      name: hotel.name,
      address: hotel.address,
      phone: hotel.phone,
      website: hotel.website,
      description: hotel.description,
      isDefault: hotel.is_default,
      priceRange: hotel.price_range,
      distanceFromVenue: hotel.distance_from_venue,
      amenities: hotel.amenities,
      images: hotel.images,
      specialNotes: hotel.special_notes,
      bookingInstructions: hotel.booking_instructions,
      createdAt: hotel.created_at
    }))

    return NextResponse.json({
      success: true,
      data: transformedHotels,
      message: 'Hotels retrieved successfully'
    })

  } catch (error) {
    console.error('Get hotels error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch hotels',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}