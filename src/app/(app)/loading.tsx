import { Skeleton } from "@/components/app/skeleton";

/** Shared loading UI for app routes. */
export default function Loading() {
  return (
    <div>
      <Skeleton style={{ height: 32, width: 220, marginBottom: 10 }} />
      <Skeleton style={{ height: 16, width: 320, marginBottom: 24 }} />
      <div className="metrics">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} style={{ height: 92, borderRadius: 16 }} />
        ))}
      </div>
      <Skeleton style={{ height: 160, borderRadius: 18, marginTop: 16 }} />
    </div>
  );
}
