// 6. Login API (app/api/auth/login/route.ts)
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { phone_number, password } = await request.json()

    // Get user by phone number
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, phone_verified')
      .eq('phone_number', phone_number)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'No account found with this phone number' },
        { status: 404 }
      )
    }

    if (!profile.phone_verified) {
      return NextResponse.json(
        { error: 'Please verify your phone number first' },
        { status: 400 }
      )
    }

    // Get user's email for Supabase auth
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.id)
    
    if (!authUser.user?.email) {
      return NextResponse.json(
        { error: 'Account error. Please contact support.' },
        { status: 400 }
      )
    }

    // Sign in with email and password (internally)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: authUser.user.email,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // For production, you'd want to implement proper session handling
    // For now, return success with user info
    return NextResponse.json({ 
      message: 'Login successful',
      user_id: profile.id,
      // In a real app, return a session token or JWT here
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
