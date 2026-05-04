"use client";

import { useState, useTransition } from "react";
import { sendCampaign } from "@/lib/phishing/actions";

export default function SendButton({ campaignId }: { campaignId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSend() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await sendCampaign(campaignId);
      if (!res.ok) {
        setError(res.error ?? "Failed to send");
      } else {
        setResult({ sent: res.sent, failed: res.failed });
      }
    });
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <button
        onClick={handleSend}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--cd-primary)] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
            Sending…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base">send</span>
            Send Campaign
          </>
        )}
      </button>
      {result && (
        <p className="text-sm text-[#a2f31f]">
          Sent {result.sent} · Failed {result.failed}
        </p>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
