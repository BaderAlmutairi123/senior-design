import { randomBytes } from "crypto";

export function generateTrackingToken(): string {
  return randomBytes(24).toString("base64url");
}

export function buildPixelUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/api/track/open/${token}`;
}

export function buildClickUrl(token: string, targetUrl: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/api/track/click/${token}?u=${encodeURIComponent(targetUrl)}`;
}
