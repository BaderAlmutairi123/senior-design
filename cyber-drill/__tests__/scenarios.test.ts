/**
 * TC-4: Scenario Data Validation Tests
 * Tests to validate the structure and integrity of scenario seed data.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

// Parse SQL INSERT VALUES to extract scenario data for validation
function loadSQLFile(filename: string): string {
  return readFileSync(join(__dirname, "..", "supabase", filename), "utf-8");
}

describe("TC-4: Scenario Data Validation", () => {
  const seedFile = loadSQLFile("seed-scenarios.sql");
  const batch2File = loadSQLFile("seed-scenarios-batch2.sql");
  const batch3File = loadSQLFile("seed-scenarios-batch3.sql");

  describe("seed-scenarios.sql (original 5 scenarios)", () => {
    it("contains exactly 5 scenario inserts", () => {
      // Count the number of opening parentheses that start a VALUES tuple
      const matches = seedFile.match(/^\(/gm);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(5);
    });

    it("includes all required scenario types", () => {
      expect(seedFile).toContain("'phishing_email'");
      expect(seedFile).toContain("'vishing'");
      expect(seedFile).toContain("'smishing'");
      expect(seedFile).toContain("'pretexting'");
      expect(seedFile).toContain("'baiting'");
    });

    it("includes all difficulty levels", () => {
      expect(seedFile).toContain("'beginner'");
      expect(seedFile).toContain("'intermediate'");
      expect(seedFile).toContain("'advanced'");
    });

    it("has valid points values (positive integers)", () => {
      const pointsMatches = seedFile.match(/(\d+),\s*\n\s*(\d+)\s*\)/g);
      expect(pointsMatches).not.toBeNull();
      for (const match of pointsMatches!) {
        const nums = match.match(/\d+/g);
        expect(nums).not.toBeNull();
        for (const num of nums!) {
          expect(parseInt(num)).toBeGreaterThan(0);
        }
      }
    });

    it("has correct_answers for each scenario in proper JSON format", () => {
      const answerMatches = seedFile.match(/'{"answers":\s*\[.*?\]}'::jsonb/g);
      expect(answerMatches).not.toBeNull();
      expect(answerMatches!.length).toBe(5);
    });
  });

  describe("seed-scenarios-batch2.sql (4 new scenarios)", () => {
    it("contains exactly 4 scenario inserts", () => {
      const matches = batch2File.match(/^\(/gm);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(4);
    });

    it("has correct_answers for each scenario", () => {
      const answerMatches = batch2File.match(/'{"answers":\s*\[.*?\]}'::jsonb/g);
      expect(answerMatches).not.toBeNull();
      expect(answerMatches!.length).toBe(4);
    });

    it("includes explanations for all scenarios", () => {
      const explanationMatches = batch2File.match(/"explanations"/g);
      expect(explanationMatches).not.toBeNull();
      expect(explanationMatches!.length).toBe(4);
    });

    it("contains the expected scenario titles", () => {
      expect(batch2File).toContain("Spear Phishing: Targeted Email Attacks");
      expect(batch2File).toContain("Watering Hole Attack Awareness");
      expect(batch2File).toContain("Tailgating and Physical Social Engineering");
      expect(batch2File).toContain("CEO Fraud and Business Email Compromise");
    });
  });

  describe("seed-scenarios-batch3.sql (6 new scenarios)", () => {
    it("contains exactly 6 scenario inserts", () => {
      const matches = batch3File.match(/^\(/gm);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(6);
    });

    it("has correct_answers for each scenario", () => {
      const answerMatches = batch3File.match(/'{"answers":\s*\[.*?\]}'::jsonb/g);
      expect(answerMatches).not.toBeNull();
      expect(answerMatches!.length).toBe(6);
    });

    it("includes explanations for all scenarios", () => {
      const explanationMatches = batch3File.match(/"explanations"/g);
      expect(explanationMatches).not.toBeNull();
      expect(explanationMatches!.length).toBe(6);
    });

    it("contains the expected scenario titles", () => {
      expect(batch3File).toContain("Phishing Link Analysis");
      expect(batch3File).toContain("Quid Pro Quo Attack");
      expect(batch3File).toContain("Social Media Phishing and Impersonation");
      expect(batch3File).toContain("Shoulder Surfing and Eavesdropping");
      expect(batch3File).toContain("Insider Threat Detection");
      expect(batch3File).toContain("Evil Twin Wi-Fi Attack");
    });
  });

  describe("Explanation SQL files", () => {
    const originalExplanations = loadSQLFile("update-scenario-explanations.sql");
    const remainingExplanations = loadSQLFile("update-remaining-explanations.sql");

    it("original file covers 2 scenarios (Phishing Email, Vishing)", () => {
      expect(originalExplanations).toContain("Phishing Email Detection");
      expect(originalExplanations).toContain("Vishing: Voice Phishing Attack");
    });

    it("remaining file covers 3 scenarios (Smishing, Pretexting, Baiting)", () => {
      expect(remainingExplanations).toContain("SMS Phishing (Smishing) Awareness");
      expect(remainingExplanations).toContain("Pretexting: Social Engineering Deception");
      expect(remainingExplanations).toContain("Baiting: USB Drop & Download Traps");
    });

    it("all 5 original scenarios have explanations across both files", () => {
      const combined = originalExplanations + remainingExplanations;
      const updateCount = (combined.match(/UPDATE scenarios/g) || []).length;
      expect(updateCount).toBe(5);
    });
  });

  describe("Total scenario count", () => {
    it("all SQL files together produce 15 total scenarios", () => {
      const seed1Count = (seedFile.match(/^\(/gm) || []).length;
      const seed2Count = (batch2File.match(/^\(/gm) || []).length;
      const seed3Count = (batch3File.match(/^\(/gm) || []).length;

      expect(seed1Count + seed2Count + seed3Count).toBe(15);
    });
  });
});
