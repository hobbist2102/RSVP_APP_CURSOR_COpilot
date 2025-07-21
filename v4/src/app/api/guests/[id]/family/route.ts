import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { familyRelationshipSchema } from '@/lib/validations/guests'
import { z } from 'zod'

// GET /api/guests/[id]/family - Get family relationships for a guest
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    
    const guestId = parseInt(params.id)
    if (isNaN(guestId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid guest ID',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify guest exists and user has access (RLS will handle this)
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, first_name, last_name, event_id')
      .eq('id', guestId)
      .single()

    if (guestError || !guest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest not found or access denied',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Get family relationships where this guest is the primary or related guest
    const { data: relationships, error: relationshipsError } = await supabase
      .from('family_relationships')
      .select(`
        *,
        primary_guest:guests!family_relationships_primary_guest_id_fkey (
          id,
          first_name,
          last_name,
          email,
          side
        ),
        related_guest:guests!family_relationships_related_guest_id_fkey (
          id,
          first_name,
          last_name,
          email,
          side
        )
      `)
      .or(`primary_guest_id.eq.${guestId},related_guest_id.eq.${guestId}`)

    if (relationshipsError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to get family relationships: ${relationshipsError.message}`,
          code: 'QUERY_FAILED'
        },
        { status: 500 }
      )
    }

    // Transform relationships to show them from the perspective of the requested guest
    const familyMembers = (relationships || []).map(rel => {
      const isPrimary = rel.primary_guest_id === guestId
      const relatedGuest = isPrimary ? rel.related_guest : rel.primary_guest
      
      return {
        id: rel.id,
        relationshipId: rel.id,
        guest: relatedGuest,
        relationship: rel.relationship,
        description: rel.description,
        isPrimary: isPrimary,
        createdAt: rel.created_at
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        guest: {
          id: guest.id,
          firstName: guest.first_name,
          lastName: guest.last_name,
          eventId: guest.event_id
        },
        familyMembers,
        total: familyMembers.length
      }
    })

  } catch (error) {
    console.error('Error getting family relationships:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get family relationships',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// POST /api/guests/[id]/family - Add family relationship
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    
    const guestId = parseInt(params.id)
    if (isNaN(guestId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid guest ID',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input - ensure primaryGuestId matches the URL parameter
    const validatedData = familyRelationshipSchema.parse({
      ...body,
      primaryGuestId: guestId
    })

    const supabase = createClient()

    // Verify both guests exist and belong to same event
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('id, event_id, first_name, last_name')
      .in('id', [validatedData.primaryGuestId, validatedData.relatedGuestId])

    if (guestsError || !guests || guests.length !== 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'One or both guests not found or access denied',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Check if guests belong to same event
    const eventIds = [...new Set(guests.map(g => g.event_id))]
    if (eventIds.length > 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guests must belong to the same event',
          code: 'INVALID_RELATIONSHIP'
        },
        { status: 400 }
      )
    }

    // Check if relationship already exists
    const { data: existingRelationship } = await supabase
      .from('family_relationships')
      .select('id')
      .or(`and(primary_guest_id.eq.${validatedData.primaryGuestId},related_guest_id.eq.${validatedData.relatedGuestId}),and(primary_guest_id.eq.${validatedData.relatedGuestId},related_guest_id.eq.${validatedData.primaryGuestId})`)
      .maybeSingle()

    if (existingRelationship) {
      return NextResponse.json(
        {
          success: false,
          error: 'Relationship already exists between these guests',
          code: 'RELATIONSHIP_EXISTS'
        },
        { status: 409 }
      )
    }

    // Create the family relationship
    const { data: relationship, error: createError } = await supabase
      .from('family_relationships')
      .insert({
        primary_guest_id: validatedData.primaryGuestId,
        related_guest_id: validatedData.relatedGuestId,
        relationship: validatedData.relationship,
        description: validatedData.description
      })
      .select(`
        *,
        primary_guest:guests!family_relationships_primary_guest_id_fkey (
          id,
          first_name,
          last_name,
          email,
          side
        ),
        related_guest:guests!family_relationships_related_guest_id_fkey (
          id,
          first_name,
          last_name,
          email,
          side
        )
      `)
      .single()

    if (createError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create family relationship: ${createError.message}`,
          code: 'CREATE_FAILED'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: relationship,
      message: 'Family relationship created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating family relationship:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to create family relationship',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/guests/[id]/family - Remove family relationship
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    
    const guestId = parseInt(params.id)
    if (isNaN(guestId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid guest ID',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const relationshipId = searchParams.get('relationshipId')
    
    if (!relationshipId || isNaN(parseInt(relationshipId))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid relationship ID is required',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify relationship exists and involves the specified guest
    const { data: relationship, error: relationshipError } = await supabase
      .from('family_relationships')
      .select('*')
      .eq('id', parseInt(relationshipId))
      .or(`primary_guest_id.eq.${guestId},related_guest_id.eq.${guestId}`)
      .single()

    if (relationshipError || !relationship) {
      return NextResponse.json(
        {
          success: false,
          error: 'Family relationship not found or access denied',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Delete the relationship
    const { error: deleteError } = await supabase
      .from('family_relationships')
      .delete()
      .eq('id', parseInt(relationshipId))

    if (deleteError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to delete family relationship: ${deleteError.message}`,
          code: 'DELETE_FAILED'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Family relationship deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting family relationship:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete family relationship',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}