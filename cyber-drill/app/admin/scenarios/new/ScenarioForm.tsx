"use client";

import { useState, useRef } from "react";
import { createScenario } from "@/lib/admin/scenario-actions";

interface QuestionDraft {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

const emptyQuestion: QuestionDraft = {
  question: "",
  options: ["A) ", "B) ", "C) ", "D) "],
  correct: "A",
  explanation: "",
};

export default function ScenarioForm() {
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { ...emptyQuestion },
  ]);
  const formRef = useRef<HTMLFormElement>(null);

  function addQuestion() {
    setQuestions((prev) => [...prev, { ...emptyQuestion }]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: keyof QuestionDraft, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  }

  function updateOption(qIndex: number, optIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const opts = [...q.options];
        opts[optIndex] = value;
        return { ...q, options: opts };
      })
    );
  }

  function handleSubmit(formData: FormData) {
    formData.set("questions_json", JSON.stringify(questions));
    createScenario(formData);
  }

  const inputClass =
    "w-full rounded-md border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface)] px-4 py-2.5 text-sm text-[var(--cd-on-surface)] placeholder:text-[var(--cd-on-surface-variant)]/40 focus:border-[var(--cd-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--cd-tertiary)]";

  return (
    <form ref={formRef} action={handleSubmit} className="max-w-3xl space-y-8">
      {/* Basic info */}
      <section className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-6 space-y-5">
        <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-[var(--cd-on-surface)]">
          Basic Information
        </h2>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
            Title
          </label>
          <input
            name="title"
            required
            maxLength={200}
            placeholder="e.g. CEO Impersonation Phishing Attack"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
            Description
          </label>
          <textarea
            name="description"
            required
            rows={2}
            maxLength={500}
            placeholder="Brief description of the scenario..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
              Type
            </label>
            <select name="scenario_type" className={inputClass}>
              <option value="phishing_email">Phishing Email</option>
              <option value="vishing">Vishing (Voice)</option>
              <option value="smishing">Smishing (SMS)</option>
              <option value="pretexting">Pretexting</option>
              <option value="baiting">Baiting</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
              Difficulty
            </label>
            <select name="difficulty" className={inputClass}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
              Points
            </label>
            <input
              name="points"
              type="number"
              min={10}
              max={1000}
              defaultValue={100}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
              Time Limit (seconds)
            </label>
            <input
              name="time_limit"
              type="number"
              min={30}
              max={3600}
              defaultValue={300}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Context */}
      <section className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-6 space-y-5">
        <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-[var(--cd-on-surface)]">
          Scenario Context
        </h2>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
            Instructions / Briefing
          </label>
          <textarea
            name="instructions"
            rows={3}
            placeholder="Describe the scenario situation the trainee will face..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
            Background Information
          </label>
          <textarea
            name="background"
            rows={3}
            placeholder="Additional context about the attack or technique..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </section>

      {/* Questions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-[var(--cd-on-surface)]">
            Questions ({questions.length})
          </h2>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-1 rounded-md bg-[var(--cd-tertiary)]/15 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--cd-tertiary)] hover:bg-[var(--cd-tertiary)]/25 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Question
          </button>
        </div>

        {questions.map((q, qi) => (
          <div
            key={qi}
            className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                Question {qi + 1}
              </span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[#ff716c] hover:text-[#ff716c]/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    delete
                  </span>
                  Remove
                </button>
              )}
            </div>

            <input
              value={q.question}
              onChange={(e) => updateQuestion(qi, "question", e.target.value)}
              placeholder="What is the question?"
              required
              className={inputClass}
            />

            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--cd-on-surface-variant)] w-4">
                    {String.fromCharCode(65 + oi)})
                  </span>
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    required
                    className={`${inputClass} flex-1`}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
                  Correct Answer
                </label>
                <select
                  value={q.correct}
                  onChange={(e) => updateQuestion(qi, "correct", e.target.value)}
                  className={inputClass}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
                  Explanation (optional)
                </label>
                <input
                  value={q.explanation}
                  onChange={(e) =>
                    updateQuestion(qi, "explanation", e.target.value)
                  }
                  placeholder="Why is this the correct answer?"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--cd-tertiary)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Create Scenario
        </button>
      </div>
    </form>
  );
}
