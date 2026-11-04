"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; notice?: string; email?: string };

const credentials = z.object({
  email: z.string().trim().min(1, "Enter your email.").email("That doesn't look like an email address."),
  password: z.string().min(8, "Use a password with at least 8 characters."),
});

function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Wrong email or password.";
  if (/already registered|already been registered/i.test(message)) {
    return "That email already has an account. Try logging in.";
  }
  if (/email not confirmed/i.test(message)) return "Confirm your email first. Check your inbox for the link.";
  return message;
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const parsed = credentials.safeParse({ email, password: formData.get("password") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);
  if (error) return { error: friendly(error.message), email };
  // With email confirmation on, Supabase returns no session until the link is clicked.
  if (!data.session) {
    return { notice: "Account created. Check your email for a confirmation link, then log in.", email };
  }
  redirect("/");
}

export async function logIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const parsed = credentials.safeParse({ email, password: formData.get("password") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: friendly(error.message), email };
  redirect("/");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
