import { requireUser } from "@/lib/auth";
import { logOut } from "./auth/actions";

export default async function HomePage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <header className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Viral Radar</p>
        <form action={logOut} className="flex items-center gap-3 text-sm">
          <span className="text-muted">{user.email}</span>
          <button type="submit" className="btn-quiet">
            Log out
          </button>
        </form>
      </header>

      <h1 className="mt-10 text-2xl font-semibold">Your radar</h1>
      <p className="mt-2 text-sm text-muted">You are signed in. Formats you log will appear here.</p>
    </main>
  );
}
