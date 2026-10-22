import { GridSkeleton } from "@/components/shared/states";
export default function Loading() {
  return (
    <div className="container loading-page">
      <GridSkeleton />
    </div>
  );
}
