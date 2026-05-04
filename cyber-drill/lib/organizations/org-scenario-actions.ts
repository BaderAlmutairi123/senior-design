"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { QuizQuestion } from "@/types/scenario";

export async function createOrgScenario(
  orgId: string,
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const scenarioType = String(formData.get("scenario_type") ?? "phishing_email");
  const difficulty = String(formData.get("difficulty") ?? "beginner");
  const points = parseInt(String(formData.get("points") ?? "100"), 10);
  const timeLimit = parseInt(String(formData.get("time_limit") ?? "300"), 10);
  const instructions = String(formData.get("instructions") ?? "").trim();
  const background = String(formData.get("background") ?? "").trim();
  const questionsJson = String(formData.get("questions_json") ?? "[]");

  if (!title) return { ok: false, error: "Title is required" };
  if (!description) return { ok: false, error: "Description is required" };

  let parsedQuestions: { question: string; options: string[]; correct: string; explanation?: string }[];
  try {
    parsedQuestions = JSON.parse(questionsJson);
  } catch {
    return { ok: false, error: "Invalid questions JSON" };
  }

  const questions: QuizQuestion[] = parsedQuestions.map((q) => ({
    question: q.question,
    options: q.options,
  }));
  const correctAnswers = parsedQuestions.map((q) => q.correct);
  const explanations = parsedQuestions.map((q) => q.explanation ?? "");

  const content = {
    instructions: instructions || undefined,
    background: background || undefined,
    questions,
    explanations,
  };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_org_scenario", {
    p_org_id: orgId,
    p_title: title,
    p_description: description,
    p_scenario_type: scenarioType,
    p_difficulty: difficulty,
    p_points: points,
    p_time_limit: timeLimit,
    p_content: content,
    p_correct_answers: { answers: correctAnswers },
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/org/${orgId}`);
  revalidatePath("/scenarios");
  return { ok: true, id: data as string };
}

export async function deleteOrgScenario(
  orgId: string,
  scenarioId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_org_scenario", {
    p_org_id: orgId,
    p_scenario_id: scenarioId,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/org/${orgId}`);
  revalidatePath("/scenarios");
  return { ok: true };
}
