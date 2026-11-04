import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { FindBar } from "@/components/find-bar";
import { FormatGrid } from "@/components/format-card";
import { ViewTabs } from "@/components/view-tabs";
import { requireUser } from "@/lib/auth";
import { applyFind, isFiltering, readFind } from "@/lib/find";
import { listFormats, listVerticals } from "@/lib/formats";

type Props = {
  view: "/" | "/starred";
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** The list page. "All" and "Starred" are the same page with a different starting set. */
export async function RadarView({ view, searchParams }: Props) {
  const user = await requireUser();
  const starredOnly = view === "/starred";
  const [all, verticals, params] = await Promise.all([listFormats({ starredOnly }), listVerticals(), searchParams]);

  const find = readFind(params);
  const filtering = isFiltering(find);
  const formats = applyFind(all, find);
  const noun = (n: number) => `${starredOnly ? "starred " : ""}${n === 1 ? "format" : "formats"}`;

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{starredOnly ? "Starred" : "Your radar"}</h1>
            <p className="mt-1 text-sm text-muted" data-testid="count">
              {all.length === 0
                ? starredOnly
                  ? "No starred formats yet."
                  : "Nothing logged yet."
                : filtering
                  ? `${formats.length} of ${all.length} ${noun(all.length)}`
                  : `${all.length} ${noun(all.length)}`}
            </p>
          </div>
          <Link href="/formats/new" className="btn-primary">
            Add format
          </Link>
        </div>

        <ViewTabs current={view} />

        {all.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-16 text-center">
            <p className="text-sm text-muted">
              {starredOnly ? "Tap the ☆ on any format to keep it here." : "Log the first format you want to track."}
            </p>
            <Link href={starredOnly ? "/" : "/formats/new"} className="btn-quiet mt-4 inline-block">
              {starredOnly ? "See all formats" : "Add format"}
            </Link>
          </div>
        ) : (
          <>
            <FindBar find={find} verticals={verticals} filtering={filtering} />
            {formats.length === 0 ? (
              <div className="mt-8 rounded-lg border border-dashed border-border px-6 py-12 text-center">
                <p className="text-sm text-muted">Nothing matches that search and those filters.</p>
              </div>
            ) : (
              <FormatGrid formats={formats} />
            )}
          </>
        )}
      </main>
    </>
  );
}
