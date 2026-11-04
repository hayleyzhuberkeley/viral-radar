import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { FormatGrid } from "@/components/format-card";
import { ViewTabs } from "@/components/view-tabs";
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

        <ViewTabs current="/" />

        {formats.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-16 text-center">
            <p className="text-sm text-muted">Log the first format you want to track.</p>
            <Link href="/formats/new" className="btn-quiet mt-4 inline-block">
              Add format
            </Link>
          </div>
        ) : (
          <FormatGrid formats={formats} />
        )}
      </main>
    </>
  );
}
