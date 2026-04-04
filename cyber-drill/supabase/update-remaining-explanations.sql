-- Add answer explanations to remaining 3 scenarios
-- Sprint 2 Week 3: Writing feedback content for scenarios (3 of 5 remaining)

-- 3. SMS Phishing (Smishing) Awareness - Add explanations
UPDATE scenarios
SET content = jsonb_set(
  content,
  '{explanations}',
  '[
    "All of the above (D) is correct. Legitimate delivery services use their official domains (e.g., ups.com, fedex.com) and never use URL shorteners like bit.ly. The false urgency (\"URGENT\") is a pressure tactic, and real delivery notifications always include tracking numbers and sender identification so you can verify the message independently.",
    "Social Security numbers, passwords, or PINs (B) should NEVER be shared via text message. No legitimate bank, government agency, or service provider will ever ask for sensitive credentials through SMS. If your account truly had an issue, the institution would ask you to visit a branch or call their official number — never respond to a text with personal data.",
    "Opening the official app or website directly (C) is the safest action. By navigating to the service yourself (typing the URL or using the app), you bypass any malicious links in the text. Never click links in suspicious texts, and do not reply — even replying STOP can confirm to attackers that your number is active and monitored."
  ]'::jsonb
)
WHERE title = 'SMS Phishing (Smishing) Awareness';

-- 4. Pretexting: Social Engineering Deception - Add explanations
UPDATE scenarios
SET content = jsonb_set(
  content,
  '{explanations}',
  '[
    "Verify their identity by calling the fire department directly (B) is the correct response. Pretexting attackers rely on authority and urgency to bypass security procedures. A real fire inspector would have a scheduled appointment on file. Always verify through independent channels — call the fire department using a number you look up yourself, not one the visitor provides.",
    "Exploiting the helper instinct and organizational chaos around new hires (A) is what makes this pretexting scenario effective. Attackers take advantage of the natural desire to help colleagues and the confusion that often surrounds onboarding. IT staff should always follow verification procedures regardless of how sympathetic the request seems — verify through HR or the hiring manager before granting any access.",
    "Contact the vendor using previously established contact information (C) is the recommended step. This is a classic vendor impersonation pretext. Attackers research real invoice numbers from data breaches or social engineering to make requests credible. Never use contact details provided in the suspicious request itself — always use the phone number or email already on file from your original vendor agreement.",
    "Regular security awareness training with simulated social engineering exercises (B) is the best defense. Pretexting targets people, not technology, so firewalls (A) are ineffective against it. Training employees to recognize manipulation tactics and practicing with realistic simulations builds the human firewall that technical controls cannot replace."
  ]'::jsonb
)
WHERE title = 'Pretexting: Social Engineering Deception';

-- 5. Baiting: USB Drop & Download Traps - Add explanations
UPDATE scenarios
SET content = jsonb_set(
  content,
  '{explanations}',
  '[
    "The USB could auto-execute malware that compromises the entire network (B) is the most likely risk. Malicious USB drives can contain auto-run scripts, firmware exploits, or keystroke-injecting payloads (like USB Rubber Ducky) that execute the moment they are plugged in. A single compromised workstation can give attackers a foothold to move laterally across the entire corporate network.",
    "Refuse the download (C) is correct because legitimate software NEVER asks you to disable your security tools. This is a major red flag — disabling antivirus removes the one safeguard that would detect the malware bundled with the fake software. If a download requires you to lower your defenses, it is almost certainly malicious. Always obtain software from official vendor websites.",
    "Turn them in to IT security without plugging them into any device (B) is the recommended policy. Even plugging a USB into an air-gapped or sandboxed machine carries risk, as sophisticated attacks can exploit USB controller firmware vulnerabilities. The safest approach is to never connect unknown devices and let trained security professionals handle analysis with proper tools and containment procedures."
  ]'::jsonb
)
WHERE title = 'Baiting: USB Drop & Download Traps';
