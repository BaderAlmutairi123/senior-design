import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingFlow from "./OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // If already onboarded, go home
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("onboarded")
    .eq("user_id", user.id)
    .single();

  if (roleData?.onboarded) {
    redirect("/");
  }

  return <OnboardingFlow />;
}
