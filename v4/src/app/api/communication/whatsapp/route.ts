import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { createWhatsAppService } from '@/lib/services/WhatsAppService'
import { z } from 'zod'

const sendWhatsAppSchema = z.object({
  eventId: z.number().min(1),
  recipients: z.array(z.object({
    to: z.string().min(1), // Phone number with country code
    guestId: z.number().optional(),
    customData: z.record(z.any()).optional()
  })).min(1),
  template: z.object({
    message: z.string().min(1),
    mediaUrl: z.string().url().optional(),
    mediaCaption: z.string().optional(),
    templateId: z.number().optional()
  }),
  scheduleFor: z.string().datetime().optional(), // For future scheduling
  priority: z.enum(['low', 'normal', 'high']).default('normal')
})

const singleWhatsAppSchema = z.object({
  eventId: z.number().min(1),
  to: z.string().min(1),
  message: z.string().min(1),
  mediaUrl: z.string().url().optional(),
  mediaCaption: z.string().optional(),
  guestId: z.number().optional(),
  templateId: z.number().optional(),
  metadata: z.record(z.any()).optional()
})

const templateVariableSchema = z.object({
  eventId: z.number().min(1),
  templateId: z.number().min(1),
  guestId: z.number().min(1)
})

// POST /api/communication/whatsapp - Send WhatsApp message(s)
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'send'

    if (action === 'send-bulk') {
      return await handleBulkSend(body)
    } else if (action === 'send-single') {
      return await handleSingleSend(body)
    } else if (action === 'preview') {
      return await handlePreview(body)
    } else if (action === 'test-connection') {
      return await handleTestConnection(body)
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use send-bulk, send-single, preview, or test-connection',
        code: 'INVALID_ACTION'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('WhatsApp API error:', error)
    
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
      error: error instanceof Error ? error.message : 'Failed to process WhatsApp request',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

async function handleBulkSend(body: any) {
  const validatedData = sendWhatsAppSchema.parse(body)
  
  const whatsappService = await createWhatsAppService(validatedData.eventId)
  
  // Process template variables for each recipient
  const processedRecipients = await Promise.all(
    validatedData.recipients.map(async (recipient) => {
      let processedMessage = validatedData.template.message
      let processedCaption = validatedData.template.mediaCaption
      
      if (recipient.guestId) {
        const variables = await getGuestVariables(validatedData.eventId, recipient.guestId)
        processedMessage = replaceVariables(processedMessage, variables)
        if (processedCaption) {
          processedCaption = replaceVariables(processedCaption, variables)
        }
      }
      
      return {
        ...recipient,
        processedMessage,
        processedCaption
      }
    })
  )

  // Send messages individually with personalized content
  const results = []
  for (const recipient of processedRecipients) {
    const messageData = {
      to: recipient.to,
      message: recipient.processedMessage,
      mediaUrl: validatedData.template.mediaUrl,
      mediaCaption: recipient.processedCaption,
      templateId: validatedData.template.templateId,
      guestId: recipient.guestId,
      eventId: validatedData.eventId,
      metadata: recipient.customData
    }
    
    const result = await whatsappService.sendMessage(messageData)
    results.push({
      ...result,
      recipient: recipient.to,
      guestId: recipient.guestId
    })

    // Rate limiting - WhatsApp has strict limits
    if (results.length < processedRecipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second delay
    }
  }

  const successCount = results.filter(r => r.success).length
  const failureCount = results.length - successCount

  return NextResponse.json({
    success: successCount > 0,
    data: {
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
        successRate: Math.round((successCount / results.length) * 100)
      }
    },
    message: `WhatsApp sending completed: ${successCount} successful, ${failureCount} failed`
  })
}

async function handleSingleSend(body: any) {
  const validatedData = singleWhatsAppSchema.parse(body)
  
  const whatsappService = await createWhatsAppService(validatedData.eventId)
  
  // Process template variables if guest ID provided
  let processedMessage = validatedData.message
  let processedCaption = validatedData.mediaCaption
  
  if (validatedData.guestId) {
    const variables = await getGuestVariables(validatedData.eventId, validatedData.guestId)
    processedMessage = replaceVariables(processedMessage, variables)
    if (processedCaption) {
      processedCaption = replaceVariables(processedCaption, variables)
    }
  }

  const result = await whatsappService.sendMessage({
    to: validatedData.to,
    message: processedMessage,
    mediaUrl: validatedData.mediaUrl,
    mediaCaption: processedCaption,
    guestId: validatedData.guestId,
    eventId: validatedData.eventId,
    templateId: validatedData.templateId,
    metadata: validatedData.metadata
  })

  return NextResponse.json({
    success: result.success,
    data: result,
    message: result.success ? 'WhatsApp message sent successfully' : 'WhatsApp message sending failed'
  })
}

async function handlePreview(body: any) {
  const validatedData = templateVariableSchema.parse(body)
  
  const supabase = createClient()
  
  // Get template
  const { data: template, error: templateError } = await supabase
    .from('communication_templates')
    .select('content, variables')
    .eq('id', validatedData.templateId)
    .eq('event_id', validatedData.eventId)
    .eq('channel', 'whatsapp')
    .single()

  if (templateError || !template) {
    return NextResponse.json({
      success: false,
      error: 'WhatsApp template not found',
      code: 'NOT_FOUND'
    }, { status: 404 })
  }

  // Get guest variables
  const variables = await getGuestVariables(validatedData.eventId, validatedData.guestId)
  
  // Process template
  const processedMessage = replaceVariables(template.content, variables)

  return NextResponse.json({
    success: true,
    data: {
      message: processedMessage,
      variables
    },
    message: 'WhatsApp template preview generated successfully'
  })
}

async function handleTestConnection(body: any) {
  const { eventId } = body
  
  if (!eventId) {
    return NextResponse.json({
      success: false,
      error: 'Event ID is required',
      code: 'MISSING_REQUIRED_FIELD'
    }, { status: 400 })
  }

  const whatsappService = await createWhatsAppService(eventId)
  const connectionStatus = await whatsappService.getConnectionStatus()
  
  return NextResponse.json({
    success: true,
    data: connectionStatus,
    message: 'WhatsApp connection status retrieved'
  })
}

// GET /api/communication/whatsapp - Get WhatsApp status, logs, and QR code
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const guestId = searchParams.get('guestId')
    const action = searchParams.get('action') || 'logs'

    if (!eventId) {
      return NextResponse.json({
        success: false,
        error: 'Event ID is required',
        code: 'MISSING_REQUIRED_FIELD'
      }, { status: 400 })
    }

    const supabase = createClient()
    const whatsappService = await createWhatsAppService(parseInt(eventId))

    if (action === 'qr-code') {
      const qrCode = await whatsappService.getQRCode()
      
      return NextResponse.json({
        success: true,
        data: { qrCode },
        message: qrCode ? 'QR code retrieved' : 'No QR code available'
      })
    }

    if (action === 'connection-status') {
      const connectionStatus = await whatsappService.getConnectionStatus()
      
      return NextResponse.json({
        success: true,
        data: connectionStatus,
        message: 'Connection status retrieved'
      })
    }

    if (action === 'providers') {
      const providers = await whatsappService.getAvailableProviders()
      
      return NextResponse.json({
        success: true,
        data: providers,
        message: 'Available providers retrieved'
      })
    }

    // Get WhatsApp communication logs
    let query = supabase
      .from('communication_logs')
      .select(`
        *,
        guests (
          id,
          first_name,
          last_name,
          phone,
          whatsapp_number
        ),
        communication_templates (
          id,
          name
        )
      `)
      .eq('event_id', parseInt(eventId))
      .eq('channel', 'whatsapp')
      .order('created_at', { ascending: false })

    if (guestId) {
      query = query.eq('guest_id', parseInt(guestId))
    }

    const { data: logs, error } = await query.limit(100)

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch WhatsApp logs: ${error.message}`,
        code: 'QUERY_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: logs,
      message: 'WhatsApp logs retrieved successfully'
    })

  } catch (error) {
    console.error('WhatsApp GET API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch WhatsApp data',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// Helper function to get guest variables for template processing
async function getGuestVariables(eventId: number, guestId: number) {
  const supabase = createClient()
  
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
        rsvp_deadline
      )
    `)
    .eq('id', guestId)
    .eq('event_id', eventId)
    .single()

  if (guestError || !guest) {
    throw new Error('Guest not found')
  }

  const event = guest.wedding_events

  return {
    // Guest variables
    guestFirstName: guest.first_name,
    guestLastName: guest.last_name,
    guestFullName: `${guest.first_name} ${guest.last_name}`,
    guestPhone: guest.phone || '',
    guestWhatsApp: guest.whatsapp_number || guest.phone || '',
    guestSide: guest.side,
    guestRelationship: guest.relationship || '',
    
    // Plus one variables
    plusOneName: guest.plus_one_name || '',
    plusOneAllowed: guest.plus_one_allowed ? 'Yes' : 'No',
    
    // Event variables
    eventTitle: event.title,
    coupleNames: event.couple_names,
    brideName: event.bride_name,
    groomName: event.groom_name,
    eventLocation: event.location,
    eventStartDate: event.start_date ? new Date(event.start_date).toLocaleDateString() : '',
    eventEndDate: event.end_date ? new Date(event.end_date).toLocaleDateString() : '',
    rsvpDeadline: event.rsvp_deadline ? new Date(event.rsvp_deadline).toLocaleDateString() : '',
    
    // RSVP variables
    rsvpStatus: guest.rsvp_status,
    rsvpToken: guest.rsvp_token || '',
    rsvpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${guest.rsvp_token}`,
    
    // Current date
    currentDate: new Date().toLocaleDateString(),
    currentYear: new Date().getFullYear().toString()
  }
}

// Helper function to replace template variables
function replaceVariables(template: string, variables: Record<string, string>): string {
  let processed = template
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    processed = processed.replace(regex, value)
  })
  
  return processed
}