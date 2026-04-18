import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/roles";
import TopNav from "@/components/layout/TopNav";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect("/");
  }

  return (
    <>
      <TopNav email={user.email ?? ""} />
      <AdminSidebar />
      <main className="ml-64 pt-16 min-h-screen bg-[var(--cd-surface)]">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </>
  );
}
