import { AppHeader } from "@/components/app-header";
import { FormatForm } from "@/components/format-form";
import { requireUser } from "@/lib/auth";
import { listVerticals } from "@/lib/formats";
import { createFormat } from "../actions";

export const metadata = { title: "Add format" };

export default async function NewFormatPage() {
  const user = await requireUser();
  const verticals = await listVerticals();

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold">Add format</h1>
        <p className="mb-8 mt-1 text-sm text-muted">A name and one example link are required. Fill in the rest as you learn more.</p>
        <FormatForm action={createFormat} verticals={verticals} submitLabel="Save format" cancelHref="/" />
      </main>
    </>
  );
}
