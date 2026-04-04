"use client";

import { useState } from "react";
import { submitFeedback } from "./actions";

interface FeedbackFormProps {
  scenarios: { id: string; title: string }[];
}

const categories = [
  { value: "general", label: "General Feedback" },
  { value: "scenario_content", label: "Scenario Content" },
  { value: "ui_experience", label: "UI / Experience" },
  { value: "difficulty", label: "Difficulty Level" },
  { value: "suggestion", label: "Suggestion" },
];

export default function FeedbackForm({ scenarios }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [scenarioId, setScenarioId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter your feedback message.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await submitFeedback(
      scenarioId || null,
      rating,
      category,
      message
    );

    if (!result.success) {
      setError(result.error || "Something went wrong.");
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-100">Thank You!</h2>
        <p className="mt-2 text-zinc-400">
          Your feedback has been submitted successfully. We appreciate your input in improving CyberDrill.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setRating(0);
            setCategory("general");
            setScenarioId("");
            setMessage("");
          }}
          className="mt-6 rounded-xl border border-zinc-800 px-6 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
        >
          Submit More Feedback
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-8">
      {/* Rating */}
      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-zinc-300">
          How would you rate your experience?
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <svg
                className={`h-10 w-10 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-amber-400"
                    : "text-zinc-700"
                }`}
                fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                />
              </svg>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-xs text-zinc-500">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Feedback Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${
                category === cat.value
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario selector (optional) */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Related Scenario <span className="text-zinc-600">(optional)</span>
        </label>
        <select
          value={scenarioId}
          onChange={(e) => setScenarioId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300 outline-none transition-colors focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
        >
          <option value="">No specific scenario</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div className="mb-8">
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Your Feedback
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you think, what could be improved, or any suggestions you have..."
          rows={5}
          className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 outline-none transition-colors focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
      >
        {submitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
