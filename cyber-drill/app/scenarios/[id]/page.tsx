import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getScenarioById, getUserProgress } from "@/lib/scenarios/queries";
import Link from "next/link";
import QuizClient from "./QuizClient";
import AppShell from "@/components/layout/AppShell";
import type { QuizQuestion } from "@/types/scenario";

const difficultyConfig = {
  beginner: { color: "text-[#a2f31f]", border: "border-[#a2f31f]", bg: "bg-[#a2f31f]/10", label: "Beginner" },
  intermediate: { color: "text-[#8ff5ff]", border: "border-[#8ff5ff]", bg: "bg-[#8ff5ff]/10", label: "Intermediate" },
  advanced: { color: "text-[#d873ff]", border: "border-[#d873ff]", bg: "bg-[#d873ff]/10", label: "Advanced" },
} as const;

const typeIcons: Record<string, string> = {
  phishing_email: "mail",
  vishing: "call",
  smishing: "sms",
  pretexting: "person_search",
  baiting: "usb",
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}

export default async function ScenarioViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const scenario = await getScenarioById(id);

  if (!scenario) {
    notFound();
  }

  const content = scenario.content as {
    instructions?: string;
    background?: string;
    questions?: QuizQuestion[];
    explanations?: string[];
  };
  const diff = difficultyConfig[scenario.difficulty];
  const questions = (content.questions as QuizQuestion[]) || [];
  const correctAnswersData = (
    scenario.correct_answers as { answers: string[] }
  )?.answers || [];
  const existingProgress = await getUserProgress(user.id, scenario.id);
  const icon = typeIcons[scenario.scenario_type] || "security";

  return (
    <AppShell email={user.email || ""} activePath="/scenarios">
      {/* Header Status HUD */}
      <header className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div className="space-y-1">
          <Link
            href="/scenarios"
            className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#aaabb0] hover:text-[#8ff5ff] transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Drills
          </Link>
          <h1 className="text-3xl font-headline font-bold tracking-tighter text-[#f6f6fc]">
            {scenario.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#aaabb0]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#a2f31f] animate-pulse"></span>
              Active
            </span>
            <span className="text-[#46484d]">|</span>
            <span className={diff.color}>{scenario.difficulty}</span>
            <span className="text-[#46484d]">|</span>
            <span>{scenario.points} pts</span>
          </div>
        </div>

        {/* Integrity/Timer HUD */}
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-[10px] uppercase font-headline tracking-widest text-[#aaabb0]">
            <span>Time Limit</span>
            <span className={diff.color}>{formatTime(scenario.time_limit_seconds)}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 ${i < 6 ? `bg-[${scenario.difficulty === 'beginner' ? '#a2f31f' : scenario.difficulty === 'intermediate' ? '#8ff5ff' : '#d873ff'}]` : 'bg-[#23262c]'}`}
                style={{ backgroundColor: i < 6 ? (scenario.difficulty === 'beginner' ? '#a2f31f' : scenario.difficulty === 'intermediate' ? '#8ff5ff' : '#d873ff') : '#23262c' }}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Terminal Workspace */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          {/* Terminal Window */}
          <div className="relative bg-[#000000] border border-[#8ff5ff]/10 chamfer-top-right shadow-2xl overflow-hidden">
            {/* Terminal Header */}
            <div className="h-10 bg-[#171a1f] flex items-center px-4 justify-between border-b border-[#8ff5ff]/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff716c]/20 border border-[#ff716c]/40"></div>
                <div className="w-3 h-3 rounded-full bg-[#d873ff]/20 border border-[#d873ff]/40"></div>
                <div className="w-3 h-3 rounded-full bg-[#a2f31f]/20 border border-[#a2f31f]/40"></div>
              </div>
              <span className="font-mono text-[10px] tracking-widest text-[#aaabb0]">Terminal</span>
              <div className="w-12"></div>
            </div>

            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none scanline opacity-30"></div>

            {/* Content */}
            <div className="p-8 font-mono text-sm leading-relaxed relative z-10">
              {content.instructions && (
                <div className="mb-6">
                  <span className="text-[#a2f31f]">root@sovereign:~$</span>{" "}
                  <span className="text-[#f6f6fc]">cat mission_briefing.txt</span>
                  <div className="mt-3 p-6 bg-[#8ff5ff]/5 border-l-2 border-[#8ff5ff]/40">
                    <h2 className="text-[#8ff5ff] font-headline text-lg mb-3 tracking-wide uppercase">Mission Briefing</h2>
                    <p className="text-[#f6f6fc] text-base font-sans leading-relaxed">
                      {content.instructions}
                    </p>
                  </div>
                </div>
              )}

              {content.background && (
                <div className="mb-6">
                  <span className="text-[#a2f31f]">root@sovereign:~$</span>{" "}
                  <span className="text-[#f6f6fc]">cat intel_report.txt</span>
                  <div className="mt-3 p-6 bg-[#d873ff]/5 border-l-2 border-[#d873ff]/40">
                    <h2 className="text-[#d873ff] font-headline text-lg mb-3 tracking-wide uppercase">Intelligence Report</h2>
                    <p className="text-[#aaabb0] text-base font-sans leading-relaxed">
                      {content.background}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Quiz */}
          {questions.length > 0 && (
            <QuizClient
              scenarioId={scenario.id}
              questions={questions}
              maxPoints={scenario.points}
              existingProgress={existingProgress}
              correctAnswersData={correctAnswersData}
              explanations={content.explanations}
            />
          )}
        </section>

        {/* Sidebar HUD */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          {/* Score & Points */}
          <div className="bg-[#111318] p-6 border-l-2 border-[#d873ff]/40 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-headline tracking-[0.2em] text-[#aaabb0]">Max Points</p>
                <p className="text-3xl font-mono text-[#a2f31f] font-bold">{scenario.points}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-headline tracking-[0.2em] text-[#aaabb0]">Questions</p>
                <p className="text-3xl font-mono text-[#8ff5ff] font-bold">{questions.length}</p>
              </div>
            </div>

            {/* Threat Level Gauge */}
            <div className="relative w-full aspect-square max-w-[180px] mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle className="text-[#23262c]" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="6" />
                <circle
                  className={diff.color}
                  cx="50" cy="50" fill="none" r="45"
                  stroke="currentColor" strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={scenario.difficulty === 'beginner' ? '200' : scenario.difficulty === 'intermediate' ? '120' : '60'}
                  style={{ filter: `drop-shadow(0 0 8px ${scenario.difficulty === 'beginner' ? '#a2f31f' : scenario.difficulty === 'intermediate' ? '#8ff5ff' : '#d873ff'})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl mb-1" style={{ color: scenario.difficulty === 'beginner' ? '#a2f31f' : scenario.difficulty === 'intermediate' ? '#8ff5ff' : '#d873ff' }}>
                  {scenario.difficulty === 'advanced' ? 'warning' : scenario.difficulty === 'intermediate' ? 'shield' : 'verified'}
                </span>
                <span className="text-[10px] font-mono text-[#aaabb0] uppercase">Threat Level</span>
                <span className="text-sm font-bold text-[#f6f6fc] uppercase">{scenario.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Scenario Info */}
          <div className="bg-[#111318] p-6 space-y-4">
            <h3 className="font-headline font-bold uppercase tracking-widest text-sm text-[#aaabb0]">Mission Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#000000] border border-[#23262c]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#8ff5ff] text-sm">{icon}</span>
                  <span className="text-xs font-mono">TYPE</span>
                </div>
                <span className="text-[10px] text-[#8ff5ff] font-bold uppercase">{scenario.scenario_type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#000000] border border-[#23262c]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#a2f31f] text-sm">timer</span>
                  <span className="text-xs font-mono">TIME</span>
                </div>
                <span className="text-[10px] text-[#a2f31f] font-bold">{formatTime(scenario.time_limit_seconds)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#000000] border border-[#23262c]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#d873ff] text-sm">bolt</span>
                  <span className="text-xs font-mono">POINTS</span>
                </div>
                <span className="text-[10px] text-[#d873ff] font-bold">{scenario.points} PTS</span>
              </div>
              {existingProgress && (
                <div className="flex items-center justify-between p-3 bg-[#a2f31f]/5 border border-[#a2f31f]/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#a2f31f] text-sm">check_circle</span>
                    <span className="text-xs font-mono">SCORE</span>
                  </div>
                  <span className="text-[10px] text-[#a2f31f] font-bold">{existingProgress.score}/{scenario.points}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {existingProgress && (
              <Link
                href={`/feedback/${scenario.id}`}
                className="block w-full py-3 bg-[#8ff5ff]/10 border border-[#8ff5ff]/20 text-[#8ff5ff] font-headline text-xs uppercase tracking-widest text-center hover:bg-[#8ff5ff] hover:text-[#005d63] transition-all"
              >
                View Feedback Report
              </Link>
            )}
            <Link
              href="/scenarios"
              className="block w-full py-3 bg-[#1d2025] border border-[#23262c] text-[#aaabb0] font-headline text-xs uppercase tracking-widest text-center hover:border-[#8ff5ff]/30 hover:text-[#f6f6fc] transition-all"
            >
              Back to Drills
            </Link>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
