import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number, columns?: number }) {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="border-b border-border p-4 bg-muted/50 flex justify-between gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full max-w-[120px]" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex justify-between gap-4 items-center">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-2/3 mt-2" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
