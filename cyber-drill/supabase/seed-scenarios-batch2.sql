-- Seed 4 additional cybersecurity training scenarios (Batch 2)
-- Sprint 2 Week 3: Adding remaining scenarios to database (4 of 10)
-- Run this in the Supabase SQL Editor

INSERT INTO scenarios (title, description, scenario_type, difficulty, content, correct_answers, points, time_limit_seconds)
VALUES
(
  'Spear Phishing: Targeted Email Attacks',
  'Learn to identify highly targeted phishing emails crafted using personal information gathered from social media and public sources.',
  'phishing_email',
  'advanced',
  '{
    "instructions": "You are a senior security analyst investigating targeted phishing attempts against executives in your organization. Analyze each scenario to identify spear phishing tactics.",
    "background": "Spear phishing differs from generic phishing by targeting specific individuals with personalized content. Attackers research victims using LinkedIn, company websites, and social media to craft convincing emails. These attacks have a much higher success rate than bulk phishing because the emails appear to come from trusted contacts and reference real projects or events.",
    "questions": [
      {
        "question": "You receive an email appearing to be from your direct manager referencing a real project you are both working on. It asks you to review an attached document. The sender address is j.smith@company-portal.com instead of j.smith@company.com. What makes this a spear phishing attempt?",
        "options": ["A) The email mentions a real project", "B) The sender domain is subtly different from the legitimate company domain", "C) The email came from your manager", "D) The email contains an attachment"]
      },
      {
        "question": "An attacker sends a personalized email to the CFO referencing a recent acquisition announced on the company blog, requesting wire transfer approval. Which information gathering technique was most likely used?",
        "options": ["A) Brute force password cracking", "B) Open-source intelligence (OSINT) from publicly available company information", "C) Keylogging on the CFO computer", "D) Intercepting internal emails"]
      },
      {
        "question": "What is the MOST effective defense against spear phishing attacks specifically?",
        "options": ["A) Generic spam filters", "B) Blocking all external emails", "C) Multi-factor authentication combined with employee training on verifying unusual requests", "D) Changing passwords weekly"]
      },
      {
        "question": "A colleague shares that they received an email from a recruiter on LinkedIn offering a job opportunity with a link to apply. The link goes to a login page that looks like LinkedIn. What should they do?",
        "options": ["A) Click the link since it came through LinkedIn", "B) Navigate to LinkedIn directly in a new browser tab to check for the message", "C) Reply to the recruiter asking if it is legitimate", "D) Forward it to other colleagues to check"]
      }
    ],
    "explanations": [
      "The subtly different sender domain (B) is the key indicator. Attackers register look-alike domains (company-portal.com vs company.com) to impersonate trusted contacts. The personalized project reference actually makes this MORE dangerous — it shows the attacker did research to make the email convincing. Always verify the exact sender domain, not just the display name.",
      "Open-source intelligence (OSINT) (B) is the most likely technique. Company blogs, press releases, SEC filings, and social media posts are goldmines for spear phishing attackers. They use publicly available information to craft emails that reference real events, making them highly believable. Organizations should be mindful of what they share publicly.",
      "Multi-factor authentication combined with employee training (C) provides the strongest defense. MFA ensures that even if credentials are compromised through a spear phishing link, attackers cannot access accounts without the second factor. Training teaches employees to verify unusual requests through separate channels. Generic spam filters (A) often miss spear phishing because the emails are crafted to bypass automated detection.",
      "Navigate to LinkedIn directly in a new browser tab (B) is the safest response. Phishing attacks often impersonate professional platforms like LinkedIn with fake login pages designed to steal credentials. By going directly to the legitimate site, you bypass any malicious links while still being able to check if the message is real."
    ]
  }'::jsonb,
  '{"answers": ["B", "B", "C", "B"]}'::jsonb,
  350,
  1200
),
(
  'Watering Hole Attack Awareness',
  'Understand how attackers compromise websites frequently visited by their targets to deliver malware or steal credentials.',
  'baiting',
  'advanced',
  '{
    "instructions": "Your threat intelligence team has identified suspicious activity on websites commonly used by your industry. Analyze each scenario to identify watering hole attack patterns.",
    "background": "A watering hole attack compromises a website that the target group frequently visits, rather than attacking the targets directly. Named after predators who wait near water sources for prey, these attacks are highly effective because victims trust the compromised sites. Attackers inject malicious code into legitimate websites, exploit browser vulnerabilities, or redirect users to malicious download pages.",
    "questions": [
      {
        "question": "Your company security team notices that several employees who visited an industry trade association website have been infected with malware. The website itself is legitimate and well-known. What type of attack is this most likely?",
        "options": ["A) Distributed denial of service (DDoS)", "B) Watering hole attack — the legitimate website was compromised to target visitors from specific industries", "C) An insider threat from the trade association", "D) A random malware infection unrelated to the website"]
      },
      {
        "question": "What makes watering hole attacks particularly difficult to detect compared to phishing?",
        "options": ["A) They use encrypted communications", "B) The malicious content is hosted on trusted, legitimate websites that employees are expected to visit", "C) They only target mobile devices", "D) They always require physical access to the target network"]
      },
      {
        "question": "Which defensive measure is MOST effective against watering hole attacks?",
        "options": ["A) Blocking all external websites", "B) Using only Internet Explorer", "C) Keeping browsers and plugins updated, using network segmentation, and monitoring for unusual outbound traffic", "D) Training employees to avoid the internet entirely"]
      }
    ],
    "explanations": [
      "This is a watering hole attack (B). The attacker identified that employees in this industry regularly visit the trade association website and injected malicious code into it. Since the website is legitimate and trusted, employees had no reason to be suspicious. This is what makes watering hole attacks so dangerous — they weaponize trust in known resources.",
      "The malicious content being hosted on trusted, legitimate websites (B) is what makes detection so hard. Employees are expected to visit these sites as part of their normal work, so security tools and policies that look for visits to suspicious domains will not flag anything. The trust relationship between the organization and the compromised website is what the attacker exploits.",
      "Keeping browsers and plugins updated, using network segmentation, and monitoring outbound traffic (C) provides the best defense. Updated software closes the vulnerabilities that watering hole attacks exploit. Network segmentation limits lateral movement if a workstation is compromised. Monitoring outbound traffic can detect command-and-control communications from infected machines."
    ]
  }'::jsonb,
  '{"answers": ["B", "B", "C"]}'::jsonb,
  300,
  900
),
(
  'Tailgating and Physical Social Engineering',
  'Recognize physical security threats where attackers gain unauthorized building access by following authorized personnel.',
  'pretexting',
  'intermediate',
  '{
    "instructions": "You are a physical security consultant reviewing incidents at a corporate office. Evaluate each scenario to determine the correct security response.",
    "background": "Tailgating (or piggybacking) is a physical social engineering attack where an unauthorized person follows an authorized person through a secure entrance. Attackers exploit politeness and social norms — most people will hold the door for someone carrying boxes or wearing a delivery uniform. Physical access to a building can lead to network access, data theft, or planting of surveillance devices.",
    "questions": [
      {
        "question": "You badge into the office and someone in a delivery uniform asks you to hold the door because their hands are full of packages. What is the correct response?",
        "options": ["A) Hold the door open since they are clearly a delivery person", "B) Let the door close and politely direct them to the reception desk to be properly signed in", "C) Ask to see their delivery manifest", "D) Ignore them and walk away quickly"]
      },
      {
        "question": "An attacker successfully tailgates into your office building. Which of the following actions could they potentially take?",
        "options": ["A) Plant a rogue wireless access point on the network", "B) Access unlocked workstations to steal data", "C) Install physical keyloggers on keyboards", "D) All of the above"]
      },
      {
        "question": "Which physical security control is MOST effective at preventing tailgating?",
        "options": ["A) Security cameras alone", "B) Mantrap or turnstile entry systems that only allow one person per badge scan", "C) Putting up warning signs about tailgating", "D) Requiring employees to wear lanyards"]
      }
    ],
    "explanations": [
      "Let the door close and direct them to reception (B) is correct. Delivery uniforms are easy to fake, and a legitimate delivery person should have no issue checking in at the front desk. Politely explaining that company policy requires all visitors to sign in is professional and protects the building. Social engineering attackers specifically exploit our tendency to be helpful and polite.",
      "All of the above (D) is correct. Physical access to a building is often just as dangerous as remote network access. Attackers can plant rogue access points that create backdoors into the corporate network, access unlocked computers to steal files or install malware, and attach hardware keyloggers between keyboards and computers to capture passwords. This is why physical security is a critical component of cybersecurity.",
      "Mantrap or turnstile entry systems (B) are the most effective control because they physically enforce one-person-per-badge-scan. Cameras (A) only record tailgating after the fact — they do not prevent it. Signs (C) raise awareness but rely on human compliance. Lanyards (D) help identify people inside the building but do not prevent unauthorized entry at the door."
    ]
  }'::jsonb,
  '{"answers": ["B", "D", "B"]}'::jsonb,
  200,
  900
),
(
  'CEO Fraud and Business Email Compromise',
  'Detect and respond to Business Email Compromise (BEC) attacks where criminals impersonate executives to authorize fraudulent transactions.',
  'phishing_email',
  'advanced',
  '{
    "instructions": "You work in the finance department and have received several urgent email requests. Analyze each scenario to determine if it is a legitimate executive request or a BEC attack.",
    "background": "Business Email Compromise (BEC) is one of the most financially damaging cybercrimes. The FBI reported over $2.7 billion in losses from BEC in a single year. Attackers either compromise or spoof executive email accounts to request wire transfers, W-2 records, or gift card purchases. BEC attacks succeed because they exploit authority, urgency, and trust in the chain of command.",
    "questions": [
      {
        "question": "You receive an email from the CEO at 6:45 PM on Friday asking you to urgently wire $125,000 to a new vendor before the weekend. The email says this is confidential and not to discuss it with anyone. What are the red flags?",
        "options": ["A) The timing (end of day Friday) and urgency", "B) The request for confidentiality and secrecy", "C) A new vendor with no prior payment history", "D) All of the above are red flags indicating a BEC attack"]
      },
      {
        "question": "An email from the HR director asks you to send all employee W-2 forms to a personal Gmail address for a tax audit review. The email address in the From field looks correct. What should you do?",
        "options": ["A) Send the W-2 forms since the request appears to come from HR", "B) Send only a few W-2 forms as a test", "C) Call the HR director at their known phone number to verify the request, as W-2 data should never be sent to personal email accounts", "D) Reply to the email asking for confirmation"]
      },
      {
        "question": "Which technical control can help prevent BEC attacks that use spoofed email domains?",
        "options": ["A) Implementing DMARC, DKIM, and SPF email authentication protocols", "B) Using a longer password for email", "C) Encrypting all emails with PGP", "D) Blocking all emails from outside the organization"]
      }
    ],
    "explanations": [
      "All of the above (D) are classic BEC red flags. Attackers deliberately time requests for late Friday or before holidays when verification is harder. The secrecy request prevents you from asking colleagues who might recognize the scam. New vendor accounts are used so the money goes directly to attacker-controlled bank accounts. Any one of these would be suspicious — together they strongly indicate a BEC attack.",
      "Call the HR director at their known phone number (C) is correct. W-2 forms contain Social Security numbers, salaries, and addresses — extremely sensitive data that should never be sent to personal email accounts regardless of who requests it. Never reply to the suspicious email to verify, as the attacker controls that communication channel. Always use a separate, trusted communication method to verify.",
      "Implementing DMARC, DKIM, and SPF (A) is the best technical control. These email authentication protocols work together to verify that emails actually come from the domains they claim to be from. DMARC tells receiving servers what to do with emails that fail authentication checks, DKIM adds a digital signature to emails, and SPF specifies which servers can send email for a domain."
    ]
  }'::jsonb,
  '{"answers": ["D", "C", "A"]}'::jsonb,
  350,
  1200
);
