// api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UserData, ApiResponse } from '../../../types/user';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Fetch user data from Supabase
    const { data: rawUserData, error } = await supabase
      .from('profiles') // Replace 'users' with your actual table name
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: error.code === 'PGRST116' ? 'User not found' : 'Database query failed'
      }, { status: error.code === 'PGRST116' ? 404 : 500 });
    }

    if (!rawUserData) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Transform database data by removing specified fields and adding email
    const userData: UserData = {
      id: rawUserData.id,
      active_direct_referrals: rawUserData.active_direct_referrals,
      available_balance: rawUserData.available_balance,
      created_at: rawUserData.created_at,
      email: rawUserData.email, // Added email field
      full_name: rawUserData.full_name,
      is_active: rawUserData.is_active,
      membership_level: rawUserData.membership_level,
      pending_balance: rawUserData.pending_balance,
      phone_number: rawUserData.phone_number,
      phone_verified: rawUserData.phone_verified,
      referral_code: rawUserData.referral_code,
      total_earnings: rawUserData.total_earnings,
      username: rawUserData.username
      // Excluded: activation_paid_at, id, referred_by, updated_at
    };

    return NextResponse.json<ApiResponse<UserData>>({
      success: true,
      data: userData,
      message: 'Profile data retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Validate that user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles') // Replace 'users' with your actual table name
      .select('id')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: fetchError.code === 'PGRST116' ? 'User not found' : 'Database query failed'
      }, { status: fetchError.code === 'PGRST116' ? 404 : 500 });
    }

    if (!existingUser) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Prepare update data with current timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Update user in Supabase
    const { data: updatedRawUserData, error: updateError } = await supabase
      .from('profiles') // Replace 'users' with your actual table name
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Failed to update user profile'
      }, { status: 500 });
    }

    // Transform database data by removing specified fields and adding email
    const userData: UserData = {
      id: updatedRawUserData.id,
      active_direct_referrals: updatedRawUserData.active_direct_referrals,
      available_balance: updatedRawUserData.available_balance,
      created_at: updatedRawUserData.created_at,
      email: updatedRawUserData.email, // Added email field
      full_name: updatedRawUserData.full_name,
      is_active: updatedRawUserData.is_active,
      membership_level: updatedRawUserData.membership_level,
      pending_balance: updatedRawUserData.pending_balance,
      phone_number: updatedRawUserData.phone_number,
      phone_verified: updatedRawUserData.phone_verified,
      referral_code: updatedRawUserData.referral_code,
      total_earnings: updatedRawUserData.total_earnings,
      username: updatedRawUserData.username
      // Excluded: activation_paid_at, id, referred_by, updated_at
    };

    return NextResponse.json<ApiResponse<UserData>>({
      success: true,
      data: userData,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Environment variables required:
// NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
// SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key