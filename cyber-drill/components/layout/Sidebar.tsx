import Link from "next/link";

interface SidebarProps {
  activePath: string;
}

const navItems = [
  { label: "Dashboard", icon: "grid_view", href: "/" },
  { label: "Drills", icon: "precision_manufacturing", href: "/scenarios" },
  { label: "Skills", icon: "insights", href: "/progress" },
  { label: "Leaderboard", icon: "military_tech", href: "/progress" },
  { label: "Feedback", icon: "chat", href: "/feedback/submit" },
  { label: "Settings", icon: "settings", href: "#" },
];

export default function Sidebar({ activePath }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-[#0c0e12] border-r border-[#8ff5ff]/10 flex flex-col">
      {/* Operator identity */}
      <div className="px-6 py-6 border-b border-[#8ff5ff]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8ff5ff]/10 flex items-center justify-center clip-hex">
            <span className="material-symbols-outlined text-[#8ff5ff] text-xl">
              military_tech
            </span>
          </div>
          <div>
            <p className="text-sm font-headline uppercase tracking-widest text-[#e0e1e3]">
              Unit 01
            </p>
            <p className="text-xs text-[#aaabb0]">Elite Operator</p>
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
                      ? "text-[#a2f31f] border-l-4 border-[#a2f31f] bg-gradient-to-r from-[#a2f31f]/10 to-transparent pl-5"
                      : "text-[#aaabb0] hover:bg-[#1d2025] hover:text-[#8ff5ff]"
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

      {/* Initiate drill button */}
      <div className="p-4">
        <Link
          href="/scenarios"
          className="block w-full text-center py-3 bg-[#426900] text-[#a2f31f] font-headline uppercase tracking-widest text-xs rounded hover:bg-[#4d7a00] transition-colors"
        >
          Initiate Drill
        </Link>
      </div>
    </aside>
  );
}
