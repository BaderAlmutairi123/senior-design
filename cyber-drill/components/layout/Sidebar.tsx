import Link from "next/link";

interface SidebarProps {
  activePath: string;
  isAdmin?: boolean;
}

const navItems = [
  { label: "Dashboard", icon: "grid_view", href: "/" },
  { label: "Drills", icon: "precision_manufacturing", href: "/scenarios" },
  { label: "Skills", icon: "insights", href: "/progress" },
  { label: "Leaderboard", icon: "leaderboard", href: "/progress" },
  { label: "Feedback", icon: "chat", href: "/feedback/submit" },
  { label: "Settings", icon: "settings", href: "#" },
];

export default function Sidebar({ activePath, isAdmin = false }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-[var(--cd-surface)] border-r border-[var(--cd-primary)]/10 flex flex-col">
      {/* User identity */}
      <div className="px-6 py-6 border-b border-[var(--cd-primary)]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--cd-primary)]/10 flex items-center justify-center clip-hex">
            <span className="material-symbols-outlined text-[var(--cd-primary)] text-xl">
              shield
            </span>
          </div>
          <div>
            <p className="text-sm font-headline uppercase tracking-widest text-[var(--cd-on-surface)]">
              CyberDrill
            </p>
            <p className="text-xs text-[var(--cd-on-surface-variant)]">Trainee</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activePath === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-2.5 text-xs font-headline uppercase tracking-widest transition-colors ${
                    isActive
                      ? "text-[var(--cd-secondary)] border-l-4 border-[var(--cd-secondary)] bg-[var(--cd-secondary)]/10 pl-5"
                      : "text-[var(--cd-on-surface-variant)] hover:bg-[var(--cd-surface-container-high)] hover:text-[var(--cd-primary)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="p-4 space-y-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--cd-tertiary)]/10 text-[var(--cd-tertiary)] font-headline uppercase tracking-widest text-xs rounded hover:bg-[var(--cd-tertiary)]/20 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Admin Panel
          </Link>
        )}
        <Link
          href="/scenarios"
          className="block w-full text-center py-3 bg-[var(--cd-secondary)]/15 text-[var(--cd-secondary)] font-headline uppercase tracking-widest text-xs rounded hover:bg-[var(--cd-secondary)]/25 transition-colors"
        >
          Start Drill
        </Link>
      </div>
    </aside>
  );
}
