// 9. Confirm Payment API (app/api/activation/confirm/route.ts)
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { payment_reference } = await request.json()

    // Get payment details
    const { data: payment } = await supabaseAdmin
      .from('activation_payments')
      .select('user_id')
      .eq('payment_reference', payment_reference)
      .single()

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update payment status
    await supabaseAdmin
      .from('activation_payments')
      .update({
        status: 'completed',
        paid_at: new Date().toISOString()
      })
      .eq('payment_reference', payment_reference)

    // Activate user account
    await supabaseAdmin
      .from('profiles')
      .update({
        is_active: true,
        activation_paid_at: new Date().toISOString()
      })
      .eq('id', payment.user_id)

    // Process referral rewards
    await processReferralRewards(payment.user_id)

    return NextResponse.json({ message: 'Account activated successfully' })

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}

async function processReferralRewards(userId: string) {
  // Get referral hierarchy
  const { data: referrals } = await supabaseAdmin
    .from('referral_hierarchy')
    .select('referrer_id, level')
    .eq('user_id', userId)

  if (!referrals) return

  const rewards = [300, 100, 50] // KSH for levels 1, 2, 3

  // Create reward records
  const rewardData = referrals.map(ref => ({
    referrer_id: ref.referrer_id,
    referred_user_id: userId,
    level: ref.level,
    amount: rewards[ref.level - 1]
  }))

  await supabaseAdmin
    .from('referral_rewards')
    .insert(rewardData)

  // Mark referral hierarchy as active
  await supabaseAdmin
    .from('referral_hierarchy')
    .update({ is_active: true })
    .eq('user_id', userId)

  // Update referrer balances and membership levels
  for (const referral of referrals) {
    await updateReferrerBalance(referral.referrer_id, rewards[referral.level - 1])
    
    if (referral.level === 1) {
      await updateMembershipLevel(referral.referrer_id)
    }
  }
}

async function updateReferrerBalance(referrerId: string, amount: number) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('available_balance, total_earnings')
    .eq('id', referrerId)
    .single()

  if (profile) {
    await supabaseAdmin
      .from('profiles')
      .update({
        available_balance: profile.available_balance + amount,
        total_earnings: profile.total_earnings + amount
      })
      .eq('id', referrerId)
  }
}

async function updateMembershipLevel(referrerId: string) {
  // Count active direct referrals
  const { data: activeReferrals } = await supabaseAdmin
    .from('referral_hierarchy')
    .select('id')
    .eq('referrer_id', referrerId)
    .eq('level', 1)
    .eq('is_active', true)

  const activeCount = activeReferrals?.length || 0
  
  let membershipLevel = 'inactive'
  if (activeCount >= 30) membershipLevel = 'gold'
  else if (activeCount >= 20) membershipLevel = 'bronze'
  else if (activeCount >= 10) membershipLevel = 'silver'

  await supabaseAdmin
    .from('profiles')
    .update({
      active_direct_referrals: activeCount,
      membership_level: membershipLevel
    })
    .eq('id', referrerId)
}
