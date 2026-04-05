import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getScenarios } from "@/lib/scenarios/queries";
import AppShell from "@/components/layout/AppShell";
import FeedbackForm from "./FeedbackForm";

export default async function FeedbackSubmitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const scenarios = await getScenarios();
  const scenarioOptions = scenarios.map((s) => ({ id: s.id, title: s.title }));

  return (
    <AppShell email={user.email || ""} activePath="/feedback/submit">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="font-headline font-bold text-4xl tracking-tighter text-[#f6f6fc]">
          OPERATOR_FEEDBACK
        </h1>
        <p className="mt-2 font-mono text-sm text-[#aaabb0] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#d873ff] block"></span>
          SYSTEM_STATUS: FEEDBACK_COLLECTION // UID: {user.email}
        </p>
      </div>

      <div className="max-w-2xl">
        <FeedbackForm scenarios={scenarioOptions} />
      </div>
    </AppShell>
  );
}
