import { AppHeader } from "@/components/app-header";
import { ImportForm } from "@/components/import-form";
import { requireUser } from "@/lib/auth";
import { COLUMNS } from "@/lib/import";

export const metadata = { title: "Import" };

export default async function ImportPage() {
  const user = await requireUser();

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold">Import from CSV</h1>
        <p className="mb-8 mt-1 text-sm text-muted">
          Each row becomes a format. Rows with a problem are skipped and listed with the reason. A name you already have
          is skipped, so uploading the same file twice adds nothing.
        </p>

        <ImportForm />

        <section className="mt-10">
          <h2 className="text-sm font-semibold">Columns</h2>
          <p className="mt-2 text-sm text-muted">
            The first line of the file is the header. <span className="text-foreground">name</span> and{" "}
            <span className="text-foreground">example_url</span> are required. Put several verticals in one cell,
            separated by semicolons.
          </p>
          <p className="mt-3 flex flex-wrap gap-1.5">
            {Object.keys(COLUMNS).map((column) => (
              <code key={column} className="tag font-mono">
                {column}
              </code>
            ))}
          </p>
        </section>
      </main>
    </>
  );
}
