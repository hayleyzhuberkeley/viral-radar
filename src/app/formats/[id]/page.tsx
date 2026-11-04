import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { DeleteButton } from "@/components/delete-button";
import { StatusDot } from "@/components/status-dot";
import { requireUser } from "@/lib/auth";
import { getFormat } from "@/lib/formats";
import { deleteFormat } from "../actions";

export default async function FormatPage({ params }: PageProps<"/formats/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const format = await getFormat(Number(id));
  // Someone else's format looks exactly like one that does not exist.
  if (!format) notFound();

  const facts: [string, string | number | null][] = [
    ["Region", format.region],
    ["Heat", format.heat],
    ["New in 7 days", format.new_in_7_days],
    ["AI replicability", format.ai_replicable ? `${format.ai_replicable} / 5` : null],
    ["Ad value", format.ad_value ? `${format.ad_value} / 5` : null],
    ["First seen", format.first_seen],
  ];
  const sections: [string, string | null][] = [
    ["Mechanic", format.mechanic],
    ["Opening hook", format.hook],
    ["Why it works", format.why_works],
    ["Brand usage", format.brand_usage],
    ["Generation prompt", format.prompt],
    ["Swap rules", format.swaps],
  ];

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Your radar
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <StatusDot status={format.trend_status} />
              {format.creative_type && <span className="text-xs text-muted">{format.creative_type}</span>}
            </div>
            <h1 className="mt-2 text-2xl font-semibold">{format.name}</h1>
            {format.verticals.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-1.5">
                {format.verticals.map((v) => (
                  <span key={v.id} className="tag">
                    {v.name}
                  </span>
                ))}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/formats/${format.id}/edit`} className="btn-quiet">
              Edit
            </Link>
            <DeleteButton name={format.name} action={deleteFormat.bind(null, format.id)} />
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-6 sm:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-0.5 font-mono text-sm">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-8">
          <h2 className="text-sm font-semibold">Examples</h2>
          {format.examples.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No example link yet.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {format.examples.map((example) => (
                <li key={example.id} className="flex items-baseline gap-3 text-sm">
                  {example.platform && <span className="tag shrink-0">{example.platform}</span>}
                  <a href={example.url} target="_blank" rel="noreferrer" className="break-all underline underline-offset-4 hover:text-accent">
                    {example.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {sections
          .filter(([, body]) => body)
          .map(([title, body]) => (
            <section key={title} className="mt-8">
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">{body}</p>
            </section>
          ))}
      </main>
    </>
  );
}
