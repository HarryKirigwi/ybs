// 5. Registration API (app/api/auth/register/route.ts)
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { phone_number, email, password, full_name, username, referral_code } = await request.json()

    // Check if phone number already exists
    const { data: existingPhone } = await supabaseAdmin
      .from('profiles')
      .select('phone_number')
      .eq('phone_number', phone_number)
      .single()

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const { data: existingUsername } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }

    // Register user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone: phone_number,
      user_metadata: {
        full_name,
        username,
        phone_number
      },
      email_confirm: false,
      phone_confirm: false
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update profile with referral info
    if (referral_code) {
      const { data: referrer } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('referral_code', referral_code)
        .single()

      if (referrer) {
        await supabaseAdmin
          .from('profiles')
          .update({ referred_by: referrer.id })
          .eq('id', data.user.id)

        // Create referral hierarchy
        await createReferralHierarchy(data.user.id, referrer.id)
      }
    }

    return NextResponse.json({ 
      message: 'Registration successful',
      user_id: data.user.id
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}

async function createReferralHierarchy(userId: string, referrerId: string) {
  // Create level 1 referral
  await supabaseAdmin
    .from('referral_hierarchy')
    .insert({
      user_id: userId,
      referrer_id: referrerId,
      level: 1
    })

  // Get referrer's referrer for level 2
  const { data: level2 } = await supabaseAdmin
    .from('profiles')
    .select('referred_by')
    .eq('id', referrerId)
    .single()

  if (level2?.referred_by) {
    await supabaseAdmin
      .from('referral_hierarchy')
      .insert({
        user_id: userId,
        referrer_id: level2.referred_by,
        level: 2
      })

    // Get level 2's referrer for level 3
    const { data: level3 } = await supabaseAdmin
      .from('profiles')
      .select('referred_by')
      .eq('id', level2.referred_by)
      .single()

    if (level3?.referred_by) {
      await supabaseAdmin
        .from('referral_hierarchy')
        .insert({
          user_id: userId,
          referrer_id: level3.referred_by,
          level: 3
        })
    }
  }
}
