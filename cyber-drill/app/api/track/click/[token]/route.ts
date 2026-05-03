import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_HOSTS = new Set(
  (process.env.ALLOWED_REDIRECT_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
);

function isAllowedTarget(rawUrl: string): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const target = new URL(rawUrl);
    const app = new URL(appUrl);
    if (target.hostname === app.hostname) return true;
    return ALLOWED_HOSTS.has(target.hostname);
  } catch {
    return false;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("u");

  if (!targetUrl || !isAllowedTarget(targetUrl)) {
    return new Response("Invalid redirect target", { status: 400 });
  }

  const admin = createAdminClient();

  const { data: recipient } = await admin
    .from("phishing_recipients")
    .select("id")
    .eq("tracking_token", token)
    .single();

  if (recipient) {
    const forwarded = req.headers.get("x-forwarded-for") ?? "";
    const ip = forwarded.split(",")[0].trim() || null;
    await admin.from("phishing_events").insert({
      recipient_id: recipient.id,
      event_type: "click",
      url: targetUrl,
      user_agent: req.headers.get("user-agent"),
      ip_address: ip,
    });
  }

  return Response.redirect(targetUrl, 302);
}
