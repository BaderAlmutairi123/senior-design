"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { QuizQuestion } from "@/types/scenario";

async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const admin = await isAdmin(user.id);
  if (!admin) throw new Error("Forbidden");
  return user.id;
}

export async function createScenario(formData: FormData): Promise<void> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const scenarioType = String(formData.get("scenario_type") ?? "phishing_email");
  const difficulty = String(formData.get("difficulty") ?? "beginner");
  const points = parseInt(String(formData.get("points") ?? "100"), 10);
  const timeLimit = parseInt(String(formData.get("time_limit") ?? "300"), 10);
  const instructions = String(formData.get("instructions") ?? "").trim();
  const background = String(formData.get("background") ?? "").trim();
  const questionsJson = String(formData.get("questions_json") ?? "[]");

  if (!title) throw new Error("Title is required");
  if (!description) throw new Error("Description is required");

  let parsedQuestions: { question: string; options: string[]; correct: string; explanation?: string }[];
  try {
    parsedQuestions = JSON.parse(questionsJson);
  } catch {
    throw new Error("Invalid questions JSON");
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
  const { error } = await supabase.from("scenarios").insert({
    title,
    description,
    scenario_type: scenarioType,
    difficulty,
    points,
    time_limit_seconds: timeLimit,
    content,
    correct_answers: { answers: correctAnswers },
    is_active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/scenarios");
  revalidatePath("/scenarios");
  redirect("/admin/scenarios");
}

export async function toggleScenarioActive(
  scenarioId: string,
  isActive: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("scenarios")
    .update({ is_active: isActive })
    .eq("id", scenarioId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/scenarios");
  revalidatePath("/scenarios");
  return { ok: true };
}

export async function deleteScenario(
  scenarioId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("scenarios")
    .delete()
    .eq("id", scenarioId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/scenarios");
  revalidatePath("/scenarios");
  return { ok: true };
}
