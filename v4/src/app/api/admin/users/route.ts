import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  role: z.enum(['admin', 'staff', 'couple'], { required_error: 'Role is required' })
})

const updateUserSchema = createUserSchema.omit({ password: true }).partial().extend({
  username: z.string().min(3).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'staff', 'couple']).optional()
})

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    const supabase = createClient()

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', validatedData.username)
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Username already exists',
        code: 'USERNAME_EXISTS'
      }, { status: 409 })
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingEmail) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists',
        code: 'EMAIL_EXISTS'
      }, { status: 409 })
    }

    // Hash password (in production, use proper password hashing)
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username: validatedData.username,
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        bio: validatedData.bio,
        phone: validatedData.phone,
        company: validatedData.company,
        website: validatedData.website,
        location: validatedData.location,
        role: validatedData.role
      })
      .select('id, username, name, email, bio, phone, company, website, location, role, created_at')
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to create user: ${error.message}`,
        code: 'CREATE_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create user error:', error)
    
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
      error: error instanceof Error ? error.message : 'Failed to create user',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const supabase = createClient()

    let query = supabase
      .from('users')
      .select('id, username, name, email, bio, phone, company, website, location, avatar, last_login, role, created_at')
      .order('created_at', { ascending: false })

    // Apply role filter
    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`)
    }

    const { data: users, error } = await query

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch users: ${error.message}`,
        code: 'QUERY_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// Simple password hashing (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or similar
  // For now, using a simple implementation
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'salt_string')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}