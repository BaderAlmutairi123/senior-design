"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type OnboardResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireAuth(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
}

export async function onboardStandalone(): Promise<void> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.rpc("onboard_standalone");
  if (error) throw new Error(error.message);

  redirect("/");
}

export async function onboardAsOrgMember(
  inviteCode: string
): Promise<OnboardResult> {
  await requireAuth();
  const supabase = await createClient();

  const code = inviteCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Please enter an invite code" };

  const { error } = await supabase.rpc("onboard_as_org_member", {
    invite_code: code,
  });

  if (error) {
    const msg = error.message ?? "Failed to join organization";
    if (msg.includes("Invalid or expired")) {
      return {
        ok: false,
        error: "Invalid or expired invite code. Ask your admin for a new one.",
      };
    }
    return { ok: false, error: msg };
  }

  return { ok: true };
}

export async function onboardAsAdmin(
  orgName: string
): Promise<OnboardResult> {
  await requireAuth();
  const supabase = await createClient();

  const name = orgName.trim();
  if (!name) return { ok: false, error: "Organization name is required" };

  const { error } = await supabase.rpc("onboard_as_admin", {
    org_name: name,
  });

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function checkOnboardStatus(): Promise<{
  onboarded: boolean;
  role: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data } = await supabase
    .from("user_roles")
    .select("role, onboarded")
    .eq("user_id", user.id)
    .single();

  return {
    onboarded: data?.onboarded ?? false,
    role: data?.role ?? "user",
  };
}
