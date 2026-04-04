-- Seed 6 additional cybersecurity training scenarios (Batch 3)
-- Sprint 2 Week 4: Completing remaining scenarios (6 of 10)
-- Run this in the Supabase SQL Editor

INSERT INTO scenarios (title, description, scenario_type, difficulty, content, correct_answers, points, time_limit_seconds)
VALUES
(
  'Phishing Link Analysis',
  'Develop skills in analyzing URLs and hyperlinks to distinguish between legitimate and malicious web addresses used in phishing campaigns.',
  'phishing_email',
  'intermediate',
  '{
    "instructions": "You are reviewing suspicious URLs reported by employees. Analyze each link to determine if it is legitimate or part of a phishing attack.",
    "background": "Malicious URLs are a core component of phishing attacks. Attackers use techniques like typosquatting, subdomain abuse, URL shorteners, and homograph attacks to create links that look legitimate. Understanding URL structure (protocol, subdomain, domain, path) is essential for identifying fake links before clicking.",
    "questions": [
      {
        "question": "Which of the following URLs is most likely a phishing link targeting a bank?\nA) https://www.chase.com/account/login\nB) https://chase.com.secure-login.xyz/account\nC) https://secure.chase.com/sign-in\nD) https://chase.com/security-update",
        "options": ["A) https://www.chase.com/account/login", "B) https://chase.com.secure-login.xyz/account", "C) https://secure.chase.com/sign-in", "D) https://chase.com/security-update"]
      },
      {
        "question": "An email contains the text \"Click here to verify your account\" and the hyperlink points to http://192.168.45.12/paypal/verify. What is suspicious about this URL?",
        "options": ["A) It uses an IP address instead of a domain name, and uses HTTP instead of HTTPS", "B) The URL is too long", "C) PayPal is mentioned in the path", "D) Nothing is suspicious about it"]
      },
      {
        "question": "What is a homograph attack in the context of phishing URLs?",
        "options": ["A) Using the same URL twice in an email", "B) Replacing characters with visually similar ones from different alphabets (e.g., using Cyrillic а instead of Latin a)", "C) Sending the same phishing email to multiple targets", "D) Copying the layout of a legitimate website"]
      }
    ],
    "explanations": [
      "Option B (chase.com.secure-login.xyz) is the phishing link. The actual domain here is secure-login.xyz, NOT chase.com. The chase.com part is just a subdomain designed to fool you. Always read URLs right-to-left starting from the first single slash — the real domain is the last part before the path. Options A, C, and D all use the legitimate chase.com domain.",
      "The IP address and HTTP protocol (A) are both major red flags. Legitimate companies like PayPal always use their branded domain name (paypal.com) and HTTPS encryption. An IP address (192.168.45.12) hides the true destination and is commonly used by attackers hosting phishing pages on compromised or temporary servers.",
      "A homograph attack (B) uses characters from different Unicode alphabets that look identical to Latin letters. For example, the Cyrillic letter а (U+0430) looks exactly like the Latin a (U+0061) but is a different character. This means аpple.com and apple.com could point to completely different servers. Modern browsers have added protections, but awareness remains important."
    ]
  }'::jsonb,
  '{"answers": ["B", "A", "B"]}'::jsonb,
  200,
  900
),
(
  'Ransomware Attack Response',
  'Learn to identify ransomware indicators and understand the correct incident response procedures when a ransomware attack is detected.',
  'baiting',
  'advanced',
  '{
    "instructions": "Your organization has detected signs of a potential ransomware attack. As part of the incident response team, evaluate each situation and determine the correct course of action.",
    "background": "Ransomware encrypts victim files and demands payment (usually in cryptocurrency) for the decryption key. Modern ransomware variants also exfiltrate data before encryption (double extortion). Ransomware can spread through phishing emails, compromised websites, RDP brute force, and infected USB drives. Rapid response is critical to limit damage.",
    "questions": [
      {
        "question": "An employee reports that all their files have been renamed with a .locked extension and a ransom note has appeared on their desktop demanding Bitcoin payment. What is the FIRST action you should take?",
        "options": ["A) Pay the ransom to recover the files quickly", "B) Immediately disconnect the affected machine from the network to prevent lateral spread", "C) Try to decrypt the files using online tools", "D) Shut down the entire company network"]
      },
      {
        "question": "Your organization is hit by ransomware and the attackers demand $500,000. They claim to have exfiltrated sensitive customer data. Why do security experts generally advise against paying the ransom?",
        "options": ["A) The payment amount is too high", "B) Payment does not guarantee data recovery, funds criminal operations, and makes you a target for future attacks", "C) Bitcoin transactions are too complicated", "D) The attackers will return the data anyway"]
      },
      {
        "question": "Which preventive measure provides the STRONGEST protection against ransomware damage?",
        "options": ["A) Installing a second antivirus program", "B) Regular offline or immutable backups with tested recovery procedures", "C) Using a stronger password for email", "D) Keeping the computer powered off when not in use"]
      }
    ],
    "explanations": [
      "Disconnect the affected machine from the network (B) is the critical first step. Ransomware often spreads laterally through network shares and connected systems. Isolating the infected machine limits the blast radius while you assess the situation. Paying the ransom (A) is discouraged. Shutting down the entire network (D) is too disruptive and may not be necessary if containment is quick.",
      "Payment does not guarantee recovery and funds criminal operations (B) is correct. Studies show that only about 65% of organizations that pay actually recover all their data. Payment also signals that your organization is willing to pay, making you a repeat target. Additionally, ransom payments fund the development of more sophisticated attacks and may violate sanctions laws in some jurisdictions.",
      "Regular offline or immutable backups (B) are the strongest defense because they allow you to restore systems without paying the ransom. The key is that backups must be offline or immutable (unchangeable) — otherwise ransomware can encrypt your backups too. Regular testing of backup restoration ensures you can actually recover when needed. This is the single most important ransomware defense."
    ]
  }'::jsonb,
  '{"answers": ["B", "B", "B"]}'::jsonb,
  350,
  1200
),
(
  'Social Media Phishing and Impersonation',
  'Identify phishing attacks and impersonation techniques used across social media platforms to steal credentials and spread malware.',
  'phishing_email',
  'beginner',
  '{
    "instructions": "You manage your organization social media presence and have noticed several suspicious accounts and messages. Evaluate each situation to identify social media phishing and impersonation threats.",
    "background": "Social media platforms are increasingly targeted by phishing attacks. Attackers create fake profiles impersonating real people or companies, send malicious links via direct messages, and use social media ads to distribute phishing pages. The informal nature of social media communication makes users more likely to trust and click on suspicious links.",
    "questions": [
      {
        "question": "You receive a direct message on LinkedIn from a connection saying: \"I saw this article about you! Check it out: [link].\" The message seems unusual for this person. What should you do?",
        "options": ["A) Click the link to see what article mentions you", "B) Verify with the person through another channel, as their account may be compromised", "C) Share the link with colleagues to check if it is real", "D) Reply asking if they sent it"]
      },
      {
        "question": "A social media account with your company logo and a slightly different handle (e.g., @YourCompany_Support) is responding to customer complaints and asking for account details. What type of attack is this?",
        "options": ["A) A DDoS attack on social media", "B) Brand impersonation designed to harvest customer credentials through fake support", "C) A legitimate support expansion by the marketing team", "D) An automated bot that is harmless"]
      },
      {
        "question": "Which of the following is a safe practice when using social media professionally?",
        "options": ["A) Accepting all connection requests to grow your network", "B) Sharing your work email on public posts for networking", "C) Verifying accounts, limiting personal information shared publicly, and being cautious of unsolicited messages with links", "D) Using the same password for social media and work accounts for convenience"]
      }
    ],
    "explanations": [
      "Verify through another channel (B) is correct. Compromised accounts frequently send phishing links to all connections. The message being unusual for that person is a strong indicator their account was hacked. Never click suspicious links, and do not reply through the same platform — contact them via email, phone, or in person to confirm.",
      "Brand impersonation (B) is the correct answer. Attackers create accounts that mimic legitimate company support channels to trick frustrated customers into sharing login credentials, payment information, or personal data. Companies should monitor for impersonation accounts and report them to the platform. Customers should verify that support accounts are official before sharing any information.",
      "Verifying accounts and being cautious of unsolicited messages (C) is the safe practice. Accepting all connection requests (A) exposes you to fake profiles. Sharing work email publicly (B) invites targeted phishing. Using the same password everywhere (D) means one breach compromises all accounts. Limiting the personal information visible on your profile reduces the data available for social engineering."
    ]
  }'::jsonb,
  '{"answers": ["B", "B", "C"]}'::jsonb,
  100,
  600
),
(
  'Credential Stuffing and Password Attacks',
  'Understand how attackers use stolen credentials and password attack techniques to gain unauthorized access to systems and accounts.',
  'pretexting',
  'intermediate',
  '{
    "instructions": "Your security team has detected unusual login activity across several company systems. Investigate each scenario to identify the type of password attack and recommend the appropriate defensive action.",
    "background": "Credential stuffing uses username/password pairs leaked from data breaches on other sites, exploiting the fact that many people reuse passwords. Unlike brute force attacks that guess passwords, credential stuffing uses real credentials that were valid on at least one other service. Billions of leaked credentials are available on the dark web.",
    "questions": [
      {
        "question": "Your security logs show thousands of login attempts across different user accounts using valid email addresses but incorrect passwords. The attempts come from IP addresses worldwide. What type of attack is this most likely?",
        "options": ["A) A single employee forgot their password", "B) Credential stuffing attack using breached username/password combinations from another service", "C) A system malfunction generating false login attempts", "D) Normal login traffic during peak hours"]
      },
      {
        "question": "An employee uses the same password for their personal email, company email, and banking. Their personal email provider suffers a data breach. What is the immediate risk?",
        "options": ["A) No risk since the breach was on a different service", "B) Only their personal email is at risk", "C) All accounts using that same password are now compromised and should be considered breached", "D) Only accounts on the same email provider are at risk"]
      },
      {
        "question": "Which defense strategy is MOST effective against credential stuffing attacks?",
        "options": ["A) Requiring passwords to be changed every 30 days", "B) Enforcing multi-factor authentication (MFA) and monitoring for login anomalies", "C) Blocking all international IP addresses", "D) Limiting usernames to employee ID numbers instead of email addresses"]
      }
    ],
    "explanations": [
      "Credential stuffing (B) is the most likely attack. The pattern of many accounts being targeted simultaneously with valid email addresses from distributed IP addresses is the hallmark of credential stuffing. Attackers use automated tools to test leaked credentials from other breaches against your systems, hoping employees reused passwords.",
      "All accounts using that same password are compromised (C). Password reuse is one of the biggest security risks for individuals. When any one service is breached, attackers immediately try those same credentials on banking sites, email providers, corporate VPNs, and cloud services. This is precisely why password managers and unique passwords per account are essential.",
      "Multi-factor authentication (MFA) (B) is the most effective defense because even if an attacker has the correct password, they cannot access the account without the second factor. Login anomaly monitoring detects unusual patterns (new locations, impossible travel, high failure rates) and can trigger automatic account lockouts or step-up authentication."
    ]
  }'::jsonb,
  '{"answers": ["B", "C", "B"]}'::jsonb,
  200,
  900
),
(
  'Insider Threat Detection',
  'Learn to recognize warning signs of insider threats where employees or contractors misuse their authorized access to harm the organization.',
  'pretexting',
  'advanced',
  '{
    "instructions": "As a security operations analyst, you are reviewing alerts about potentially malicious insider activity. Evaluate each scenario to determine the threat level and appropriate response.",
    "background": "Insider threats come from individuals within the organization — employees, contractors, or partners — who misuse their legitimate access. Insiders may steal intellectual property, sabotage systems, or exfiltrate data for personal gain or espionage. Insider threats are particularly dangerous because these individuals already have authorized access and knowledge of internal systems and security controls.",
    "questions": [
      {
        "question": "A departing employee is detected downloading large volumes of proprietary files to a personal USB drive two days before their last day. What is the appropriate response?",
        "options": ["A) Allow it since they might need personal documents", "B) Wait until they leave and then check what was downloaded", "C) Immediately notify the security team and the employee manager, and preserve evidence while restricting the employee access to sensitive systems", "D) Send them an email reminder about data policies"]
      },
      {
        "question": "Which behavioral indicator is MOST concerning for potential insider threat activity?",
        "options": ["A) An employee working late occasionally", "B) An employee consistently accessing files and systems outside their job role and attempting to bypass access controls", "C) An employee asking for a raise", "D) An employee who prefers to work alone"]
      },
      {
        "question": "What is the most effective approach to mitigating insider threats?",
        "options": ["A) Monitoring every employee email and browsing activity without their knowledge", "B) A combination of least-privilege access, user behavior analytics, regular access reviews, and a culture where employees feel comfortable reporting concerns", "C) Banning all USB drives and personal devices from the office", "D) Conducting polygraph tests during interviews"]
      }
    ],
    "explanations": [
      "Immediately notify security and management, preserve evidence, and restrict access (C) is the correct response. Data exfiltration before departure is one of the most common insider threat scenarios. Quick action prevents further data loss while preserving forensic evidence. Waiting (B) allows continued exfiltration, and a simple email (D) is inadequate for an active security incident.",
      "Accessing files outside their job role and bypassing access controls (B) is the most concerning indicator. This behavior directly indicates that someone is attempting to access information they should not have. Working late (A), salary discussions (C), and working alone (D) are normal behaviors that should never be used as sole indicators of malicious intent.",
      "The combined approach (B) provides the most effective mitigation. Least-privilege access limits the damage any single insider can do. User behavior analytics detect anomalies automatically. Regular access reviews ensure permissions stay current. A healthy culture encourages reporting of suspicious activity without fear of retaliation. Secret mass surveillance (A) is both legally problematic and damages trust."
    ]
  }'::jsonb,
  '{"answers": ["C", "B", "B"]}'::jsonb,
  350,
  1200
),
(
  'Secure Wi-Fi and Network Awareness',
  'Learn to identify risks associated with public Wi-Fi networks and understand how attackers intercept data through network-based attacks.',
  'smishing',
  'beginner',
  '{
    "instructions": "You are traveling for business and need to connect to the internet at various locations. Evaluate each Wi-Fi scenario to determine the safest course of action.",
    "background": "Public Wi-Fi networks in cafes, airports, and hotels are prime targets for attackers. Evil twin attacks create fake access points mimicking legitimate networks to intercept traffic. Man-in-the-middle (MitM) attacks allow attackers to eavesdrop on unencrypted communications. Even legitimate public Wi-Fi is inherently less secure than private networks.",
    "questions": [
      {
        "question": "You are at an airport and see two Wi-Fi networks: \"Airport_Free_WiFi\" and \"Airport Free WiFi Official.\" You are unsure which is legitimate. What should you do?",
        "options": ["A) Connect to whichever has the stronger signal", "B) Connect to the one with Official in the name since it must be real", "C) Ask airport staff for the correct network name, or use your phone mobile hotspot instead", "D) Connect to both and see which works better"]
      },
      {
        "question": "You must use hotel Wi-Fi for work. Which practice provides the BEST protection for your data?",
        "options": ["A) Only visit websites that start with www", "B) Use a company VPN to encrypt all your internet traffic", "C) Clear your browser cookies before connecting", "D) Use incognito or private browsing mode"]
      },
      {
        "question": "What is an evil twin attack?",
        "options": ["A) Two hackers working together to breach a network", "B) A fake Wi-Fi access point set up by an attacker that mimics a legitimate network to intercept user traffic", "C) A virus that clones itself across connected devices", "D) A type of DDoS attack using two servers"]
      }
    ],
    "explanations": [
      "Ask airport staff or use your mobile hotspot (C) is the safest option. Evil twin attacks work by creating access points with names similar to legitimate ones. You cannot tell which network is real just by the name or signal strength. When in doubt, ask the venue for the exact network name and password, or use your own mobile data connection which is inherently more secure.",
      "Using a company VPN (B) provides the best protection because it encrypts ALL traffic between your device and the company network. Even if an attacker intercepts your connection on the hotel Wi-Fi, they will only see encrypted data they cannot read. Incognito mode (D) only prevents local browsing history storage — it does not encrypt your traffic or protect against network-level attacks.",
      "An evil twin (B) is a rogue access point that impersonates a legitimate Wi-Fi network. The attacker sets up a hotspot with the same name (SSID) as a trusted network. When users connect, all their traffic flows through the attacker device, allowing them to capture passwords, session cookies, and sensitive data. This is why verifying network authenticity and using VPNs are essential on public Wi-Fi."
    ]
  }'::jsonb,
  '{"answers": ["C", "B", "B"]}'::jsonb,
  100,
  600
);
