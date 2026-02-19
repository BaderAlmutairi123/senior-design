-- Seed 5 cybersecurity training scenarios
-- Run this in the Supabase SQL Editor

INSERT INTO scenarios (course_id, title, description, scenario_type, difficulty, content, correct_answers, points, time_limit_seconds, is_active)
VALUES
(
  'general',
  'Phishing Email Detection',
  'Analyze a set of emails and identify which ones are phishing attempts. Learn to spot suspicious senders, urgent language, and malicious links.',
  'quiz',
  'easy',
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
  600,
  true
),
(
  'general',
  'Network Traffic Analysis',
  'Examine network packet captures to identify suspicious traffic patterns, potential intrusions, and data exfiltration attempts.',
  'analysis',
  'medium',
  '{
    "instructions": "You are monitoring network traffic for a corporate environment. Analyze the following traffic logs and identify any malicious activity.",
    "background": "Network traffic analysis is a fundamental skill in cybersecurity. By examining packet captures and flow data, analysts can detect intrusions, malware communication, and data exfiltration. Understanding normal vs. abnormal traffic patterns is essential for threat detection.",
    "questions": [
      {
        "question": "You observe a workstation making repeated DNS queries to random-looking subdomains like a3f2b.evil-domain.com and x9k1m.evil-domain.com. What type of attack does this indicate?",
        "options": ["A) DDoS attack", "B) DNS tunneling / data exfiltration", "C) DNS cache poisoning", "D) Normal browsing behavior"]
      },
      {
        "question": "A server is sending large amounts of data to an external IP address at 3:00 AM every night. The destination IP is not on any known threat list. What is the most appropriate next step?",
        "options": ["A) Ignore it since the IP is not flagged", "B) Block the IP immediately", "C) Investigate the server, check scheduled tasks, and analyze the data being sent", "D) Restart the server"]
      },
      {
        "question": "You notice a spike in ICMP traffic from an internal host. What could this indicate?",
        "options": ["A) Normal network diagnostics", "B) ICMP tunneling for covert communication", "C) A ping sweep for network reconnaissance", "D) Any of the above — further investigation is needed"]
      }
    ]
  }'::jsonb,
  '{"answers": ["B", "C", "D"]}'::jsonb,
  200,
  900,
  true
),
(
  'general',
  'SQL Injection Fundamentals',
  'Learn to identify and exploit SQL injection vulnerabilities in web applications, and understand how to defend against them.',
  'hands-on',
  'medium',
  '{
    "instructions": "You are performing a security assessment on a web application. The application has a login form and a search feature. Identify SQL injection vulnerabilities and determine how to mitigate them.",
    "background": "SQL Injection (SQLi) is a code injection technique that exploits vulnerabilities in an application''s database layer. It consistently ranks in the OWASP Top 10 and can lead to unauthorized data access, data modification, or even complete system compromise.",
    "questions": [
      {
        "question": "A login form sends the following query: SELECT * FROM users WHERE username=''[input]'' AND password=''[input]''. What input would bypass authentication?",
        "options": ["A) admin'' OR ''1''=''1'' --", "B) SELECT * FROM users", "C) DROP TABLE users", "D) <script>alert(1)</script>"]
      },
      {
        "question": "Which of the following is the MOST effective defense against SQL injection?",
        "options": ["A) Input validation with a blocklist", "B) Parameterized queries / prepared statements", "C) Encoding special characters", "D) Using a web application firewall only"]
      },
      {
        "question": "What type of SQL injection returns data through error messages displayed to the user?",
        "options": ["A) Blind SQL injection", "B) Union-based SQL injection", "C) Error-based SQL injection", "D) Time-based SQL injection"]
      }
    ]
  }'::jsonb,
  '{"answers": ["A", "B", "C"]}'::jsonb,
  200,
  900,
  true
),
(
  'general',
  'Incident Response Simulation',
  'Walk through a simulated security incident from detection to containment. Practice the incident response lifecycle on a ransomware attack.',
  'simulation',
  'hard',
  '{
    "instructions": "Your organization has been hit by a ransomware attack. Multiple endpoints are encrypted and a ransom note has appeared. Walk through each phase of the incident response process.",
    "background": "Incident Response (IR) is the organized approach to addressing and managing a security breach or cyberattack. The NIST framework defines four phases: Preparation, Detection & Analysis, Containment/Eradication/Recovery, and Post-Incident Activity. Ransomware attacks have increased by over 150% in recent years.",
    "questions": [
      {
        "question": "The first reports come in at 9:15 AM — users cannot access their files and see a ransom note demanding 5 BTC. What is your FIRST action?",
        "options": ["A) Pay the ransom to restore files quickly", "B) Disconnect affected systems from the network to contain the spread", "C) Wipe all affected machines and restore from backup", "D) Send a company-wide email about the attack"]
      },
      {
        "question": "During containment, you discover the ransomware entered through a phishing email with a malicious macro attachment. Which systems should you prioritize checking?",
        "options": ["A) Only the systems that are already encrypted", "B) The email server and all systems that received the same email", "C) Only the servers", "D) External-facing web servers"]
      },
      {
        "question": "After containment and eradication, what is the most important step before bringing systems back online?",
        "options": ["A) Installing new antivirus software", "B) Verifying backups are clean and not compromised before restoration", "C) Changing all user passwords", "D) Updating the firewall rules"]
      },
      {
        "question": "During the post-incident phase, which deliverable is most critical for organizational improvement?",
        "options": ["A) A press release about the incident", "B) A lessons-learned report with timeline, root cause, and recommended improvements", "C) A list of all affected files", "D) An updated insurance policy"]
      }
    ]
  }'::jsonb,
  '{"answers": ["B", "B", "B", "B"]}'::jsonb,
  350,
  1200,
  true
),
(
  'general',
  'Password Cracking & Hash Analysis',
  'Understand common password hashing algorithms, identify weak hashes, and learn why proper hashing and salting are essential for security.',
  'quiz',
  'easy',
  '{
    "instructions": "You have been given a set of password hashes recovered during a security audit. Analyze the hashes and answer questions about password security best practices.",
    "background": "Password hashing is a critical security mechanism that converts plaintext passwords into fixed-length strings. Common algorithms include MD5, SHA-1, SHA-256, and bcrypt. Understanding the strengths and weaknesses of each algorithm is essential for implementing secure authentication systems.",
    "questions": [
      {
        "question": "You find the hash 5f4dcc3b5aa765d61d8327deb882cf99 in a database. You identify it as MD5. Why is MD5 considered insecure for password hashing?",
        "options": ["A) It produces hashes that are too short", "B) It is fast to compute, making brute-force attacks feasible, and has known collision vulnerabilities", "C) It cannot hash passwords longer than 8 characters", "D) It is an encryption algorithm, not a hashing algorithm"]
      },
      {
        "question": "What is the purpose of adding a salt to a password before hashing?",
        "options": ["A) To make the password longer", "B) To encrypt the password", "C) To ensure identical passwords produce different hashes, defeating rainbow table attacks", "D) To compress the hash output"]
      },
      {
        "question": "Which hashing algorithm is currently recommended for password storage?",
        "options": ["A) MD5", "B) SHA-1", "C) bcrypt or Argon2", "D) Base64"]
      }
    ]
  }'::jsonb,
  '{"answers": ["B", "C", "C"]}'::jsonb,
  100,
  600,
  true
);
