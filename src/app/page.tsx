import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { StatusDot } from "@/components/status-dot";
import { requireUser } from "@/lib/auth";
import { listFormats } from "@/lib/formats";

export default async function HomePage() {
  const user = await requireUser();
  const formats = await listFormats();

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Your radar</h1>
            <p className="mt-1 text-sm text-muted">
              {formats.length === 0
                ? "Nothing logged yet."
                : `${formats.length} ${formats.length === 1 ? "format" : "formats"}`}
            </p>
          </div>
          <Link href="/formats/new" className="btn-primary">
            Add format
          </Link>
        </div>

        {formats.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-16 text-center">
            <p className="text-sm text-muted">Log the first format you want to track.</p>
            <Link href="/formats/new" className="btn-quiet mt-4 inline-block">
              Add format
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="format-list">
            {formats.map((format) => (
              <li key={format.id}>
                <Link href={`/formats/${format.id}`} className="card flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusDot status={format.trend_status} />
                    {format.creative_type && <span className="text-xs text-muted">{format.creative_type}</span>}
                  </div>
                  <h2 className="text-base font-semibold leading-snug">{format.name}</h2>
                  {format.hook && <p className="line-clamp-3 text-sm text-muted">{format.hook}</p>}
                  {format.verticals.length > 0 && (
                    <p className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {format.verticals.map((v) => (
                        <span key={v.id} className="tag">
                          {v.name}
                        </span>
                      ))}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
