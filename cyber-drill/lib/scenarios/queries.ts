import { createClient } from "@/lib/supabase/server";
import type { Scenario } from "@/types/scenario";

export async function getScenarios(): Promise<Scenario[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching scenarios:", error.message);
    return [];
  }

  return data as Scenario[];
}

export async function getScenarioById(
  id: string
): Promise<Scenario | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching scenario:", error.message);
    return null;
  }

  return data as Scenario;
}
