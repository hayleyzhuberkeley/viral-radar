import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { FormatForm } from "@/components/format-form";
import { requireUser } from "@/lib/auth";
import { getFormat, listVerticals } from "@/lib/formats";
import { updateFormat } from "../../actions";

export const metadata = { title: "Edit format" };

export default async function EditFormatPage({ params }: PageProps<"/formats/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  const [format, verticals] = await Promise.all([getFormat(Number(id)), listVerticals()]);
  if (!format) notFound();

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="mb-8 text-2xl font-semibold">Edit format</h1>
        <FormatForm
          action={updateFormat.bind(null, format.id)}
          verticals={verticals}
          format={format}
          submitLabel="Save changes"
          cancelHref={`/formats/${format.id}`}
        />
      </main>
    </>
  );
}
