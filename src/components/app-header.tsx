import Link from "next/link";
import { logOut } from "@/app/auth/actions";
import { MainNav } from "@/components/main-nav";

export function AppHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/" className="flex h-10 items-center font-mono text-xs uppercase tracking-widest text-accent">
            Viral Radar
          </Link>
          <MainNav />
        </div>
        <form action={logOut} className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted md:inline">{email}</span>
          <button type="submit" className="btn-quiet h-10">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
