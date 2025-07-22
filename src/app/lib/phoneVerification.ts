// lib/phoneVerification.ts
export async function sendPhoneVerification(phoneNumber: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store verification code
  const { error } = await supabase
    .from('verification_attempts')
    .insert([{
      phone_number: phoneNumber,
      verification_type: 'phone',
      code: code,
      expires_at: expiresAt.toISOString()
    }]);

  if (error) throw error;

  // Send SMS (integrate with SMS provider like Twilio or Africa's Talking)
  await sendSMS(phoneNumber, `Your verification code is: ${code}. Valid for 10 minutes.`);
  
  return { success: true };
}

export async function verifyPhoneCode(phoneNumber: string, code: string) {
  const { data, error } = await supabase
    .from('verification_attempts')
    .select('*')
    .eq('phone_number', phoneNumber)
    .eq('verification_type', 'phone')
    .eq('code', code)
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error('Invalid or expired verification code');
  }

  // Mark as verified
  await supabase
    .from('verification_attempts')
    .update({ verified: true })
    .eq('id', data.id);

  // Update user profile
  await supabase
    .from('profiles')
    .update({ phone_verified: true })
    .eq('phone_number', phoneNumber);

  return { success: true };
}

// Placeholder for SMS service integration
async function sendSMS(phoneNumber: string, message: string) {
  // Integrate with SMS provider
  console.log(`SMS to ${phoneNumber}: ${message}`);
}