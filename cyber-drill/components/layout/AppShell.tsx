import TopNav from "./TopNav";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  email: string;
  activePath: string;
  isAdmin?: boolean;
  orgId?: string | null;
}

export default function AppShell({ children, email, activePath, isAdmin = false, orgId }: AppShellProps) {
  return (
    <>
      <TopNav email={email} />
      <Sidebar activePath={activePath} isAdmin={isAdmin} orgId={orgId} />
      <main className="ml-64 pt-16 min-h-screen bg-[var(--cd-surface)]">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </>
  );
}
