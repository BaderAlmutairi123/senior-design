"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

async function requirePlatformAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const admin = await isAdmin(user.id);
  if (!admin) throw new Error("Forbidden");
  return user.id;
}

export async function createOrganization(formData: FormData): Promise<void> {
  const adminId = await requirePlatformAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name) throw new Error("Name is required");

  const supabase = await createClient();
  const baseSlug = slugify(name) || "org";

  // Try baseSlug, then baseSlug-2, baseSlug-3... until unique
  let slug = baseSlug;
  let suffix = 1;
  for (let i = 0; i < 20; i++) {
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name,
      slug,
      description,
      created_by: adminId,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create organization");
  }

  revalidatePath("/admin/organizations");
  redirect(`/admin/organizations/${data.id}`);
}

export async function deleteOrganization(orgId: string): Promise<void> {
  await requirePlatformAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/organizations");
  redirect("/admin/organizations");
}

export async function addMemberByEmail(
  orgId: string,
  email: string,
  role: "owner" | "admin" | "member" = "member"
): Promise<ActionResult> {
  try {
    await requirePlatformAdmin();
  } catch {
    return { ok: false, error: "Forbidden" };
  }
  const cleanedEmail = email.trim().toLowerCase();
  if (!cleanedEmail) return { ok: false, error: "Email is required" };

  const supabase = await createClient();

  const { data: uid, error: rpcError } = await supabase.rpc(
    "find_user_id_by_email",
    { lookup_email: cleanedEmail }
  );

  if (rpcError) return { ok: false, error: rpcError.message };
  if (!uid) {
    return {
      ok: false,
      error: `No user found with email ${cleanedEmail}. They must sign up first.`,
    };
  }

  const { error: insertError } = await supabase
    .from("user_organizations")
    .insert({
      user_id: uid as string,
      organization_id: orgId,
      role,
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return { ok: false, error: "User is already a member of this org" };
    }
    return { ok: false, error: insertError.message };
  }

  revalidatePath(`/admin/organizations/${orgId}`);
  return { ok: true, message: `Added ${cleanedEmail} to the organization` };
}

export async function removeMember(
  orgId: string,
  userId: string
): Promise<ActionResult> {
  try {
    await requirePlatformAdmin();
  } catch {
    return { ok: false, error: "Forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_organizations")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { ok: true };
}

export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: "owner" | "admin" | "member"
): Promise<ActionResult> {
  try {
    await requirePlatformAdmin();
  } catch {
    return { ok: false, error: "Forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_organizations")
    .update({ role })
    .eq("organization_id", orgId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { ok: true };
}

export async function assignScenarioToOrg(
  orgId: string,
  scenarioId: string
): Promise<ActionResult> {
  let adminId: string;
  try {
    adminId = await requirePlatformAdmin();
  } catch {
    return { ok: false, error: "Forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_scenarios")
    .insert({
      organization_id: orgId,
      scenario_id: scenarioId,
      assigned_by: adminId,
    });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Scenario already assigned" };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath(`/admin/organizations/${orgId}`);
  return { ok: true };
}

export async function unassignScenarioFromOrg(
  orgId: string,
  scenarioId: string
): Promise<ActionResult> {
  try {
    await requirePlatformAdmin();
  } catch {
    return { ok: false, error: "Forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_scenarios")
    .delete()
    .eq("organization_id", orgId)
    .eq("scenario_id", scenarioId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { ok: true };
}

function generateCode(length: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  for (const byte of arr) {
    code += chars[byte % chars.length];
  }
  return code;
}

export async function createInviteCode(
  orgId: string,
  maxUses: number = 0,
  expiresInDays: number = 0
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  let adminId: string;
  try {
    adminId = await requirePlatformAdmin();
  } catch {
    return { ok: false, error: "Forbidden" };
  }

  const supabase = await createClient();
  const code = generateCode();
  const expiresAt =
    expiresInDays > 0
      ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
      : null;

  const { error } = await supabase.from("organization_invites").insert({
    organization_id: orgId,
    code,
    created_by: adminId,
    max_uses: maxUses,
    expires_at: expiresAt,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { ok: true, code };
}

export async function deactivateInviteCode(
  inviteId: string,
  orgId: string
): Promise<ActionResult> {
  try {
    await requirePlatformAdmin();
  } catch {
    return { ok: false, error: "Forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_invites")
    .update({ is_active: false })
    .eq("id", inviteId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { ok: true };
}
