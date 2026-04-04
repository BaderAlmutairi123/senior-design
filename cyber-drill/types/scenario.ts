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

export interface UserProgress {
  id: string;
  user_id: string;
  scenario_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  answers: string[];
  completed_at: string;
}

export interface QuizQuestion {
  question?: string;
  text?: string;
  options: string[];
}

export interface ScenarioContent {
  instructions?: string;
  background?: string;
  questions?: QuizQuestion[];
  explanations?: string[];
}

export interface GradeResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  results: {
    questionIndex: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}
