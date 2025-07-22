// app/api/referrals/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Use the secure function to get comprehensive referral stats
    const { data: userStats, error: statsError } = await supabaseAdmin
      .rpc('get_user_referral_stats', { user_uuid: userId })

    if (statsError) {
      console.error('Function error:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch user stats' },
        { status: 500 }
      )
    }

    const stats = userStats?.[0] // Function returns array, get first (and only) result

    if (!stats) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get detailed referral rewards for breakdown
    const { data: rewards } = await supabaseAdmin
      .from('referral_rewards')
      .select('level, amount, status')
      .eq('referrer_id', userId)

    // Group rewards by level for detailed breakdown
    const rewardSummary = rewards?.reduce((acc: any, reward) => {
      const level = reward.level
      if (!acc[level]) {
        acc[level] = { level, count: 0, total: 0, pending: 0, paid: 0 }
      }
      acc[level].count++
      acc[level].total += reward.amount
      if (reward.status === 'pending') acc[level].pending += reward.amount
      if (reward.status === 'paid') acc[level].paid += reward.amount
      return acc
    }, {})

    // Get recent referrals with user details
    const { data: recentReferrals } = await supabaseAdmin
      .from('referral_hierarchy')
      .select(`
        level,
        is_active,
        created_at,
        profiles:user_id (
          full_name,
          username,
          is_active
        )
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get pending rewards count
    const { data: pendingRewards } = await supabaseAdmin
      .from('referral_rewards')
      .select('amount')
      .eq('referrer_id', userId)
      .eq('status', 'pending')

    const totalPendingAmount = pendingRewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0

    // Return comprehensive stats
    return NextResponse.json({
      // User profile information
      user_info: {
        full_name: stats.full_name,
        username: stats.username,
        referral_code: stats.referral_code,
        membership_level: stats.membership_level,
        is_active: stats.user_id ? true : false // If we got stats, user exists
      },

      // Financial summary
      earnings_summary: {
        total_earnings: stats.total_earnings,
        available_balance: stats.available_balance,
        pending_balance: totalPendingAmount,
        level_1_earnings: stats.level_1_earnings,
        level_2_earnings: stats.level_2_earnings,
        level_3_earnings: stats.level_3_earnings
      },

      // Referral counts
      referral_counts: {
        active_direct_referrals: stats.active_direct_referrals,
        level_1_referrals: stats.level_1_referrals,
        level_2_referrals: stats.level_2_referrals,
        level_3_referrals: stats.level_3_referrals,
        total_network_size: stats.level_1_referrals + stats.level_2_referrals + stats.level_3_referrals
      },

      // Membership progress
      membership_info: {
        current_level: stats.membership_level,
        next_level_requirement: stats.membership_level === 'inactive' ? 10 :
                                stats.membership_level === 'silver' ? 20 :
                                stats.membership_level === 'bronze' ? 30 : null,
        progress_percentage: stats.membership_level === 'gold' ? 100 :
                           Math.min((stats.active_direct_referrals / (
                             stats.membership_level === 'inactive' ? 10 :
                             stats.membership_level === 'silver' ? 20 : 30
                           )) * 100, 100)
      },

      // Detailed reward breakdown (legacy format for compatibility)
      reward_summary: Object.values(rewardSummary || {}),

      // Recent referrals
      recent_referrals: recentReferrals?.map(referral => ({
        level: referral.level,
        is_active: referral.is_active,
        created_at: referral.created_at,
        referred_user: Array.isArray(referral.profiles) && referral.profiles[0] ? {
          full_name: referral.profiles[0].full_name,
          username: referral.profiles[0].username,
          is_active: referral.profiles[0].is_active
        } : null,
        reward_amount: referral.level === 1 ? 300 :
                      referral.level === 2 ? 100 : 50
      })) || [],

      // Quick stats for dashboard cards
      quick_stats: {
        total_referrals: stats.level_1_referrals + stats.level_2_referrals + stats.level_3_referrals,
        this_month_earnings: stats.total_earnings, // You could add a date filter for this
        conversion_rate: stats.level_1_referrals > 0 ? 
          Math.round((stats.active_direct_referrals / stats.level_1_referrals) * 100) : 0
      }
    })

  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

// Optional: Add a POST endpoint for refreshing stats (triggers recalculation)
export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Manually trigger membership level update
    const { data: activeReferrals } = await supabaseAdmin
      .from('referral_hierarchy')
      .select('id')
      .eq('referrer_id', user_id)
      .eq('level', 1)
      .eq('is_active', true)

    const activeCount = activeReferrals?.length || 0
    
    let membershipLevel = 'inactive'
    if (activeCount >= 30) membershipLevel = 'gold'
    else if (activeCount >= 20) membershipLevel = 'bronze'
    else if (activeCount >= 10) membershipLevel = 'silver'

    // Update the profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        active_direct_referrals: activeCount,
        membership_level: membershipLevel
      })
      .eq('id', user_id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ 
      message: 'Stats refreshed successfully',
      active_referrals: activeCount,
      membership_level: membershipLevel
    })

  } catch (error) {
    console.error('Stats refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh stats' },
      { status: 500 }
    )
  }
}