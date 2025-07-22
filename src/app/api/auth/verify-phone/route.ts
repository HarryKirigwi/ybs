// 7. Phone Verification API (app/api/auth/verify-phone/route.ts)
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { action, phone_number, code } = await request.json()

    if (action === 'send') {
      // Generate 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Store verification code
      await supabaseAdmin
        .from('phone_verification')
        .insert({
          phone_number,
          code: verificationCode,
          expires_at: expiresAt.toISOString()
        })

      // In production, send SMS here
      console.log(`SMS to ${phone_number}: Your verification code is ${verificationCode}`)

      return NextResponse.json({ 
        message: 'Verification code sent',
        // For development only - remove in production
        code: verificationCode
      })
    }

    if (action === 'verify') {
      // Check verification code
      const { data: verification } = await supabaseAdmin
        .from('phone_verification')
        .select('*')
        .eq('phone_number', phone_number)
        .eq('code', code)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!verification) {
        return NextResponse.json(
          { error: 'Invalid or expired verification code' },
          { status: 400 }
        )
      }

      // Mark as verified
      await supabaseAdmin
        .from('phone_verification')
        .update({ verified: true })
        .eq('id', verification.id)

      // Update profile
      await supabaseAdmin
        .from('profiles')
        .update({ phone_verified: true })
        .eq('phone_number', phone_number)

      return NextResponse.json({ message: 'Phone verified successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}