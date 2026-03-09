"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getScenarioById,
  gradeAnswers,
  saveUserProgress,
} from "@/lib/scenarios/queries";
import type { GradeResult } from "@/types/scenario";

interface SubmitResult {
  success: boolean;
  error?: string;
  gradeResult?: GradeResult;
}

export async function submitAnswers(
  scenarioId: string,
  userAnswers: string[]
): Promise<SubmitResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  const scenario = await getScenarioById(scenarioId);
  if (!scenario) {
    return { success: false, error: "Scenario not found." };
  }

  const correctAnswersData = scenario.correct_answers as {
    answers: string[];
  };
  if (!correctAnswersData?.answers) {
    return { success: false, error: "Scenario has no answer key." };
  }

  const gradeResult = gradeAnswers(
    userAnswers,
    correctAnswersData.answers,
    scenario.points
  );

  const saved = await saveUserProgress(
    user.id,
    scenarioId,
    gradeResult.score,
    gradeResult.totalQuestions,
    gradeResult.correctCount,
    userAnswers
  );

  if (!saved) {
    return { success: false, error: "Failed to save progress." };
  }

  return { success: true, gradeResult };
}
