import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string()
    })
  }),
  eventId: z.number().int().positive().optional(),
  topics: z.array(z.string()).optional().default(['rsvp', 'general'])
})

const unsubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url()
  })
})

// POST /api/push/subscribe - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const body = await request.json()
    const validatedData = subscribeSchema.parse(body)

    const supabase = createClient()

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', validatedData.subscription.endpoint)
      .eq('user_id', user.id)
      .single()

    if (existingSubscription) {
      // Update existing subscription
      const { data: updatedSubscription, error } = await supabase
        .from('push_subscriptions')
        .update({
          p256dh_key: validatedData.subscription.keys.p256dh,
          auth_key: validatedData.subscription.keys.auth,
          topics: validatedData.topics,
          event_id: validatedData.eventId,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)
        .select('*')
        .single()

      if (error) {
        return NextResponse.json({
          success: false,
          error: `Failed to update subscription: ${error.message}`,
          code: 'UPDATE_FAILED'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: updatedSubscription,
        message: 'Push subscription updated successfully'
      })
    } else {
      // Create new subscription
      const { data: newSubscription, error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          event_id: validatedData.eventId,
          endpoint: validatedData.subscription.endpoint,
          p256dh_key: validatedData.subscription.keys.p256dh,
          auth_key: validatedData.subscription.keys.auth,
          topics: validatedData.topics,
          is_active: true
        })
        .select('*')
        .single()

      if (error) {
        return NextResponse.json({
          success: false,
          error: `Failed to create subscription: ${error.message}`,
          code: 'CREATE_FAILED'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: newSubscription,
        message: 'Push subscription created successfully'
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Push subscribe error:', error)
    
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
      error: error instanceof Error ? error.message : 'Failed to manage subscription',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// DELETE /api/push/subscribe - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const body = await request.json()
    const validatedData = unsubscribeSchema.parse(body)

    const supabase = createClient()

    // Deactivate subscription instead of deleting for audit purposes
    const { data: subscription, error } = await supabase
      .from('push_subscriptions')
      .update({ 
        is_active: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('endpoint', validatedData.subscription.endpoint)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to unsubscribe: ${error.message}`,
        code: 'UNSUBSCRIBE_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: subscription,
      message: 'Successfully unsubscribed from push notifications'
    })

  } catch (error) {
    console.error('Push unsubscribe error:', error)
    
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
      error: error instanceof Error ? error.message : 'Failed to unsubscribe',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// GET /api/push/subscribe - Get user's subscription status
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    const supabase = createClient()

    let query = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', parseInt(eventId))
    }

    const { data: subscriptions, error } = await query

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch subscriptions: ${error.message}`,
        code: 'QUERY_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: subscriptions,
      message: 'Subscriptions retrieved successfully'
    })

  } catch (error) {
    console.error('Get subscriptions error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch subscriptions',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}