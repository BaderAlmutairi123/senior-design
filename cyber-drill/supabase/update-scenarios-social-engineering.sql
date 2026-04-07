-- Update existing scenarios to be more social engineering focused
-- Replaces analyst-heavy scenarios with social engineering simulations
-- Run this if you already seeded batch 3 and want to update

-- Replace "Ransomware Attack Response" with "Quid Pro Quo Attack"
UPDATE scenarios
SET
  title = 'Quid Pro Quo Attack',
  description = 'Someone calls offering free tech support or a prize in exchange for your login credentials. Experience how attackers use favors and offers to extract sensitive information.',
  scenario_type = 'vishing',
  content = '{
    "instructions": "You receive several calls and messages today from people offering help or rewards. Each one asks for something in return. Decide how to respond to each social engineering attempt.",
    "background": "Quid pro quo attacks involve an attacker offering something (free software, tech support, a prize) in exchange for information or access. Unlike pretexting which relies on a fabricated story, quid pro quo relies on the victim wanting what is being offered.",
    "questions": [
      {
        "question": "Someone calls claiming to be from IT support. They say they detected a virus on your computer and can fix it right now for free — they just need your login credentials to access your machine remotely. What should you do?",
        "options": ["A) Give them your credentials since they are offering free help", "B) Hang up and contact your IT department directly using a known number to verify the call", "C) Give them a fake password to test if they are legitimate", "D) Ask them to email you instead"]
      },
      {
        "question": "You receive a text saying you won a $500 gift card from a survey you completed. To claim it, you need to provide your name, address, and the last 4 digits of your SSN for verification. What is the best response?",
        "options": ["A) Provide the information since you did complete a survey recently", "B) Only provide your name and address but not the SSN digits", "C) Ignore or delete the message — legitimate prizes never require sensitive personal information to claim", "D) Reply asking for more details about which survey"]
      },
      {
        "question": "A stranger at a coffee shop offers to share their phone charger with you using a USB cable plugged into their laptop. Why could this be dangerous?",
        "options": ["A) The charger might be too powerful for your phone", "B) A USB connection to an unknown computer could transfer malware or extract data from your device (juice jacking)", "C) It is perfectly safe since you are only charging", "D) The danger is only if you unlock your phone"]
      }
    ],
    "explanations": [
      "Always verify through official channels (B). IT departments never call and ask for passwords. This is a classic quid pro quo — the attacker offers something you want (free tech support) in exchange for your credentials. Contact IT directly using a number you already know.",
      "Ignore or delete (C). Legitimate organizations never require SSN digits to award prizes. The gift card is bait to get your personal information for identity theft. If you really did complete a survey with a prize, the company would already have your information on file.",
      "Juice jacking (B) is a real threat. A USB cable connected to a compromised device can install malware or steal data. Always use your own charger with a wall outlet, or use a USB data blocker if you must use an unknown cable. The connection works even when your screen is locked."
    ]
  }'::jsonb,
  correct_answers = '{"answers": ["B", "C", "B"]}'::jsonb
WHERE title = 'Ransomware Attack Response';

-- Replace "Credential Stuffing and Password Attacks" with "Shoulder Surfing and Eavesdropping"
UPDATE scenarios
SET
  title = 'Shoulder Surfing and Eavesdropping',
  description = 'You are working in public spaces — coffee shops, airports, coworking areas. Attackers are watching and listening. Can you protect your sensitive information?',
  scenario_type = 'pretexting',
  content = '{
    "instructions": "You are working remotely from various public locations today. At each location, you face a situation where someone might be trying to observe or overhear your sensitive information.",
    "background": "Shoulder surfing is a social engineering technique where attackers observe victims in public to steal passwords, PINs, and confidential data. Combined with eavesdropping on phone calls, this low-tech attack is surprisingly effective and hard to detect.",
    "questions": [
      {
        "question": "You are logging into your company VPN at a busy airport. You notice someone seated behind you who seems to be watching your screen. What is the safest action?",
        "options": ["A) Type your password quickly so they cannot see it", "B) Use a privacy screen filter and position yourself so your screen faces a wall, or wait until you have more privacy", "C) Cover only the password field with your hand while typing", "D) It does not matter since they cannot memorize your password that fast"]
      },
      {
        "question": "You need to discuss a confidential deal on a phone call while at a coffee shop. Someone at the next table seems to be listening intently. What should you do?",
        "options": ["A) Speak quietly and hope they cannot hear", "B) Postpone the call or move to a private location — sensitive business discussions should never happen where strangers can overhear", "C) Use code words for sensitive information", "D) Put your phone on speaker so the call is shorter"]
      },
      {
        "question": "A friendly stranger at a coworking space asks what project you are working on, mentions they work in the same industry, and asks which client the project is for. How should you respond?",
        "options": ["A) Share the client name since they seem trustworthy and work in the same field", "B) Share general information about your role but keep client and project details confidential", "C) Give them your business card and suggest connecting on LinkedIn to discuss further", "D) Tell them everything to build a potential business relationship"]
      }
    ],
    "explanations": [
      "Use a privacy screen and reposition (B). Privacy screen filters are essential for remote workers. Typing quickly (A) does not prevent someone from watching — attackers can observe multiple attempts. People CAN memorize passwords by watching, especially if they are recording with their phone.",
      "Postpone or move to a private area (B). Eavesdropping is a real social engineering technique. Competitors, journalists, or attackers can use overheard information for corporate espionage or targeted attacks. Speaking quietly (A) is insufficient in a quiet coffee shop.",
      "Keep details confidential (B). This could be a social engineering attempt to gather competitive intelligence. Being friendly and professional while protecting client confidentiality is the right balance. Social engineers specifically target coworking spaces because people let their guard down."
    ]
  }'::jsonb,
  correct_answers = '{"answers": ["B", "B", "B"]}'::jsonb
WHERE title = 'Credential Stuffing and Password Attacks';

-- Replace "Secure Wi-Fi and Network Awareness" with "Evil Twin Wi-Fi Attack"
UPDATE scenarios
SET
  title = 'Evil Twin Wi-Fi Attack',
  description = 'You are at an airport and need to connect to Wi-Fi. But which network is real and which one is set up by an attacker? One wrong connection could expose all your data.',
  content = '{
    "instructions": "You are traveling for work and need internet access at various locations. At each stop, you face Wi-Fi choices and decisions about how to protect your data on public networks.",
    "background": "Evil twin attacks are a type of social engineering where attackers set up fake Wi-Fi access points that look identical to legitimate ones. When you connect, all your internet traffic passes through the attacker, who can steal passwords, read your emails, and inject malware.",
    "questions": [
      {
        "question": "At the airport, you see two Wi-Fi networks: \"Airport_Free_WiFi\" and \"Airport Free WiFi Official.\" You are not sure which is real. What should you do?",
        "options": ["A) Connect to whichever has the stronger signal", "B) Connect to the one with Official in the name since it sounds more legitimate", "C) Ask airport staff for the correct network name, or use your phone hotspot instead", "D) Connect to both and see which one works better"]
      },
      {
        "question": "You need to check your work email while using hotel Wi-Fi. What is the safest way to protect your data?",
        "options": ["A) Only visit websites that start with www", "B) Use your company VPN to encrypt all your internet traffic before doing anything else", "C) Clear your browser cookies before connecting", "D) Use incognito or private browsing mode"]
      },
      {
        "question": "A helpful stranger at the coffee shop says the Wi-Fi is down and offers to share their phone hotspot. You see it is named the same as the cafe Wi-Fi. What could be happening?",
        "options": ["A) They are being genuinely helpful", "B) This could be a social engineering trick — they set up a fake hotspot to intercept your traffic", "C) This is safe since they are sitting right there", "D) It is dangerous only if you enter passwords"]
      }
    ],
    "explanations": [
      "Ask staff or use your own hotspot (C). Evil twin attacks work by creating networks with similar names. You cannot tell which is real by the name or signal strength alone. When in doubt, verify with the venue or use your own mobile data which is inherently more secure.",
      "Use a company VPN first (B). A VPN encrypts ALL your traffic, so even if someone intercepts it on the hotel Wi-Fi, they only see encrypted data. Incognito mode (D) only hides local history — it does NOT encrypt your traffic or protect against network attacks.",
      "This could be a social engineering trick (B). The stranger may have set up a rogue hotspot to perform a man-in-the-middle attack. Even if they seem friendly, connecting to an unknown person hotspot gives them full visibility into your unencrypted traffic."
    ]
  }'::jsonb,
  correct_answers = '{"answers": ["C", "B", "B"]}'::jsonb
WHERE title = 'Secure Wi-Fi and Network Awareness';

-- Update Phishing Link Analysis to be more simulation-style
UPDATE scenarios
SET
  description = 'You receive several emails with links that look suspicious. Analyze the URLs and decide whether to click or report them — one wrong click could compromise your account.',
  content = '{
    "instructions": "You have received several emails today with links you need to evaluate. Some are legitimate, some are phishing traps. Decide what to do with each one before clicking.",
    "background": "Attackers craft URLs that look nearly identical to real websites. They use tricks like misspelled domains, fake subdomains, and IP addresses to fool you into entering your credentials on a fake page.",
    "questions": [
      {
        "question": "You get an email from your bank asking you to verify a recent transaction. The link in the email is: https://chase.com.secure-login.xyz/account. Should you click it?\nA) Yes, it says chase.com so it must be real\nB) No — the real domain is secure-login.xyz, not chase.com. This is a phishing link\nC) Yes, but only if you use incognito mode\nD) Yes, as long as you do not enter your password",
        "options": ["A) Yes, it says chase.com so it must be real", "B) No — the real domain is secure-login.xyz, not chase.com. This is a phishing link", "C) Yes, but only if you use incognito mode", "D) Yes, as long as you do not enter your password"]
      },
      {
        "question": "A coworker forwards you a link to verify your payroll information: http://192.168.45.12/paypal/verify. What makes this suspicious?",
        "options": ["A) It uses an IP address instead of a domain name, and uses HTTP instead of HTTPS", "B) The URL is too long", "C) PayPal is mentioned in the path", "D) Nothing is suspicious about it"]
      },
      {
        "question": "You notice a login page URL uses аpple.com (with a Cyrillic а) instead of apple.com. What attack technique is this?",
        "options": ["A) Using the same URL twice in an email", "B) A homograph attack — replacing characters with visually identical ones from different alphabets", "C) Sending the same phishing email to multiple targets", "D) Copying the layout of a legitimate website"]
      }
    ],
    "explanations": [
      "The real domain is secure-login.xyz, NOT chase.com. Attackers put trusted brand names as subdomains to fool you. Always read the domain right-to-left from the first slash — the actual domain is the last part before the path.",
      "An IP address (192.168.45.12) instead of a named domain is a major red flag. Legitimate companies always use their branded domain. The HTTP (not HTTPS) means your data would be sent unencrypted. Never enter credentials on a page like this.",
      "This is a homograph attack. The Cyrillic letter а (U+0430) looks identical to the Latin a but is a different character, meaning аpple.com and apple.com point to completely different servers. Always check the URL carefully, especially when asked to log in."
    ]
  }'::jsonb
WHERE title = 'Phishing Link Analysis';

-- Update Insider Threat to be more from the victim/coworker perspective
UPDATE scenarios
SET
  description = 'Not all threats come from outside. A coworker is acting suspiciously — downloading files they should not access, asking unusual questions. Can you recognize the warning signs?'
WHERE title = 'Insider Threat Detection';

-- Update Social Media description
UPDATE scenarios
SET
  description = 'Your social media accounts are being targeted. Attackers are impersonating your friends, your company, and sending you suspicious links. Can you spot the fakes?'
WHERE title = 'Social Media Phishing and Impersonation';
