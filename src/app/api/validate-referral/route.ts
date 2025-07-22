import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { referral_code } = await request.json()

    if (!referral_code || referral_code.length < 6) {
      return NextResponse.json({
        valid: false,
        message: 'Referral code must be at least 6 characters',
        referrer_name: null
      })
    }

    // Check if referral code exists
    const { data: referrer, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, is_active')
      .eq('referral_code', referral_code.toUpperCase())
      .single()

    if (error || !referrer) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid referral code',
        referrer_name: null
      })
    }

    // Check if referrer account is active
    if (!referrer.is_active) {
      return NextResponse.json({
        valid: false,
        message: 'This referral code belongs to an inactive account',
        referrer_name: null
      })
    }

    return NextResponse.json({
      valid: true,
      message: `Valid referral code from ${referrer.full_name}`,
      referrer_name: referrer.full_name,
      referrer_username: referrer.username
    })

  } catch (error) {
    console.error('Referral validation error:', error)
    return NextResponse.json(
      {
        valid: false,
        message: 'Unable to validate referral code',
        referrer_name: null
      },
      { status: 500 }
    )
  }
}