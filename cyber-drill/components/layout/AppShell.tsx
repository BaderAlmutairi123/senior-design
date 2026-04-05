import TopNav from "./TopNav";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  email: string;
  activePath: string;
}

export default function AppShell({ children, email, activePath }: AppShellProps) {
  return (
    <>
      <TopNav email={email} />
      <Sidebar activePath={activePath} />
      <main className="ml-64 pt-16 min-h-screen bg-[#0c0e12]">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </>
  );
}
