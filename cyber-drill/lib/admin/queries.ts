import { createClient } from "@/lib/supabase/server";

export interface AdminStats {
  totalUsers: number;
  totalScenarios: number;
  totalCompletions: number;
  totalFeedback: number;
}

export interface ActivityEntry {
  user_id: string;
  user_email: string;
  scenario_title: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

export interface ScenarioCompletionStat {
  id: string;
  title: string;
  difficulty: string;
  completions: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [usersRes, scenariosRes, completionsRes, feedbackRes] =
    await Promise.all([
      supabase.from("user_roles").select("id", { count: "exact", head: true }),
      supabase
        .from("scenarios")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("user_progress")
        .select("id", { count: "exact", head: true }),
      supabase.from("feedback").select("id", { count: "exact", head: true }),
    ]);

  return {
    totalUsers: usersRes.count ?? 0,
    totalScenarios: scenariosRes.count ?? 0,
    totalCompletions: completionsRes.count ?? 0,
    totalFeedback: feedbackRes.count ?? 0,
  };
}

export async function getRecentActivity(
  limit: number = 5
): Promise<ActivityEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_progress")
    .select("user_id, score, total_questions, completed_at, scenario_id")
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  // Fetch scenario titles and user emails for each entry
  const scenarioIds = [...new Set(data.map((d) => d.scenario_id))];
  const userIds = [...new Set(data.map((d) => d.user_id))];

  const [scenariosRes, rolesRes] = await Promise.all([
    supabase.from("scenarios").select("id, title").in("id", scenarioIds),
    supabase
      .from("user_roles")
      .select("user_id")
      .in("user_id", userIds),
  ]);

  const scenarioMap = new Map(
    (scenariosRes.data ?? []).map((s) => [s.id, s.title])
  );

  // We can't directly query auth.users from client — use user_id as fallback
  return data.map((row) => ({
    user_id: row.user_id,
    user_email: row.user_id.slice(0, 8) + "...",
    scenario_title: scenarioMap.get(row.scenario_id) ?? "Unknown",
    score: row.score,
    total_questions: row.total_questions,
    completed_at: row.completed_at,
  }));
}

export async function getScenarioCompletionStats(): Promise<
  ScenarioCompletionStat[]
> {
  const supabase = await createClient();

  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("id, title, difficulty")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!scenarios) return [];

  const { data: progress } = await supabase
    .from("user_progress")
    .select("scenario_id");

  const countMap = new Map<string, number>();
  for (const p of progress ?? []) {
    countMap.set(p.scenario_id, (countMap.get(p.scenario_id) ?? 0) + 1);
  }

  return scenarios.map((s) => ({
    id: s.id,
    title: s.title,
    difficulty: s.difficulty,
    completions: countMap.get(s.id) ?? 0,
  }));
}
