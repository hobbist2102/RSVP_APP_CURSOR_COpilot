import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { createEmailService } from '@/lib/services/EmailService'
import { z } from 'zod'

const sendEmailSchema = z.object({
  eventId: z.number().min(1),
  recipients: z.array(z.object({
    to: z.string().email(),
    guestId: z.number().optional(),
    customData: z.record(z.any()).optional()
  })).min(1),
  template: z.object({
    subject: z.string().min(1),
    content: z.string().min(1),
    isHtml: z.boolean().default(true),
    templateId: z.number().optional()
  }),
  scheduleFor: z.string().datetime().optional(), // For future scheduling
  priority: z.enum(['low', 'normal', 'high']).default('normal')
})

const singleEmailSchema = z.object({
  eventId: z.number().min(1),
  to: z.string().email(),
  subject: z.string().min(1),
  content: z.string().min(1),
  isHtml: z.boolean().default(true),
  guestId: z.number().optional(),
  templateId: z.number().optional(),
  metadata: z.record(z.any()).optional()
})

const templateVariableSchema = z.object({
  eventId: z.number().min(1),
  templateId: z.number().min(1),
  guestId: z.number().min(1)
})

// POST /api/communication/email - Send email(s)
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
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use send-bulk, send-single, or preview',
        code: 'INVALID_ACTION'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Email API error:', error)
    
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
      error: error instanceof Error ? error.message : 'Failed to process email request',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

async function handleBulkSend(body: any) {
  const validatedData = sendEmailSchema.parse(body)
  
  const emailService = await createEmailService(validatedData.eventId)
  
  // Process template variables for each recipient
  const processedRecipients = await Promise.all(
    validatedData.recipients.map(async (recipient) => {
      let processedSubject = validatedData.template.subject
      let processedContent = validatedData.template.content
      
      if (recipient.guestId) {
        const variables = await getGuestVariables(validatedData.eventId, recipient.guestId)
        processedSubject = replaceVariables(processedSubject, variables)
        processedContent = replaceVariables(processedContent, variables)
      }
      
      return {
        ...recipient,
        processedSubject,
        processedContent
      }
    })
  )

  // Send emails
  const results = await emailService.sendBulkEmails(
    processedRecipients.map(r => ({
      to: r.to,
      guestId: r.guestId,
      customData: r.customData
    })),
    {
      subject: '', // Will be overridden per recipient
      content: '', // Will be overridden per recipient
      isHtml: validatedData.template.isHtml,
      templateId: validatedData.template.templateId
    }
  )

  // Override subject/content per recipient
  for (let i = 0; i < results.length; i++) {
    const emailData = {
      to: processedRecipients[i].to,
      subject: processedRecipients[i].processedSubject,
      content: processedRecipients[i].processedContent,
      isHtml: validatedData.template.isHtml,
      guestId: processedRecipients[i].guestId,
      eventId: validatedData.eventId,
      templateId: validatedData.template.templateId,
      metadata: processedRecipients[i].customData
    }
    
    // Send individual email with processed content
    const emailService = await createEmailService(validatedData.eventId)
    results[i] = {
      ...await emailService.sendEmail(emailData),
      recipient: processedRecipients[i].to,
      guestId: processedRecipients[i].guestId
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
    message: `Email sending completed: ${successCount} successful, ${failureCount} failed`
  })
}

async function handleSingleSend(body: any) {
  const validatedData = singleEmailSchema.parse(body)
  
  const emailService = await createEmailService(validatedData.eventId)
  
  // Process template variables if guest ID provided
  let processedSubject = validatedData.subject
  let processedContent = validatedData.content
  
  if (validatedData.guestId) {
    const variables = await getGuestVariables(validatedData.eventId, validatedData.guestId)
    processedSubject = replaceVariables(processedSubject, variables)
    processedContent = replaceVariables(processedContent, variables)
  }

  const result = await emailService.sendEmail({
    to: validatedData.to,
    subject: processedSubject,
    content: processedContent,
    isHtml: validatedData.isHtml,
    guestId: validatedData.guestId,
    eventId: validatedData.eventId,
    templateId: validatedData.templateId,
    metadata: validatedData.metadata
  })

  return NextResponse.json({
    success: result.success,
    data: result,
    message: result.success ? 'Email sent successfully' : 'Email sending failed'
  })
}

async function handlePreview(body: any) {
  const validatedData = templateVariableSchema.parse(body)
  
  const supabase = createClient()
  
  // Get template
  const { data: template, error: templateError } = await supabase
    .from('communication_templates')
    .select('subject, content')
    .eq('id', validatedData.templateId)
    .eq('event_id', validatedData.eventId)
    .single()

  if (templateError || !template) {
    return NextResponse.json({
      success: false,
      error: 'Template not found',
      code: 'NOT_FOUND'
    }, { status: 404 })
  }

  // Get guest variables
  const variables = await getGuestVariables(validatedData.eventId, validatedData.guestId)
  
  // Process template
  const processedSubject = replaceVariables(template.subject || '', variables)
  const processedContent = replaceVariables(template.content, variables)

  return NextResponse.json({
    success: true,
    data: {
      subject: processedSubject,
      content: processedContent,
      variables
    },
    message: 'Template preview generated successfully'
  })
}

// GET /api/communication/email - Get email status and logs
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const guestId = searchParams.get('guestId')
    const messageId = searchParams.get('messageId')
    const action = searchParams.get('action') || 'logs'

    if (!eventId) {
      return NextResponse.json({
        success: false,
        error: 'Event ID is required',
        code: 'MISSING_REQUIRED_FIELD'
      }, { status: 400 })
    }

    const supabase = createClient()

    if (action === 'status' && messageId) {
      const emailService = await createEmailService(parseInt(eventId))
      const status = await emailService.getDeliveryStatus(messageId)
      
      return NextResponse.json({
        success: true,
        data: status,
        message: 'Delivery status retrieved'
      })
    }

    if (action === 'providers') {
      const emailService = await createEmailService(parseInt(eventId))
      const providers = await emailService.getAvailableProviders()
      
      return NextResponse.json({
        success: true,
        data: providers,
        message: 'Available providers retrieved'
      })
    }

    // Get communication logs
    let query = supabase
      .from('communication_logs')
      .select(`
        *,
        guests (
          id,
          first_name,
          last_name,
          email
        ),
        communication_templates (
          id,
          name
        )
      `)
      .eq('event_id', parseInt(eventId))
      .eq('channel', 'email')
      .order('created_at', { ascending: false })

    if (guestId) {
      query = query.eq('guest_id', parseInt(guestId))
    }

    const { data: logs, error } = await query.limit(100)

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch email logs: ${error.message}`,
        code: 'QUERY_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: logs,
      message: 'Email logs retrieved successfully'
    })

  } catch (error) {
    console.error('Email GET API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch email data',
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
    guestEmail: guest.email || '',
    guestPhone: guest.phone || '',
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