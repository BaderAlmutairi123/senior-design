"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type OnboardResult =
  | { ok: true }
  | { ok: false; error: string };

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function onboardStandalone(): Promise<void> {
  const userId = await getAuthUserId();
  const supabase = await createClient();

  await supabase
    .from("user_roles")
    .update({ onboarded: true })
    .eq("user_id", userId);

  redirect("/");
}

export async function onboardAsOrgMember(
  inviteCode: string
): Promise<OnboardResult> {
  const userId = await getAuthUserId();
  const supabase = await createClient();

  const code = inviteCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Please enter an invite code" };

  // Validate and consume the invite code via the SECURITY DEFINER helper
  const { data: orgId, error: rpcError } = await supabase.rpc(
    "redeem_invite_code",
    { invite_code: code }
  );

  if (rpcError) return { ok: false, error: rpcError.message };
  if (!orgId) {
    return {
      ok: false,
      error: "Invalid or expired invite code. Ask your admin for a new one.",
    };
  }

  // Add user to org
  const { error: joinError } = await supabase
    .from("user_organizations")
    .insert({
      user_id: userId,
      organization_id: orgId as string,
      role: "member",
    });

  if (joinError) {
    if (joinError.code === "23505") {
      return { ok: false, error: "You are already a member of this organization" };
    }
    return { ok: false, error: joinError.message };
  }

  // Mark onboarded
  await supabase
    .from("user_roles")
    .update({ onboarded: true })
    .eq("user_id", userId);

  return { ok: true };
}

export async function onboardAsAdmin(
  orgName: string
): Promise<OnboardResult> {
  const userId = await getAuthUserId();
  const supabase = await createClient();

  const name = orgName.trim();
  if (!name) return { ok: false, error: "Organization name is required" };

  // Upgrade role to admin
  const { error: roleError } = await supabase
    .from("user_roles")
    .update({ role: "admin", onboarded: true })
    .eq("user_id", userId);

  if (roleError) return { ok: false, error: roleError.message };

  // Create the org
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64) || "org";

  // De-duplicate slug
  let finalSlug = slug;
  let suffix = 1;
  for (let i = 0; i < 20; i++) {
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();
    if (!existing) break;
    suffix += 1;
    finalSlug = `${slug}-${suffix}`;
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      slug: finalSlug,
      created_by: userId,
    })
    .select("id")
    .single();

  if (orgError) return { ok: false, error: orgError.message };

  // Add creator as org owner
  await supabase
    .from("user_organizations")
    .insert({
      user_id: userId,
      organization_id: org.id,
      role: "owner",
    });

  return { ok: true };
}

export async function checkOnboardStatus(): Promise<{
  onboarded: boolean;
  role: string;
}> {
  const userId = await getAuthUserId();
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_roles")
    .select("role, onboarded")
    .eq("user_id", userId)
    .single();

  return {
    onboarded: data?.onboarded ?? false,
    role: data?.role ?? "user",
  };
}
