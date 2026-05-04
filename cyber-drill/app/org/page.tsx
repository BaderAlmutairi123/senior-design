import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserOrganizations } from "@/lib/organizations/queries";

export default async function OrgRedirectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgs = await getUserOrganizations(user.id);
  const managed = orgs.find((o) => o.role === "owner" || o.role === "admin");

  if (managed) {
    redirect(`/org/${managed.id}`);
  }

  redirect("/");
}
