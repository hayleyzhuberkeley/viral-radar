import { RadarView } from "@/components/radar-view";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return <RadarView view="/" searchParams={searchParams} />;
}
