const FROM =
  process.env.PHISHING_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendPhishingEmail(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ id: string } | { error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { error: "RESEND_API_KEY is not set" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, ...args }),
  });

  const data = (await res.json()) as { id?: string; message?: string };
  if (!res.ok) return { error: data.message ?? `Resend error ${res.status}` };
  return { id: data.id! };
}
