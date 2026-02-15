-- Create the scenarios table
create table if not exists public.scenarios (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  category text not null,
  content text not null,
  objectives text[] default '{}',
  estimated_duration integer not null default 30,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.scenarios enable row level security;

-- Allow authenticated users to read scenarios
create policy "Authenticated users can read scenarios"
  on public.scenarios
  for select
  to authenticated
  using (true);

-- Insert sample scenarios for testing
insert into public.scenarios (title, description, difficulty, category, content, objectives, estimated_duration) values
(
  'Phishing Email Detection',
  'Learn to identify and analyze phishing emails targeting corporate employees.',
  'easy',
  'Phishing',
  'In this scenario, you will be presented with a series of emails. Your task is to determine which emails are legitimate and which are phishing attempts.

Step 1: Examine the sender address carefully. Look for misspellings or unusual domains.

Step 2: Check for urgency language designed to pressure you into acting quickly.

Step 3: Hover over any links (without clicking) to verify the actual destination URL.

Step 4: Look for grammatical errors and inconsistencies in branding.

Step 5: Verify any requests through an alternate communication channel before taking action.',
  ARRAY['Identify common phishing indicators', 'Analyze email headers for suspicious origins', 'Recognize social engineering tactics', 'Apply safe email handling procedures'],
  20
),
(
  'Network Intrusion Analysis',
  'Analyze network traffic logs to detect and trace an unauthorized intrusion.',
  'medium',
  'Network Security',
  'You are a security analyst investigating a potential breach. Network monitoring has flagged unusual traffic patterns on the corporate network.

Step 1: Review the provided packet capture (PCAP) logs for anomalous connections.

Step 2: Identify the source IP addresses involved in suspicious communications.

Step 3: Determine what protocols are being used and whether the traffic is encrypted.

Step 4: Trace the lateral movement of the attacker across internal systems.

Step 5: Document the timeline of the intrusion and recommend containment actions.',
  ARRAY['Read and interpret network traffic logs', 'Identify indicators of compromise in network data', 'Trace attacker movement through a network', 'Recommend appropriate incident response actions'],
  45
),
(
  'Ransomware Incident Response',
  'Respond to an active ransomware attack on a simulated corporate environment.',
  'hard',
  'Incident Response',
  'A ransomware attack has been detected on multiple workstations in the finance department. As the incident response lead, you must coordinate the containment and recovery effort.

Step 1: Isolate affected systems from the network to prevent further spread.

Step 2: Identify the ransomware variant using available indicators of compromise.

Step 3: Determine the attack vector — how did the ransomware gain initial access?

Step 4: Assess the scope of the damage and which systems and data are affected.

Step 5: Develop a recovery plan using available backups and restoration procedures.

Step 6: Document the incident and prepare a post-incident report with lessons learned.',
  ARRAY['Execute immediate containment procedures', 'Identify ransomware variants and attack vectors', 'Coordinate a multi-team incident response', 'Develop and execute a recovery plan', 'Produce a post-incident report'],
  60
);
