import { NextRequest, NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { getAuthOptions } from '@/lib/auth'
import { authProvider } from '@/lib/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const nextAuthHandler = getAuthOptions() ? NextAuth(getAuthOptions()!) : null

export const GET = authProvider === 'nextauth'
  ? (nextAuthHandler as any).GET
  : async () => NextResponse.json({ success: false, message: 'Not implemented' }, { status: 404 })

export const POST = authProvider === 'nextauth'
  ? (nextAuthHandler as any).POST
  : async (req: NextRequest) => {
      const { email, password } = await req.json()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 401 })
      }
      return NextResponse.json({ success: true, user: data.user })
    }
