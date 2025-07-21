import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/utils'
import { onboardingService } from '@/lib/services/onboarding'
import { onboardingCompleteSchema, onboardingStepSchemas } from '@/lib/validations/admin'
import { z } from 'zod'

// GET /api/admin/onboarding - Get onboarding status and configuration
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()

    const config = await onboardingService.getAdminConfig(user.id)
    const isComplete = await onboardingService.isOnboardingComplete(user.id)

    return NextResponse.json({
      success: true,
      data: {
        isComplete,
        config
      }
    })
  } catch (error) {
    console.error('Error getting onboarding status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get onboarding status'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/onboarding - Save onboarding step or complete onboarding
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const { step, data, complete = false } = body

    if (complete) {
      // Complete entire onboarding process
      const validatedData = onboardingCompleteSchema.parse(data)
      const result = await onboardingService.completeOnboarding(validatedData, user.id)

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Onboarding completed successfully!'
      })
    } else {
      // Save individual step
      let result
      
      switch (step) {
        case 'emailProvider':
          const emailConfig = onboardingStepSchemas.emailProvider.parse(data)
          await onboardingService.testEmailConfig(emailConfig)
          result = await onboardingService.saveEmailProvider(emailConfig, user.id)
          break

        case 'whatsappConfig':
          const whatsappConfig = onboardingStepSchemas.whatsappConfig.parse(data)
          await onboardingService.testWhatsAppConfig(whatsappConfig)
          result = await onboardingService.saveWhatsAppConfig(whatsappConfig, user.id)
          break

        case 'adminProfile':
          const profileData = onboardingStepSchemas.adminProfile.parse(data)
          result = await onboardingService.updateAdminProfile(profileData, user.id)
          break

        case 'branding':
          const brandingData = onboardingStepSchemas.branding.parse(data)
          result = await onboardingService.saveBranding(brandingData, user.id)
          break

        case 'eventDefaults':
          const defaultsData = onboardingStepSchemas.eventDefaults.parse(data)
          result = await onboardingService.saveEventDefaults(defaultsData, user.id)
          break

        default:
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid onboarding step'
            },
            { status: 400 }
          )
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: `${step} configuration saved successfully!`
      })
    }
  } catch (error) {
    console.error('Error saving onboarding data:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save onboarding data'
      },
      { status: 500 }
    )
  }
}