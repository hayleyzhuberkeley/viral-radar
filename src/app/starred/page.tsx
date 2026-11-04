import { RadarView } from "@/components/radar-view";

export const metadata = { title: "Starred" };

export default function StarredPage({ searchParams }: PageProps<"/starred">) {
  return <RadarView view="/starred" searchParams={searchParams} />;
}
