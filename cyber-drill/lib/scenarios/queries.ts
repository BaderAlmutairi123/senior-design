import { createClient } from "@/lib/supabase/server";
import type { Scenario, UserProgress, GradeResult } from "@/types/scenario";

export async function getScenarios(): Promise<Scenario[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("is_active", true)
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

export async function getUserProgress(
  userId: string,
  scenarioId: string
): Promise<UserProgress | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("scenario_id", scenarioId)
    .single();

  if (error) {
    return null;
  }

  return data as UserProgress;
}

export async function getAllUserProgress(
  userId: string
): Promise<UserProgress[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user progress:", error.message);
    return [];
  }

  return data as UserProgress[];
}

export async function getUserStats(userId: string) {
  const supabase = await createClient();

  const [scenarioResult, progressResult] = await Promise.all([
    supabase
      .from("scenarios")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("user_progress")
      .select("score")
      .eq("user_id", userId),
  ]);

  const totalScenarios = scenarioResult.count ?? 0;
  const progressData = progressResult.data ?? [];
  const completed = progressData.length;
  const totalPoints = progressData.reduce((sum, row) => sum + row.score, 0);

  return { totalScenarios, completed, totalPoints };
}

export function gradeAnswers(
  userAnswers: string[],
  correctAnswers: string[],
  maxPoints: number
): GradeResult {
  const totalQuestions = correctAnswers.length;
  let correctCount = 0;

  const results = correctAnswers.map((correct, index) => {
    const userAnswer = userAnswers[index] || "";
    const isCorrect =
      userAnswer.trim().toUpperCase() === correct.trim().toUpperCase();
    if (isCorrect) correctCount++;
    return {
      questionIndex: index,
      userAnswer,
      correctAnswer: correct,
      isCorrect,
    };
  });

  const score =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * maxPoints)
      : 0;

  return { score, totalQuestions, correctCount, results };
}

export async function saveUserProgress(
  userId: string,
  scenarioId: string,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  answers: string[]
): Promise<UserProgress | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: userId,
        scenario_id: scenarioId,
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        answers,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,scenario_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error saving user progress:", error.message);
    return null;
  }

  return data as UserProgress;
}
