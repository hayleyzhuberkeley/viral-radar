import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { VerticalChart } from "@/components/vertical-chart";
import { requireUser } from "@/lib/auth";
import { listFormats, listVerticals } from "@/lib/formats";
import { summarize } from "@/lib/stats";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [formats, verticals] = await Promise.all([listFormats(), listVerticals()]);
  const summary = summarize(formats, verticals.map((v) => v.name));
  const month = new Date().toLocaleString("en-US", { month: "long", timeZone: "UTC" });

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Where your radar is thick and where it is thin.</p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Total formats" value={String(summary.total)} testId="stat-total" />
          <Stat
            label="Average score"
            value={summary.averageScore === null ? "—" : summary.averageScore.toFixed(1)}
            note={
              summary.scored === summary.total
                ? undefined
                : `From ${summary.scored} scored ${summary.scored === 1 ? "format" : "formats"}`
            }
            testId="stat-average"
          />
          <Stat
            label={`Hottest vertical in ${month}`}
            value={summary.hottestVertical?.name ?? "—"}
            note={
              summary.hottestVertical
                ? `${summary.hottestVertical.count} ${summary.hottestVertical.count === 1 ? "format" : "formats"} added`
                : "Nothing added this month"
            }
            testId="stat-hottest"
          />
        </dl>

        <section className="mt-10">
          <h2 className="text-sm font-semibold">Formats per vertical</h2>
          <p className="mt-1 text-xs text-muted">A format with two verticals counts once in each.</p>
          <div className="card mt-4">
            {summary.total === 0 ? (
              <p className="px-2 py-16 text-center text-sm text-muted">
                No formats yet.{" "}
                <Link href="/formats/new" className="underline underline-offset-4 hover:text-foreground">
                  Add your first one
                </Link>{" "}
                and the chart fills in.
              </p>
            ) : (
              <VerticalChart data={summary.perVertical} />
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function Stat({ label, value, note, testId }: { label: string; value: string; note?: string; testId: string }) {
  return (
    <div className="card">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-3xl font-semibold text-accent" data-testid={testId}>
        {value}
      </dd>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}
