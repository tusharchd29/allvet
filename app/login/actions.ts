"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginWithPin(pin: string): Promise<{ error: string } | void> {
  if (!/^\d{4,6}$/.test(pin)) {
    return { error: "Enter your 4-6 digit PIN." };
  }

  const { data: user, error } = await supabaseAdmin
    .from("av_users")
    .select("id, name, role, pin")
    .eq("pin", pin)
    .eq("active", true)
    .maybeSingle();

  if (error || !user) {
    return { error: "That PIN wasn't recognized. Try again." };
  }

  await createSession({ userId: user.id, name: user.name, role: user.role });
  redirect("/dashboard");
}
