import { ClassificationArchive } from "@/components/articles/archive/classification-archive";
import type { SearchParams } from "@/lib/utils/filters";

export function CategoryArchive(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  return <ClassificationArchive {...props} kind="category" />;
}
