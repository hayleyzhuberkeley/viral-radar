import Link from "next/link";

const TABS = [
  { href: "/", label: "All" },
  { href: "/starred", label: "Starred" },
] as const;

export function ViewTabs({ current }: { current: "/" | "/starred" }) {
  return (
    <nav aria-label="Views" className="mt-6 flex gap-1 border-b border-border text-sm">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.href === current ? "page" : undefined}
          className="-mb-px border-b-2 border-transparent px-3 py-2 text-muted hover:text-foreground aria-[current=page]:border-accent aria-[current=page]:text-foreground"
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
