"use client";

import { useState } from "react";
import { submitFeedback } from "./actions";

interface FeedbackFormProps {
  scenarios: { id: string; title: string }[];
}

const categories = [
  { value: "general", label: "General", icon: "chat" },
  { value: "scenario_content", label: "Scenario Content", icon: "description" },
  { value: "ui_experience", label: "UI / UX", icon: "brush" },
  { value: "difficulty", label: "Difficulty", icon: "speed" },
  { value: "suggestion", label: "Suggestion", icon: "lightbulb" },
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
      <div className="bg-[#111318] border border-[#23262c] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-[#a2f31f]/10 border border-[#a2f31f]/30">
          <span className="material-symbols-outlined text-[#a2f31f] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="text-xl font-headline font-bold text-[#f6f6fc]">Transmission Received</h2>
        <p className="mt-2 text-[#aaabb0] text-sm">
          Your feedback has been logged to the system. Thank you for contributing to the improvement of CyberDrill.
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
          className="mt-6 px-6 py-3 bg-[#1d2025] border border-[#23262c] text-[#aaabb0] font-headline text-xs uppercase tracking-widest hover:border-[#8ff5ff]/30 hover:text-[#f6f6fc] transition-all"
        >
          Submit More Feedback
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#111318] border border-[#23262c] overflow-hidden">
      {/* Rating */}
      <div className="p-6 border-b border-[#23262c]">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#8ff5ff] mb-4">
          Operator Rating
        </label>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <span
                className={`material-symbols-outlined text-3xl transition-colors ${
                  star <= (hoverRating || rating) ? "text-[#a2f31f]" : "text-[#23262c]"
                }`}
                style={{ fontVariationSettings: star <= (hoverRating || rating) ? "'FILL' 1" : "'FILL' 0" }}
              >
                star
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-xs font-mono text-[#aaabb0]">
            {["", "POOR", "FAIR", "GOOD", "VERY_GOOD", "EXCELLENT"][rating]}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="p-6 border-b border-[#23262c]">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#8ff5ff] mb-4">
          Feedback Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-headline uppercase tracking-widest border transition-all ${
                category === cat.value
                  ? "border-[#8ff5ff]/40 bg-[#8ff5ff]/10 text-[#8ff5ff]"
                  : "border-[#23262c] bg-[#0c0e12] text-[#aaabb0] hover:border-[#46484d] hover:text-[#f6f6fc]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario selector */}
      <div className="p-6 border-b border-[#23262c]">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#8ff5ff] mb-3">
          Related Scenario <span className="text-[#46484d]">(optional)</span>
        </label>
        <select
          value={scenarioId}
          onChange={(e) => setScenarioId(e.target.value)}
          className="w-full bg-[#0c0e12] border border-[#23262c] px-4 py-3 text-sm text-[#f6f6fc] outline-none focus:border-[#8ff5ff]/40 focus:ring-0"
        >
          <option value="">No specific scenario</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div className="p-6 border-b border-[#23262c]">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#8ff5ff] mb-3">
          Feedback Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your operational feedback, suggestions, or observations..."
          rows={5}
          className="w-full resize-none bg-[#0c0e12] border border-[#23262c] px-4 py-3 text-sm text-[#f6f6fc] placeholder-[#46484d] outline-none focus:border-[#8ff5ff]/40 focus:ring-0"
        />
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-[#ff716c]/10 border border-[#ff716c]/20">
          <p className="text-sm text-[#ff716c] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </p>
        </div>
      )}

      <div className="p-6">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#a2f31f] text-[#294300] font-headline font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(162,243,31,0.3)] active:scale-[0.98]"
        >
          {submitting ? "Transmitting..." : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
}
