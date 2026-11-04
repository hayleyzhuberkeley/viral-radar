import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Viral Radar</p>
      <h1 className="mt-2 text-2xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-muted">That page does not exist, or it is not yours to see.</p>
      <Link href="/" className="btn-quiet mt-6 self-start">
        Back to your radar
      </Link>
    </main>
  );
}
