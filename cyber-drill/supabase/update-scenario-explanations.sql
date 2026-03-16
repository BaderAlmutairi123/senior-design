-- Add answer explanations to scenarios for detailed feedback
-- Run this in the Supabase SQL Editor
-- Sprint 2 Week 2: Writing feedback content for scenarios (2 of 5 completed)

-- 1. Phishing Email Detection - Add explanations
UPDATE scenarios
SET content = jsonb_set(
  content,
  '{explanations}',
  '[
    "All of the above (D) is correct. The misspelled domain (amaz0n vs amazon) is the most obvious red flag, but the use of HTTP instead of HTTPS and unsolicited verification requests are also strong phishing indicators. Legitimate companies use their official domains and always encrypt sensitive pages with HTTPS.",
    "Verify through a separate communication channel (C) is the correct response. This is a classic Business Email Compromise (BEC) attack. Even if the email address looks correct, attackers can spoof sender addresses. Never act on urgent financial requests without verifying through a different channel like a direct phone call to the CEO using a known number.",
    "An email sent during business hours from a known colleague (C) is NOT a phishing indicator — it is normal behavior. Generic greetings, spelling errors, and urgent deadlines are all classic phishing tactics designed to bypass your critical thinking and pressure you into acting quickly."
  ]'::jsonb
)
WHERE title = 'Phishing Email Detection';

-- 2. Vishing: Voice Phishing Attack - Add explanations
UPDATE scenarios
SET content = jsonb_set(
  content,
  '{explanations}',
  '[
    "Hang up and call the bank directly (B) is the safest response. Legitimate banks will never ask for your PIN over the phone. Caller ID can be easily spoofed, so the displayed number is not proof of identity. Always use the phone number printed on the back of your bank card or on your bank statement to call back.",
    "IT departments should never ask for passwords over the phone (B) is the best indicator of a vishing attack. Caller ID spoofing is easy and cheap for attackers, so a legitimate-looking number means nothing. No legitimate IT department will ever ask for your password — they have admin access to reset credentials without needing yours.",
    "Threatening account suspension or legal action (A) is the most common urgency technique in vishing. Attackers create fear and panic to override your rational thinking. If someone threatens immediate consequences, that pressure itself is the red flag. Legitimate organizations give you time and written notice before taking action."
  ]'::jsonb
)
WHERE title = 'Vishing: Voice Phishing Attack';
