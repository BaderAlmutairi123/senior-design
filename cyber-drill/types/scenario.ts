export interface Scenario {
  id: string;
  course_id: string;
  title: string;
  description: string;
  scenario_type: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  content: Record<string, unknown>;
  correct_answers: Record<string, unknown>;
  points: number;
  time_limit_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
