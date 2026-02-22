import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isDemoMode()) {
    return <>{children}</>;
  }

  const supabase = await createClient();
  if (!supabase) {
    redirect("/login");
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
