"use server";

import { createClient } from "@/lib/supabase/server";

export async function requireOrgManager(orgId: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: ok } = await supabase.rpc("is_org_manager", {
    uid: user.id,
    org_id: orgId,
  });
  if (!ok) throw new Error("Forbidden: not an owner or admin of this organization");
  return user.id;
}
