/**
 * TC-6: Load Test — 20 concurrent users
 *
 * Usage:
 *   npx tsx scripts/load-test.ts [BASE_URL]
 *
 * Default BASE_URL: http://localhost:3000
 *
 * Simulates 20 concurrent users each hitting the public-facing scenario list
 * endpoint (/scenarios) and the home page, then reports timing statistics.
 * A run is considered passing when:
 *   - All 20 requests complete (0 network errors)
 *   - p95 response time is under 3 000 ms
 *   - No response returns a 5xx status code
 */

const BASE_URL = process.argv[2] ?? "http://localhost:3000";
const CONCURRENT_USERS = 20;
const P95_THRESHOLD_MS = 3000;

interface RequestResult {
  url: string;
  status: number;
  durationMs: number;
  error?: string;
}

async function fetchTimed(url: string): Promise<RequestResult> {
  const start = performance.now();
  try {
    const res = await fetch(url, { redirect: "follow" });
    return { url, status: res.status, durationMs: Math.round(performance.now() - start) };
  } catch (err) {
    return {
      url,
      status: 0,
      durationMs: Math.round(performance.now() - start),
      error: (err as Error).message,
    };
  }
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function runLoadTest() {
  console.log(`\nTC-6 Load Test — ${CONCURRENT_USERS} concurrent users`);
  console.log(`Target: ${BASE_URL}\n`);

  // Each simulated user hits both the home page and the scenarios list
  const requests = Array.from({ length: CONCURRENT_USERS }, (_, i) =>
    i % 2 === 0
      ? fetchTimed(`${BASE_URL}/`)
      : fetchTimed(`${BASE_URL}/scenarios`)
  );

  const start = performance.now();
  const results = await Promise.all(requests);
  const totalMs = Math.round(performance.now() - start);

  const durations = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const errors = results.filter((r) => r.error || r.status >= 500);
  const p50 = percentile(durations, 50);
  const p95 = percentile(durations, 95);
  const p99 = percentile(durations, 99);

  console.log("Results per request:");
  for (const r of results) {
    const tag = r.error ? "ERR" : r.status >= 500 ? "5xx" : r.status >= 400 ? "4xx" : " ok";
    console.log(`  [${tag}] ${r.status} ${r.durationMs}ms  ${r.url}${r.error ? ` — ${r.error}` : ""}`);
  }

  console.log("\nSummary:");
  console.log(`  Total wall time : ${totalMs}ms`);
  console.log(`  Requests        : ${results.length}`);
  console.log(`  Errors (net/5xx): ${errors.length}`);
  console.log(`  Min / p50 / p95 / p99 / Max`);
  console.log(`  ${durations[0]}ms / ${p50}ms / ${p95}ms / ${p99}ms / ${durations[durations.length - 1]}ms`);

  const passed = errors.length === 0 && p95 <= P95_THRESHOLD_MS;
  console.log(`\n${passed ? "✓ PASS" : "✗ FAIL"} — p95=${p95}ms (threshold=${P95_THRESHOLD_MS}ms), errors=${errors.length}`);

  process.exit(passed ? 0 : 1);
}

runLoadTest();
