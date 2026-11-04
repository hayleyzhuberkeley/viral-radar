"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Viral Radar</p>
      <h1 className="mt-2 text-2xl font-semibold">{isSignup ? "Create your account" : "Log in"}</h1>
      <p className="mt-1 text-sm text-muted">
        {isSignup ? "Your radar is private. Only you see what you log." : "Welcome back."}
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email ?? ""}
            className="field"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="field"
          />
          {isSignup && <span className="text-xs text-muted">At least 8 characters.</span>}
        </label>

        {state.error && (
          <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}
        {state.notice && (
          <p role="status" className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
            {state.notice}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "One moment…" : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="text-foreground underline underline-offset-4">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </main>
  );
}
