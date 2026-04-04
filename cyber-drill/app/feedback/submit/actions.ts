"use server";

import { createClient } from "@/lib/supabase/server";

interface SubmitFeedbackResult {
  success: boolean;
  error?: string;
}

export async function submitFeedback(
  scenarioId: string | null,
  rating: number,
  category: string,
  message: string
): Promise<SubmitFeedbackResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5." };
  }

  if (!message.trim()) {
    return { success: false, error: "Please provide a message." };
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    scenario_id: scenarioId || null,
    rating,
    category,
    message: message.trim(),
  });

  if (error) {
    console.error("Error saving feedback:", error.message);
    return { success: false, error: "Failed to save feedback. Please try again." };
  }

  return { success: true };
}
