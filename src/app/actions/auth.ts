"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Verify the role. If they are not ops_admin, sign them right back out.
  if (data.user.user_metadata?.role !== "ops_admin") {
    await supabase.auth.signOut();
    return { error: "Access Denied: You do not have Ops Admin privileges." };
  }

  redirect("/ops/restaurants");
}
