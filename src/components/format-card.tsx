import Link from "next/link";
import { StarButton } from "@/components/star-button";
import { StatusDot } from "@/components/status-dot";
import type { FormatWithRelations } from "@/lib/formats";

export function FormatCard({ format }: { format: FormatWithRelations }) {
  return (
    <article className="card relative flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span
          className="font-mono text-lg font-semibold leading-none text-accent"
          title={format.score === null ? "No score yet" : "Composite score, 0 to 100"}
          data-testid="card-score"
        >
          {format.score === null ? <span className="text-muted">—</span> : format.score.toFixed(1)}
        </span>
        <StatusDot status={format.trend_status} />
        {/* Sits above the card-wide link so the star gets its own click. */}
        <div className="relative z-10 -my-1.5 -mr-1.5 ml-auto">
          <StarButton formatId={format.id} name={format.name} starred={format.starred} />
        </div>
      </div>
      <h2 className="text-base font-semibold leading-snug">
        <Link href={`/formats/${format.id}`} className="after:absolute after:inset-0 after:rounded-lg">
          {format.name}
        </Link>
      </h2>
      {format.creative_type && <p className="-mt-2 text-xs text-muted">{format.creative_type}</p>}
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
    </article>
  );
}

export function FormatGrid({ formats }: { formats: FormatWithRelations[] }) {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="format-list">
      {formats.map((format) => (
        <li key={format.id}>
          <FormatCard format={format} />
        </li>
      ))}
    </ul>
  );
}
