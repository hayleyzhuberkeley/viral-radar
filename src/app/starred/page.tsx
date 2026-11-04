import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { FormatGrid } from "@/components/format-card";
import { ViewTabs } from "@/components/view-tabs";
import { requireUser } from "@/lib/auth";
import { listFormats } from "@/lib/formats";

export const metadata = { title: "Starred" };

export default async function StarredPage() {
  const user = await requireUser();
  const formats = await listFormats({ starredOnly: true });

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Starred</h1>
            <p className="mt-1 text-sm text-muted">
              {formats.length === 0
                ? "No starred formats yet."
                : `${formats.length} starred ${formats.length === 1 ? "format" : "formats"}`}
            </p>
          </div>
          <Link href="/formats/new" className="btn-primary">
            Add format
          </Link>
        </div>

        <ViewTabs current="/starred" />

        {formats.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-16 text-center">
            <p className="text-sm text-muted">Tap the ☆ on any format to keep it here.</p>
            <Link href="/" className="btn-quiet mt-4 inline-block">
              See all formats
            </Link>
          </div>
        ) : (
          <FormatGrid formats={formats} />
        )}
      </main>
    </>
  );
}
