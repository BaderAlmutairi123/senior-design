export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  content: string;
  objectives: string[];
  estimated_duration: number;
  created_at: string;
}
