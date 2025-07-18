"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "~/lib/supabase";

export async function logout() {
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/en/login");
}
