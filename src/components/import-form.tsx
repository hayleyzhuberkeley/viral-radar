"use client";

import Link from "next/link";
import Papa from "papaparse";
import { useRef, useState } from "react";
import { importRows } from "@/app/import/actions";
import type { SkippedRow } from "@/lib/import";

const BATCH = 25;
const MAX_ROWS = 1000;

type Report = { imported: number; skipped: SkippedRow[]; total: number };

export function ImportForm() {
  const input = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  async function run() {
    const file = input.current?.files?.[0];
    setReport(null);
    setError("");
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }

    const parsed = await new Promise<Papa.ParseResult<Record<string, unknown>>>((resolve) =>
      Papa.parse<Record<string, unknown>>(file, { header: true, skipEmptyLines: "greedy", complete: resolve }),
    );
    const rows = parsed.data;
    if (rows.length === 0) {
      setError("That file has no rows under its header line.");
      return;
    }
    if (rows.length > MAX_ROWS) {
      setError(`That file has ${rows.length} rows. Import up to ${MAX_ROWS} at a time.`);
      return;
    }
    const headers = (parsed.meta.fields ?? []).map((h) => h.trim().toLowerCase());
    if (!headers.some((h) => ["name", "format", "format name", "title"].includes(h))) {
      setError('That file has no "name" column. Download the sample to see the expected headers.');
      return;
    }

    const total: Report = { imported: 0, skipped: [], total: rows.length };
    setProgress({ done: 0, total: rows.length });
    for (let start = 0; start < rows.length; start += BATCH) {
      // Row 1 of the file is the header, so the first data row is row 2.
      const result = await importRows(rows.slice(start, start + BATCH), start + 2);
      total.imported += result.imported;
      total.skipped.push(...result.skipped);
      if (result.error) {
        setError(`${result.error} Stopped at row ${start + 2}.`);
        break;
      }
      setProgress({ done: Math.min(start + BATCH, rows.length), total: rows.length });
    }
    setProgress(null);
    setReport(total);
    if (input.current) input.current.value = "";
    setFileName("");
  }

  const busy = progress !== null;

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          CSV file
          <input
            ref={input}
            type="file"
            accept=".csv,text/csv"
            disabled={busy}
            onChange={(e) => {
              setFileName(e.target.files?.[0]?.name ?? "");
              setError("");
            }}
            className="text-sm text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-sm file:text-foreground"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-primary" onClick={run} disabled={busy}>
            {busy ? `Importing ${progress.done} of ${progress.total}…` : fileName ? `Import ${fileName}` : "Import"}
          </button>
          <a href="/sample-import.csv" download className="text-sm text-muted underline underline-offset-4 hover:text-foreground">
            Download a sample CSV
          </a>
        </div>
        {error && (
          <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </div>

      {report && (
        <section aria-live="polite" data-testid="import-report">
          <h2 className="text-sm font-semibold">Result</h2>
          <p className="mt-2 text-sm">
            <span className="font-mono text-accent">{report.imported}</span> imported,{" "}
            <span className="font-mono">{report.skipped.length}</span> skipped, out of{" "}
            <span className="font-mono">{report.total}</span> rows.{" "}
            {report.imported > 0 && (
              <Link href="/" className="underline underline-offset-4 hover:text-accent">
                See your radar
              </Link>
            )}
          </p>
          {report.skipped.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 font-normal">Row</th>
                    <th className="px-3 py-2 font-normal">Name</th>
                    <th className="px-3 py-2 font-normal">Why it was skipped</th>
                  </tr>
                </thead>
                <tbody>
                  {report.skipped.map((s) => (
                    <tr key={s.row} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-mono">{s.row}</td>
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2 text-muted">{s.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
