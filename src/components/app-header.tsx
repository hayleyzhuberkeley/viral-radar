import Link from "next/link";
import { logOut } from "@/app/auth/actions";

export function AppHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-mono text-xs uppercase tracking-widest text-accent">
          Viral Radar
        </Link>
        <form action={logOut} className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted sm:inline">{email}</span>
          <button type="submit" className="btn-quiet">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
