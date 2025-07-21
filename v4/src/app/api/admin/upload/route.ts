import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/utils'
import { onboardingService } from '@/lib/services/onboarding'

// POST /api/admin/upload - Upload branding assets (logo, banner)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'logo' or 'banner'

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided'
        },
        { status: 400 }
      )
    }

    if (!type || !['logo', 'banner'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Must be "logo" or "banner"'
        },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file format. Please upload JPG, PNG, WebP, or SVG files.'
        },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'File too large. Maximum size is 5MB.'
        },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `branding/${type}/${timestamp}.${extension}`

    // Upload to Supabase Storage
    const publicUrl = await onboardingService.uploadFile(file, 'assets', filename)

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        type,
        filename
      },
      message: `${type} uploaded successfully!`
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file'
      },
      { status: 500 }
    )
  }
}