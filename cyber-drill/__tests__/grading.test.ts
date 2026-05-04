/**
 * TC-3: Grading Logic Tests
 * Tests for the gradeAnswers function that calculates quiz scores.
 */

import { describe, it, expect } from "vitest";
import { gradeAnswers } from "@/lib/scenarios/queries";

describe("TC-3: gradeAnswers", () => {
  it("returns a perfect score when all answers are correct", () => {
    const result = gradeAnswers(["A", "B", "C"], ["A", "B", "C"], 100);

    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(3);
    expect(result.totalQuestions).toBe(3);
    expect(result.results.every((r) => r.isCorrect)).toBe(true);
  });

  it("returns zero when all answers are wrong", () => {
    const result = gradeAnswers(["A", "A", "A"], ["B", "C", "D"], 200);

    expect(result.score).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.totalQuestions).toBe(3);
    expect(result.results.every((r) => !r.isCorrect)).toBe(true);
  });

  it("calculates partial score correctly", () => {
    const result = gradeAnswers(["A", "B", "D"], ["A", "B", "C"], 300);

    expect(result.correctCount).toBe(2);
    expect(result.totalQuestions).toBe(3);
    // 2/3 * 300 = 200
    expect(result.score).toBe(200);
  });

  it("handles case-insensitive comparison", () => {
    const result = gradeAnswers(["a", "b", "c"], ["A", "B", "C"], 100);

    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(3);
  });

  it("handles whitespace in answers", () => {
    const result = gradeAnswers([" A ", " B"], ["A", "B"], 100);

    expect(result.correctCount).toBe(2);
    expect(result.score).toBe(100);
  });

  it("handles empty user answers array", () => {
    const result = gradeAnswers([], ["A", "B", "C"], 100);

    expect(result.score).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.totalQuestions).toBe(3);
  });

  it("handles missing answers (fewer user answers than questions)", () => {
    const result = gradeAnswers(["A"], ["A", "B", "C"], 150);

    expect(result.correctCount).toBe(1);
    expect(result.totalQuestions).toBe(3);
    expect(result.score).toBe(50); // 1/3 * 150 = 50
  });

  it("returns zero score when there are no questions", () => {
    const result = gradeAnswers([], [], 100);

    expect(result.score).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.totalQuestions).toBe(0);
  });

  it("includes correct result details for each question", () => {
    const result = gradeAnswers(["A", "C"], ["A", "B"], 100);

    expect(result.results).toHaveLength(2);

    expect(result.results[0].questionIndex).toBe(0);
    expect(result.results[0].userAnswer).toBe("A");
    expect(result.results[0].correctAnswer).toBe("A");
    expect(result.results[0].isCorrect).toBe(true);

    expect(result.results[1].questionIndex).toBe(1);
    expect(result.results[1].userAnswer).toBe("C");
    expect(result.results[1].correctAnswer).toBe("B");
    expect(result.results[1].isCorrect).toBe(false);
  });

  it("rounds scores correctly for non-even divisions", () => {
    // 1/3 * 100 = 33.33 -> should round to 33
    const result = gradeAnswers(["A", "B", "C"], ["A", "X", "X"], 100);

    expect(result.correctCount).toBe(1);
    expect(result.score).toBe(33);
  });

  it("handles single question scenario", () => {
    const result = gradeAnswers(["D"], ["D"], 350);

    expect(result.score).toBe(350);
    expect(result.correctCount).toBe(1);
    expect(result.totalQuestions).toBe(1);
  });
});
