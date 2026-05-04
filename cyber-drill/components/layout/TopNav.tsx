import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

interface TopNavProps {
  email: string;
}

export default function TopNav({ email }: TopNavProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 bg-[var(--cd-surface)]/80 backdrop-blur-xl border-b border-[var(--cd-primary)]/10">
      <Link href="/" className="font-headline uppercase tracking-tighter text-lg text-[var(--cd-primary)]">
        CyberDrill
      </Link>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="text-sm text-[var(--cd-on-surface-variant)]">{email}</span>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm text-[var(--cd-on-surface-variant)] hover:text-[var(--cd-primary)] transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
