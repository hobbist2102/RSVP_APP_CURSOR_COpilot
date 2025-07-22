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
    let orderBy
    switch (sortBy) {
      case 'email':
        orderBy = sortOrder === 'desc' ? desc(guests.email) : asc(guests.email)
        break
      case 'side':
        orderBy = sortOrder === 'desc' ? desc(guests.side) : asc(guests.side)
        break
      case 'rsvpStatus':
        orderBy = sortOrder === 'desc' ? desc(guests.rsvp_status) : asc(guests.rsvp_status)
        break
      case 'createdAt':
        orderBy = sortOrder === 'desc' ? desc(guests.created_at) : asc(guests.created_at)
        break
      case 'name':
      default:
        orderBy = sortOrder === 'desc' ? desc(guests.first_name) : asc(guests.first_name)
        break
    }

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
      dietaryRequirements: guests.dietary_requirements,
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
    const validatedData = CreateGuestSchema.parse(body)

    // Insert guest
    const [newGuest] = await db.insert(guests).values({
      event_id: validatedData.eventId,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      side: validatedData.side,
      relationship: validatedData.relationship,
      plus_one_allowed: validatedData.plusOneAllowed,
      dietary_requirements: validatedData.dietaryRequirements,
      special_requests: validatedData.specialRequests,
      address: validatedData.address,
      created_at: new Date(),
      updated_at: new Date()
    }).returning()

    // Generate RSVP token
    const rsvpToken = await RSVPTokenService.generateToken(newGuest.id)

    return NextResponse.json({
      success: true,
      data: {
        guest: {
          id: newGuest.id,
          firstName: newGuest.first_name,
          lastName: newGuest.last_name,
          email: newGuest.email,
          phone: newGuest.phone,
          side: newGuest.side,
          relationship: newGuest.relationship,
          rsvpStatus: newGuest.rsvp_status,
          plusOneAllowed: newGuest.plus_one_allowed,
          dietaryRequirements: newGuest.dietary_requirements,
          specialRequests: newGuest.special_requests,
          address: newGuest.address,
          createdAt: newGuest.created_at,
          updatedAt: newGuest.updated_at
        },
        rsvpToken: rsvpToken,
        rsvpUrl: `${process.env.NEXTAUTH_URL}/rsvp/${rsvpToken}`
      }
    })

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