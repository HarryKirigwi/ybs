// lib/fraudPrevention.ts
import { supabase } from './supabase';

export async function checkForDuplicateAccounts(phoneNumber: string, email: string, ipAddress?: string) {
  // Check for existing phone number
  const { data: phoneExists } = await supabase
    .from('profiles')
    .select('id, phone_number')
    .eq('phone_number', phoneNumber)
    .single();

  if (phoneExists) {
    throw new Error('An account with this phone number already exists');
  }

  // Check for existing email
  const { data: emailExists } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .single();

  if (emailExists) {
    throw new Error('An account with this email already exists');
  }

  // Additional fraud checks
  if (ipAddress) {
    await checkIpFraudRisk(ipAddress, phoneNumber, email);
  }

  return true;
}

async function checkIpFraudRisk(ipAddress: string, phoneNumber: string, email: string) {
  // Check how many accounts were created from this IP
  const { data: recentAccounts } = await supabase
    .from('fraud_detection')
    .select('*')
    .eq('ip_address', ipAddress)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

  if (recentAccounts && recentAccounts.length >= 3) {
    // Log suspicious activity
    await supabase.from('fraud_detection').insert([{
      phone_number: phoneNumber,
      email: email,
      ip_address: ipAddress,
      suspicious_activity: 'Multiple registrations from same IP',
      risk_score: 80,
      action_taken: 'Registration blocked'
    }]);

    throw new Error('Too many registrations from this location. Please try again later.');
  }
}
