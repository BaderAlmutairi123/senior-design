import { describe, it, expect, beforeAll, afterAll } from "vitest";

// Set env before importing to avoid "APP_URL not set" issues
beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
});
afterAll(() => {
  delete process.env.NEXT_PUBLIC_APP_URL;
});

const { generateTrackingToken, buildPixelUrl, buildClickUrl } = await import(
  "@/lib/phishing/tokens"
);

const BASE64URL = /^[A-Za-z0-9_-]+$/;

describe("generateTrackingToken", () => {
  it("produces a base64url string", () => {
    const token = generateTrackingToken();
    expect(BASE64URL.test(token)).toBe(true);
  });

  it("produces tokens of at least 32 characters", () => {
    expect(generateTrackingToken().length).toBeGreaterThanOrEqual(32);
  });

  it("produces unique values across 1000 samples", () => {
    const tokens = new Set(Array.from({ length: 1000 }, generateTrackingToken));
    expect(tokens.size).toBe(1000);
  });
});

describe("buildPixelUrl", () => {
  it("returns an absolute URL containing the token", () => {
    const token = generateTrackingToken();
    const url = buildPixelUrl(token);
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain(token);
    expect(url).toContain("/api/track/open/");
  });
});

describe("buildClickUrl", () => {
  it("returns an absolute URL containing the token and encoded target", () => {
    const token = generateTrackingToken();
    const target = "https://example.com/scenarios";
    const url = buildClickUrl(token, target);
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain(token);
    expect(url).toContain("/api/track/click/");
    expect(url).toContain(encodeURIComponent(target));
  });
});
