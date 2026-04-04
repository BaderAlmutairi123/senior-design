-- Seed 5 cybersecurity training scenarios
-- Run this in the Supabase SQL Editor
-- Schema: course_id (uuid, nullable), scenario_type IN (phishing_email, vishing, smishing, pretexting, baiting)
-- difficulty IN (beginner, intermediate, advanced)

INSERT INTO scenarios (title, description, scenario_type, difficulty, content, correct_answers, points, time_limit_seconds)
VALUES
(
  'Phishing Email Detection',
  'Analyze a set of emails and identify which ones are phishing attempts. Learn to spot suspicious senders, urgent language, and malicious links.',
  'phishing_email',
  'beginner',
  '{
    "instructions": "You are a security analyst reviewing flagged emails. Examine each email carefully and determine whether it is legitimate or a phishing attempt.",
    "background": "Phishing is one of the most common attack vectors used by cybercriminals. Over 90% of data breaches start with a phishing email. Being able to identify phishing attempts is a critical skill for every cybersecurity professional.",
    "questions": [
      {
        "question": "An email from support@amaz0n-secure.com asks you to verify your account by clicking a link. The link points to http://amaz0n-secure.com/verify. What is the primary red flag?",
        "options": ["A) The domain name is misspelled (amaz0n instead of amazon)", "B) The email asks for verification", "C) The link uses HTTP instead of HTTPS", "D) All of the above"]
      },
      {
        "question": "You receive an email from your CEO asking you to urgently wire $50,000 to a new vendor. The email address matches the CEO. What should you do?",
        "options": ["A) Wire the money immediately since it is from the CEO", "B) Reply to the email asking for confirmation", "C) Verify through a separate communication channel (phone call)", "D) Forward to IT and ignore"]
      },
      {
        "question": "Which of the following is NOT a common indicator of a phishing email?",
        "options": ["A) Generic greeting like Dear Customer", "B) Spelling and grammar errors", "C) Email sent during business hours from a known colleague", "D) Urgent call to action with a deadline"]
      }
    ]
  }'::jsonb,
  '{"answers": ["D", "C", "C"]}'::jsonb,
  100,
  600
),
(
  'Vishing: Voice Phishing Attack',
  'Learn to recognize voice phishing (vishing) attacks where attackers impersonate trusted entities over phone calls to steal sensitive information.',
  'vishing',
  'intermediate',
  '{
    "instructions": "You are training employees on how to handle suspicious phone calls. Review each scenario and determine the correct response to a potential vishing attack.",
    "background": "Vishing (voice phishing) uses phone calls to trick victims into revealing personal or financial information. Attackers often spoof caller IDs to appear as banks, government agencies, or IT support. Unlike email phishing, vishing exploits the urgency and trust inherent in voice communication.",
    "questions": [
      {
        "question": "You receive a call from someone claiming to be your bank. They say your account has been compromised and ask you to verify your account number and PIN. What should you do?",
        "options": ["A) Provide the information since they called from the bank number", "B) Hang up and call the bank directly using the number on your card", "C) Ask the caller for their employee ID to verify", "D) Give only your account number but not your PIN"]
      },
      {
        "question": "An attacker uses caller ID spoofing to display your company IT department number. They ask for your VPN credentials to fix a connectivity issue. What is the best indicator this is a vishing attack?",
        "options": ["A) The caller ID shows a legitimate internal number", "B) IT departments should never ask for passwords over the phone", "C) The caller sounds professional and knowledgeable", "D) The call came during business hours"]
      },
      {
        "question": "Which technique do vishing attackers commonly use to create urgency?",
        "options": ["A) Threatening account suspension or legal action", "B) Offering a free gift card", "C) Asking you to complete a survey", "D) Sending a follow-up email"]
      }
    ]
  }'::jsonb,
  '{"answers": ["B", "B", "A"]}'::jsonb,
  200,
  900
),
(
  'SMS Phishing (Smishing) Awareness',
  'Identify and respond to smishing attacks delivered via SMS text messages. Learn the common tactics used in text-based social engineering.',
  'smishing',
  'beginner',
  '{
    "instructions": "You have received several suspicious text messages on your work phone. Analyze each message and determine whether it is a smishing attempt or a legitimate communication.",
    "background": "Smishing (SMS phishing) delivers fraudulent messages via text to trick recipients into clicking malicious links, calling fake numbers, or sharing personal data. Smishing is increasingly effective because people tend to trust text messages more than emails, and mobile devices make it harder to verify URLs.",
    "questions": [
      {
        "question": "You receive a text: \"URGENT: Your package delivery failed. Click here to reschedule: http://bit.ly/3xR9kz2\". What makes this suspicious?",
        "options": ["A) Legitimate carriers use their own domains, not shortened URLs", "B) The message creates false urgency", "C) There is no tracking number or sender identification", "D) All of the above"]
      },
      {
        "question": "A text message says: \"Your bank account has been locked. Reply with your SSN to verify your identity.\" What type of information should you NEVER share via text?",
        "options": ["A) Your name", "B) Social Security numbers, passwords, or PINs", "C) Your email address", "D) Your phone number"]
      },
      {
        "question": "What is the safest action when you receive a suspicious text claiming to be from a service you use?",
        "options": ["A) Click the link to check if it is real", "B) Reply STOP to unsubscribe", "C) Open the official app or website directly instead of clicking any link", "D) Forward it to your contacts to warn them"]
      }
    ]
  }'::jsonb,
  '{"answers": ["D", "B", "C"]}'::jsonb,
  100,
  600
),
(
  'Pretexting: Social Engineering Deception',
  'Understand how attackers create fabricated scenarios (pretexts) to manipulate victims into divulging confidential information or performing actions.',
  'pretexting',
  'advanced',
  '{
    "instructions": "You are investigating a series of social engineering incidents at your organization. Analyze each pretexting scenario and identify the manipulation techniques being used.",
    "background": "Pretexting is a social engineering technique where an attacker creates a fabricated scenario to engage a victim. Unlike phishing which casts a wide net, pretexting involves building a fake identity and backstory to establish trust. Attackers may pose as coworkers, police, bank officials, or other authority figures to extract information or gain physical access.",
    "questions": [
      {
        "question": "Someone calls the front desk claiming to be a fire inspector who needs building access for an emergency compliance check. They have a badge but no appointment. What should the receptionist do?",
        "options": ["A) Let them in immediately since fire safety is critical", "B) Verify their identity by calling the fire department directly and checking for scheduled inspections", "C) Ask them to come back another day", "D) Let them in but escort them"]
      },
      {
        "question": "An attacker poses as a new employee and asks an IT technician for network access credentials, claiming their onboarding was delayed. Which pretexting element makes this effective?",
        "options": ["A) Exploiting the helper instinct and organizational chaos around new hires", "B) Using technical jargon", "C) Calling during lunch hour", "D) Wearing business casual clothing"]
      },
      {
        "question": "A vendor calls accounting and says they changed their bank details, requesting future payments go to a new account. They reference real invoice numbers. What is the recommended verification step?",
        "options": ["A) Update the payment details since they know the invoice numbers", "B) Send a confirmation email to the address they provide", "C) Contact the vendor using previously established contact information to verify the change", "D) Ask them to send a letter on company letterhead"]
      },
      {
        "question": "Which of the following is the BEST organizational defense against pretexting attacks?",
        "options": ["A) Installing better firewalls", "B) Regular security awareness training with simulated social engineering exercises", "C) Requiring all communication via email only", "D) Banning phone calls from unknown numbers"]
      }
    ]
  }'::jsonb,
  '{"answers": ["B", "A", "C", "B"]}'::jsonb,
  350,
  1200
),
(
  'Baiting: USB Drop & Download Traps',
  'Learn to recognize baiting attacks that use enticing offers or physical media to trick victims into compromising their systems.',
  'baiting',
  'intermediate',
  '{
    "instructions": "Your security team has discovered several baiting attempts targeting your organization. Review each scenario and determine the correct security response.",
    "background": "Baiting exploits human curiosity and greed by offering something enticing — a free USB drive, a music download, or a prize — that contains malware or leads to credential theft. Physical baiting often involves leaving infected USB drives in parking lots or lobbies, while digital baiting uses free download offers to deliver malicious payloads.",
    "questions": [
      {
        "question": "An employee finds a USB drive labeled \"Salary Data 2026\" in the parking lot and plugs it into their work computer. What is the most likely risk?",
        "options": ["A) The USB contains a harmless prank", "B) The USB could auto-execute malware that compromises the entire network", "C) The USB will simply not work on a company computer", "D) The USB contains actual salary data that was accidentally dropped"]
      },
      {
        "question": "A website offers a free download of expensive security software. The download requires you to disable your antivirus first. What should you do?",
        "options": ["A) Disable antivirus and download — free security tools are common", "B) Download it but scan it after installation", "C) Refuse the download — legitimate software never asks you to disable security tools", "D) Download it on a personal device instead"]
      },
      {
        "question": "What is the recommended policy for handling unknown USB devices found on company premises?",
        "options": ["A) Plug them into an air-gapped analysis machine in a sandboxed environment", "B) Turn them in to IT security without plugging them into any device", "C) Throw them away", "D) Plug them in to check for an owner name and return them"]
      }
    ]
  }'::jsonb,
  '{"answers": ["B", "C", "B"]}'::jsonb,
  200,
  900
);
