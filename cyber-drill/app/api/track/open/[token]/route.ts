import { createAdminClient } from "@/lib/supabase/admin";

// 1x1 transparent GIF
const GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: recipient } = await admin
    .from("phishing_recipients")
    .select("id")
    .eq("tracking_token", token)
    .single();

  if (recipient) {
    const forwarded = req.headers.get("x-forwarded-for") ?? "";
    const ip = forwarded.split(",")[0].trim() || null;
    // fire-and-forget — don't await to keep response fast
    admin.from("phishing_events").insert({
      recipient_id: recipient.id,
      event_type: "open",
      user_agent: req.headers.get("user-agent"),
      ip_address: ip,
    });
  }

  return new Response(GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
