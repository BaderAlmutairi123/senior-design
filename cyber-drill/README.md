This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase

This project is configured to use [Supabase](https://supabase.com) for database and auth.

1. Copy `.env.example` to `.env.local`.
2. Get your project URL and anon key from the [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **API** (or use **Connect** → **Next.js**).
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

**Usage:**

- **Client Components:** `import { createClient } from "@/lib/supabase/client"` and call `createClient()`.
- **Server Components / Server Actions / Route Handlers:** `import { createClient } from "@/lib/supabase/server"` and call `await createClient()`.

Middleware refreshes the auth session on each request so it stays in sync between server and client.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Phishing Simulation

Org owners and admins can run simulated phishing campaigns to test member awareness.

### Setup

Add the following to `.env.local` (see `.env.example`):

```
RESEND_API_KEY=re_...
PHISHING_FROM_EMAIL=onboarding@resend.dev
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run the migration in your Supabase dashboard:
```
supabase/add-phishing-campaigns.sql
```

### Sending emails

- **Dev / demo**: Use `PHISHING_FROM_EMAIL=onboarding@resend.dev` (Resend sandbox). Emails can only be delivered to the Resend account owner's address.
- **Production**: Verify your domain in Resend and set `PHISHING_FROM_EMAIL` to an address on that domain.

### Click-redirect allowlist

By default only links to `NEXT_PUBLIC_APP_URL` are allowed as click-tracking redirect targets. To allow additional hosts, set:
```
ALLOWED_REDIRECT_HOSTS=yourdomain.com,another.com
```

### Usage

Navigate to **My Organization → Phishing Sims**, create a campaign, choose a template and recipients, then click **Send Campaign** on the report page.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
