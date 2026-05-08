-- ─────────────────────────────────────────────────────────────────────────
-- Fix: missing get_user_emails RPC function
--
-- getOrganizationMembers() and admin queries call supabase.rpc("get_user_emails")
-- to resolve UUIDs → email addresses, but this function was never defined.
-- When the RPC fails silently, the fallback path stores a truncated UUID
-- (user_id.slice(0,8)+"...") as recipient_email, breaking phishing campaign
-- delivery and the recipient display in the UI.
--
-- This function is SECURITY DEFINER so it can read auth.users regardless of
-- the caller's role. It is restricted to authenticated users only.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function get_user_emails(uids uuid[])
returns table(user_id uuid, email text)
language sql
security definer
set search_path = public
as $$
  select id as user_id, email
  from auth.users
  where id = any(uids);
$$;

-- Only authenticated users may call this function
revoke all on function get_user_emails(uuid[]) from public;
grant execute on function get_user_emails(uuid[]) to authenticated;
