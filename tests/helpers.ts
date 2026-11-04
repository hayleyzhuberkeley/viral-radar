import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";

export type Who = "A" | "B";

export function account(who: Who) {
  const email = process.env[`TEST_USER_${who}_EMAIL`];
  const password = process.env[`TEST_USER_${who}_PASSWORD`];
  if (!email || !password) {
    throw new Error(`Set TEST_USER_${who}_EMAIL and TEST_USER_${who}_PASSWORD in .env.test.local`);
  }
  return { email, password };
}

/** A Supabase client signed in as a test user. Creates the account on first use. */
export async function apiAs(who: Who): Promise<SupabaseClient> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const creds = account(who);
  const { error } = await supabase.auth.signInWithPassword(creds);
  if (error) {
    const signUp = await supabase.auth.signUp(creds);
    if (signUp.error || !signUp.data.session) {
      throw new Error(`Could not sign in or sign up test user ${who}: ${signUp.error?.message ?? "no session"}`);
    }
  }
  return supabase;
}

/** Log in through the real login page, the way a person would. */
export async function logInAs(page: Page, who: Who) {
  const { email, password } = account(who);
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("main").getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Your radar" })).toBeVisible();
}
