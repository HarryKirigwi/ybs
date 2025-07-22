// 8. Activation Payment API (app/api/activation/initiate/route.ts)
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { user_id, payment_method } = await request.json()

    // Generate payment reference
    const paymentReference = `ACT_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Create payment record
    const { data, error } = await supabaseAdmin
      .from('activation_payments')
      .insert({
        user_id,
        payment_method,
        payment_reference: paymentReference,
        amount: 600
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      payment_reference: paymentReference,
      amount: 600,
      payment_id: data.id
    })

  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}