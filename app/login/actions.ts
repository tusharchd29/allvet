"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSession } from "@/lib/session";

export async function loginWithPin(pin: string) {
  const { data: user, error } = await supabaseAdmin
    .from("av_users")
    .select("id, name, role, active")
    .eq("pin", pin)
    .eq("active", true)
    .maybeSingle();

  if (error || !user) {
    return { ok: false as const, message: "That PIN wasn't recognized." };
  }

  await createSession({
    userId: user.id,
    name: user.name,
    role: user.role === "owner" ? "owner" : "rep",
  });

  redirect("/dashboard");
}
