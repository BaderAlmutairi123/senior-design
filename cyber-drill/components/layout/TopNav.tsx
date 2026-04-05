import Link from "next/link";

interface TopNavProps {
  email: string;
}

export default function TopNav({ email }: TopNavProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 bg-[#0c0e12]/80 backdrop-blur-xl border-b border-[#8ff5ff]/10">
      <Link href="/" className="font-headline uppercase tracking-tighter text-lg text-[#8ff5ff]">
        CyberDrill
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-sm text-[#aaabb0]">{email}</span>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm text-[#aaabb0] hover:text-[#8ff5ff] transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
