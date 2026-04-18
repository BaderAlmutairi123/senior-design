"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", icon: "dashboard", href: "/admin" },
  { label: "Users", icon: "group", href: "/admin/users" },
  { label: "Scenarios", icon: "precision_manufacturing", href: "/admin/scenarios" },
  { label: "Organizations", icon: "corporate_fare", href: "/admin/organizations" },
  { label: "Feedback", icon: "rate_review", href: "/admin/feedback" },
];

export default function AdminSidebar() {
  const pathname = usePathname() ?? "/admin";

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-[var(--cd-surface)] border-r border-[var(--cd-primary)]/10 flex flex-col">
      {/* Admin badge */}
      <div className="px-6 py-6 border-b border-[var(--cd-primary)]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--cd-tertiary)]/10 flex items-center justify-center rounded-lg">
            <span className="material-symbols-outlined text-[var(--cd-tertiary)] text-xl">
              admin_panel_settings
            </span>
          </div>
          <div>
            <p className="text-sm font-headline uppercase tracking-widest text-[var(--cd-on-surface)]">
              Admin Panel
            </p>
            <p className="text-xs text-[var(--cd-on-surface-variant)]">Platform Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-2.5 text-xs font-headline uppercase tracking-widest transition-colors ${
                    isActive
                      ? "text-[var(--cd-tertiary)] border-l-4 border-[var(--cd-tertiary)] bg-[var(--cd-tertiary)]/10 pl-5"
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

      {/* Back to app */}
      <div className="p-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--cd-primary)]/10 text-[var(--cd-primary)] font-headline uppercase tracking-widest text-xs rounded hover:bg-[var(--cd-primary)]/20 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to App
        </Link>
      </div>
    </aside>
  );
}
