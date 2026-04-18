import { createClient } from "@/lib/supabase/server";
import type {
  Organization,
  OrganizationMember,
  OrganizationScenario,
} from "@/types/auth";

export interface OrganizationWithCounts extends Organization {
  member_count: number;
  scenario_count: number;
}

export async function getOrganizations(): Promise<OrganizationWithCounts[]> {
  const supabase = await createClient();
  const { data: orgs, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !orgs) return [];

  const orgIds = orgs.map((o) => o.id);
  if (orgIds.length === 0) return [];

  const [membersRes, scenariosRes] = await Promise.all([
    supabase
      .from("user_organizations")
      .select("organization_id")
      .in("organization_id", orgIds),
    supabase
      .from("organization_scenarios")
      .select("organization_id")
      .in("organization_id", orgIds),
  ]);

  const memberCounts = new Map<string, number>();
  for (const row of membersRes.data ?? []) {
    memberCounts.set(
      row.organization_id,
      (memberCounts.get(row.organization_id) ?? 0) + 1
    );
  }

  const scenarioCounts = new Map<string, number>();
  for (const row of scenariosRes.data ?? []) {
    scenarioCounts.set(
      row.organization_id,
      (scenarioCounts.get(row.organization_id) ?? 0) + 1
    );
  }

  return orgs.map((o) => ({
    ...(o as Organization),
    member_count: memberCounts.get(o.id) ?? 0,
    scenario_count: scenarioCounts.get(o.id) ?? 0,
  }));
}

export async function getOrganizationById(
  id: string
): Promise<Organization | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as Organization;
}

export async function getOrganizationMembers(
  orgId: string
): Promise<OrganizationMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_organizations")
    .select("user_id, role, joined_at")
    .eq("organization_id", orgId)
    .order("joined_at", { ascending: true });

  if (error || !data) return [];

  const userIds = data.map((d) => d.user_id);
  if (userIds.length === 0) return [];

  // Use the SECURITY DEFINER helper to resolve emails
  const { data: emailsData } = await supabase.rpc("get_user_emails", {
    uids: userIds,
  });

  const emailMap = new Map<string, string>();
  for (const row of (emailsData ?? []) as { user_id: string; email: string }[]) {
    emailMap.set(row.user_id, row.email);
  }

  return data.map((row) => ({
    user_id: row.user_id,
    email: emailMap.get(row.user_id) ?? row.user_id.slice(0, 8) + "...",
    role: row.role as OrganizationMember["role"],
    joined_at: row.joined_at,
  }));
}

export async function getOrganizationScenarioIds(
  orgId: string
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_scenarios")
    .select("scenario_id")
    .eq("organization_id", orgId);
  if (error || !data) return [];
  return data.map((d) => d.scenario_id);
}

export async function getOrganizationScenarioAssignments(
  orgId: string
): Promise<OrganizationScenario[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_scenarios")
    .select("*")
    .eq("organization_id", orgId)
    .order("assigned_at", { ascending: false });
  if (error || !data) return [];
  return data as OrganizationScenario[];
}

export async function getUserOrganizations(
  userId: string
): Promise<Array<Organization & { role: "owner" | "admin" | "member" }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_organizations")
    .select("role, organization_id, organizations(*)")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data
    .map((row: unknown) => {
      const r = row as {
        role: "owner" | "admin" | "member";
        organizations: Organization | null;
      };
      if (!r.organizations) return null;
      return { ...r.organizations, role: r.role };
    })
    .filter((v): v is Organization & { role: "owner" | "admin" | "member" } =>
      v !== null
    );
}

export async function getAssignedScenarioIdsForUser(
  userId: string
): Promise<Set<string>> {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("user_organizations")
    .select("organization_id")
    .eq("user_id", userId);

  const orgIds = (memberships ?? []).map((m) => m.organization_id);
  if (orgIds.length === 0) return new Set();

  const { data: assignments } = await supabase
    .from("organization_scenarios")
    .select("scenario_id")
    .in("organization_id", orgIds);

  return new Set((assignments ?? []).map((a) => a.scenario_id));
}
