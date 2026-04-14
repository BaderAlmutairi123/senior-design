import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

export async function getUserRole(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return "user";
  }

  return (data as Pick<UserRole, "role">).role;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin";
}
