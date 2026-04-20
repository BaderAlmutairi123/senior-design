import Link from "next/link";
import ScenarioForm from "./ScenarioForm";

export default function NewScenarioPage() {
  return (
    <>
      <div className="mb-8">
        <Link
          href="/admin/scenarios"
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] hover:text-[var(--cd-tertiary)] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Scenarios
        </Link>
        <h1 className="font-headline font-bold text-4xl tracking-tighter text-[var(--cd-on-surface)]">
          Create Scenario
        </h1>
        <p className="mt-2 text-sm text-[var(--cd-on-surface-variant)]">
          Build a custom social-engineering training scenario with quiz questions.
        </p>
      </div>

      <ScenarioForm />
    </>
  );
}
