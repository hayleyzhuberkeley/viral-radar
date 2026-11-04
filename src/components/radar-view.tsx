import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { FindBar } from "@/components/find-bar";
import { FormatGrid } from "@/components/format-card";
import { Guide } from "@/components/guide";
import { ViewTabs } from "@/components/view-tabs";
import { requireUser } from "@/lib/auth";
import { applyFind, isFiltering, readFind } from "@/lib/find";
import { listFormats, listVerticals } from "@/lib/formats";
import { guideSteps } from "@/lib/guide";

type Props = {
  view: "/" | "/starred";
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** The list page. "All" and "Starred" are the same page with a different starting set. */
export async function RadarView({ view, searchParams }: Props) {
  const user = await requireUser();
  const starredOnly = view === "/starred";
  const [everything, verticals, params] = await Promise.all([listFormats(), listVerticals(), searchParams]);
  const all = starredOnly ? everything.filter((f) => f.starred) : everything;

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

        {!starredOnly && <Guide steps={guideSteps(everything)} />}

        <ViewTabs current={view} />

        {all.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm text-muted">
              {starredOnly
                ? "Tap the ☆ on any format to keep it here."
                : "Your radar is empty. Start with step 1 above, or bring in a spreadsheet you already have."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href={starredOnly ? "/" : "/formats/new"} className="btn-quiet">
                {starredOnly ? "See all formats" : "Add format"}
              </Link>
              {!starredOnly && (
                <Link href="/import" className="btn-quiet">
                  Import a CSV
                </Link>
              )}
            </div>
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
