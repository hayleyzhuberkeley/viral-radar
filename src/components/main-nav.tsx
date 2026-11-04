"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Radar", match: (p: string) => p === "/" || p === "/starred" || p.startsWith("/formats") },
  { href: "/dashboard", label: "Dashboard", match: (p: string) => p.startsWith("/dashboard") },
  { href: "/import", label: "Import", match: (p: string) => p.startsWith("/import") },
] as const;

/** Main navigation. Each item is a full-height button-sized target, and the current page is marked. */
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex items-center gap-1">
      {ITEMS.map((item) => {
        const current = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className="flex h-10 items-center rounded-md px-4 text-sm font-medium text-muted transition hover:bg-surface hover:text-foreground aria-[current=page]:bg-surface aria-[current=page]:text-foreground aria-[current=page]:shadow-[inset_0_-2px_0_var(--accent)]"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
