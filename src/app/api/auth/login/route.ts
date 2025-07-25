import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authProvider } from '@/lib/config'

// Initialize Supabase client with environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  if (authProvider !== 'supabase') {
    return NextResponse.json({ success: false, message: 'Not implemented' }, { status: 404 })
  }

  const { email, password } = await req.json()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 })
  }

  return NextResponse.json({ success: true, user: data.user })
}
