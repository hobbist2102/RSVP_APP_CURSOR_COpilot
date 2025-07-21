import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { guests, events } from '@/lib/db/schema'
import { CreateGuestSchema, UpdateGuestSchema } from '@/lib/validations/schemas'
import { RSVPTokenService } from '@/lib/services/rsvp-tokens'
import { eq, and, like, or, desc, asc } from 'drizzle-orm'
import { z } from 'zod'

const GuestQuerySchema = z.object({
  eventId: z.string().uuid().optional(),
  search: z.string().optional(),
  side: z.enum(['bride', 'groom', 'mutual']).optional(),
  rsvpStatus: z.enum(['pending', 'attending', 'not_attending', 'maybe']).optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('25'),
  sortBy: z.enum(['name', 'email', 'side', 'rsvpStatus', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// GET /api/guests - List guests with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const { eventId, search, side, rsvpStatus, page, limit, sortBy, sortOrder } = 
      GuestQuerySchema.parse(params)

    // Build query conditions
    const conditions = []
    
    if (eventId) {
      conditions.push(eq(guests.event_id, eventId))
    }
    
    if (search) {
      conditions.push(
        or(
          like(guests.first_name, `%${search}%`),
          like(guests.last_name, `%${search}%`),
          like(guests.email, `%${search}%`)
        )
      )
    }
    
    if (side) {
      conditions.push(eq(guests.side, side))
    }
    
    if (rsvpStatus) {
      conditions.push(eq(guests.rsvp_status, rsvpStatus))
    }

    // Calculate offset
    const offset = (page - 1) * limit

    // Build order clause
    const orderColumn = guests[sortBy as keyof typeof guests] || guests.first_name
    const orderBy = sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn)

    // Execute query
    const guestsList = await db.select({
      id: guests.id,
      firstName: guests.first_name,
      lastName: guests.last_name,
      email: guests.email,
      phone: guests.phone,
      side: guests.side,
      relationship: guests.relationship,
      rsvpStatus: guests.rsvp_status,
      plusOneAllowed: guests.plus_one_allowed,
      dietaryRestrictions: guests.dietary_restrictions,
      specialRequests: guests.special_requests,
      address: guests.address,
      createdAt: guests.created_at,
      updatedAt: guests.updated_at
    })
    .from(guests)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)

    // Get total count for pagination
    const totalResult = await db.select({ count: guests.id })
      .from(guests)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    
    const total = totalResult.length
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        guests: guestsList,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Guest list error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve guests'
    }, { status: 500 })
  }
}

// POST /api/guests - Create new guest
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const guestData = CreateGuestSchema.parse(body)

    // Verify event exists and user has access
    const event = await db.select()
      .from(events)
      .where(eq(events.id, guestData.eventId))
      .limit(1)

    if (event.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 })
    }

    // Check for duplicate email within the event
    const existingGuest = await db.select()
      .from(guests)
      .where(and(
        eq(guests.event_id, guestData.eventId),
        eq(guests.email, guestData.email)
      ))
      .limit(1)

    if (existingGuest.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Guest with this email already exists for this event'
      }, { status: 409 })
    }

    // Create guest
    const newGuest = await db.insert(guests).values({
      event_id: guestData.eventId,
      first_name: guestData.firstName,
      last_name: guestData.lastName,
      email: guestData.email,
      phone: guestData.phone,
      side: guestData.side,
      relationship: guestData.relationship,
      plus_one_allowed: guestData.plusOneAllowed || false,
      dietary_restrictions: guestData.dietaryRestrictions,
      special_requests: guestData.specialRequests,
      address: guestData.address,
      rsvp_status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    }).returning()

    // Generate RSVP token
    const token = await RSVPTokenService.generateToken(newGuest[0].id)
    const rsvpUrl = RSVPTokenService.generateRSVPUrl(token)

    return NextResponse.json({
      success: true,
      data: {
        guest: newGuest[0],
        rsvpToken: token,
        rsvpUrl: rsvpUrl
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Guest creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid guest data',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create guest'
    }, { status: 500 })
  }
}